
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
        console.log('[SW] Nenhum worker esperando atualização.');
        window.location.reload(); // Fallback
    }
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[SW] Registrado. Escopo:', registration.scope);

        // Caso 1: O navegador já baixou e o worker está esperando desde um load anterior
        if (registration.waiting) {
            waitingWorker = registration.waiting;
            window.dispatchEvent(new Event('invest-update-available'));
        }

        // Caso 2: Uma nova atualização foi encontrada agora
        registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
                installingWorker.onstatechange = () => {
                    // Se instalou com sucesso, mas ainda temos um controller ativo (app rodando)
                    // então ele entra em 'installed' (que é semanticamente 'waiting' para ativação)
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        waitingWorker = installingWorker;
                        window.dispatchEvent(new Event('invest-update-available'));
                    }
                };
            }
        };
      })
      .catch(error => console.warn('[SW] Falha no registro:', error));
      
    // Quando o novo worker assume (pós skipWaiting), recarregamos a página
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
