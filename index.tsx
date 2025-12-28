
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

// Variável para armazenar o worker que está esperando
let waitingWorker: ServiceWorker | null = null;
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

// Função global chamada pelo botão da notificação ou modal
window.updateApp = () => {
    if (waitingWorker) {
        console.log('[SW] Usuário confirmou atualização. Enviando SKIP_WAITING.');
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
        console.log('[SW] Nenhum worker esperando atualização. Recarregando forçado.');
        window.location.reload(); 
    }
};

// Função para checar atualizações manualmente (botão nos ajustes)
window.checkForUpdates = async () => {
    if (serviceWorkerRegistration) {
        console.log('[SW] Verificando atualizações manualmente...');
        try {
            await serviceWorkerRegistration.update();
            console.log('[SW] Verificação concluída.');
        } catch (e) {
            console.error('[SW] Erro ao verificar atualizações:', e);
        }
    } else {
        console.log('[SW] Service Worker não registrado ainda.');
    }
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[SW] Registrado com sucesso. Escopo:', registration.scope);
        serviceWorkerRegistration = registration;

        // Se já houver um worker esperando ativação
        if (registration.waiting) {
            waitingWorker = registration.waiting;
            window.dispatchEvent(new Event('invest-update-available'));
        }

        registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('[SW] Nova atualização disponível (instalada em background).');
                        waitingWorker = installingWorker;
                        window.dispatchEvent(new Event('invest-update-available'));
                    }
                };
            }
        };
      })
      .catch(error => {
        console.warn('[SW] Falha no registro:', error);
      });
      
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Não recarregamos automaticamente aqui para permitir que a UI de "Boot" (SystemUpdateOverlay) termine sua animação.
        // O SystemUpdateOverlay lidará com o reload.
        console.log('[SW] Controlador alterado (atualização aplicada).');
    });
  });
}

declare global {
    interface Window {
        updateApp: () => void;
        checkForUpdates: () => Promise<void>;
    }
}
