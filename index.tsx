
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

// Função global chamada pelo botão da notificação
window.updateApp = () => {
    if (waitingWorker) {
        console.log('[SW] Usuário confirmou atualização. Enviando SKIP_WAITING.');
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
        console.log('[SW] Nenhum worker esperando atualização. Recarregando forçado.');
        window.location.reload(); // Fallback
    }
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Registra o SW. O arquivo deve estar em public/service-worker.js
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[SW] Registrado com sucesso. Escopo:', registration.scope);

        // Se já houver um worker esperando ativação (atualização baixada mas não aplicada)
        if (registration.waiting) {
            waitingWorker = registration.waiting;
            window.dispatchEvent(new Event('invest-update-available'));
        }

        registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('[SW] Nova atualização disponível.');
                        waitingWorker = installingWorker;
                        window.dispatchEvent(new Event('invest-update-available'));
                    }
                };
            }
        };
      })
      .catch(error => {
        // Ignora erros comuns de desenvolvimento
        console.warn('[SW] Falha no registro:', error);
      });
      
    // Recarrega a página quando o novo SW assumir o controle
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Controlador alterado. Recarregando app...');
        window.location.reload();
    });
  });
}

declare global {
    interface Window {
        updateApp: () => void;
    }
}
