
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

// Global update handler
let waitingWorker: ServiceWorker | null = null;

// Função chamada quando o usuário clica em "Atualizar"
window.updateApp = () => {
    if (waitingWorker) {
        console.log('[SW] User confirmed update. Sending SKIP_WAITING.');
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[SW] Registered with scope:', registration.scope);

        // Se já existe um worker esperando (atualização baixada mas não ativada)
        if (registration.waiting) {
            waitingWorker = registration.waiting;
            window.dispatchEvent(new Event('invest-update-available'));
        }

        registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
                installingWorker.onstatechange = () => {
                    // Se chegou no estado 'installed' e já existe um controlador,
                    // significa que é uma atualização esperando ação.
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        waitingWorker = installingWorker;
                        window.dispatchEvent(new Event('invest-update-available'));
                    }
                };
            }
        };
      })
      .catch(error => {
        console.warn('[SW] Registration failed:', error);
      });
      
    // Quando o novo worker assume o controle (após skipWaiting), recarregamos
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Controller changed, reloading...');
        window.location.reload();
    });
  });
}

declare global {
    interface Window {
        updateApp: () => void;
    }
}
