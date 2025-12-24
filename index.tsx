
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
    // Tenta registrar o SW apenas se estivermos em produção ou se o arquivo existir
    // O erro 404 ocorre se o arquivo não estiver na pasta 'public/' do Vite
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[SW] Registrado. Escopo:', registration.scope);

        if (registration.waiting) {
            waitingWorker = registration.waiting;
            window.dispatchEvent(new Event('invest-update-available'));
        }

        registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        waitingWorker = installingWorker;
                        window.dispatchEvent(new Event('invest-update-available'));
                    }
                };
            }
        };
      })
      .catch(error => {
        // Silencia erro comum de 404 em dev ou configuração incorreta de pasta
        if (error.message.includes('404') || error.message.includes('MIME')) {
            console.warn('[SW] Service Worker não encontrado ou tipo incorreto. Verifique se service-worker.js está na pasta public/.');
        } else {
            console.warn('[SW] Falha no registro:', error);
        }
      });
      
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
