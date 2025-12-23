
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

console.log('%c[Invest Dashboard] Iniciando...', 'color: #f59e0b; font-weight: bold;');

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// ==========================================
// Lógica de Service Worker & Atualização Manual
// ==========================================

let waitingWorker: ServiceWorker | null = null;

// Função chamada pela UI para disparar a atualização
window.updateApp = () => {
    if (waitingWorker) {
        console.log('[SW] Enviando comando SKIP_WAITING para o worker em espera.');
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
        // Fallback: se não houver worker esperando mas a UI pediu update, forçamos reload
        console.warn('[SW] Nenhum worker em espera encontrado. Recarregando forçado.');
        window.location.reload();
    }
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('[SW] Registrado com escopo:', registration.scope);

        // 1. Verifica se já existe um worker esperando (atualização baixada em sessão anterior)
        if (registration.waiting) {
            console.log('[SW] Atualização encontrada em estado WAITING.');
            waitingWorker = registration.waiting;
            window.dispatchEvent(new Event('invest-update-available'));
        }

        // 2. Monitora novas atualizações encontradas durante o uso
        registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
                installingWorker.onstatechange = () => {
                    // Quando o novo worker termina de instalar, ele entra em 'installed'.
                    // Se já existe um controller (app rodando), significa que é uma atualização.
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('[SW] Nova atualização instalada e pronta (WAITING).');
                        waitingWorker = installingWorker;
                        window.dispatchEvent(new Event('invest-update-available'));
                    }
                };
            }
        };

        // 3. Verifica atualizações periodicamente (a cada 1 hora)
        setInterval(() => {
            console.log('[SW] Verificando atualizações periodicamente...');
            registration.update();
        }, 60 * 60 * 1000);

    } catch (error) {
        console.error('[SW] Falha no registro:', error);
    }
      
    // 4. Quando o worker atual mudar (após o skipWaiting), recarregamos a página
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            console.log('[SW] Controlador alterado. Recarregando app agora.');
            refreshing = true;
            window.location.reload();
        }
    });
  });
}

declare global {
    interface Window {
        updateApp: () => void;
    }
}
