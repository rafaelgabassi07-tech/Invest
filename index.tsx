
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

// Diagnóstico de inicialização
console.log('%c[Invest Dashboard] Incializando aplicação...', 'color: #f59e0b; font-weight: bold;');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("[Invest Dashboard] CRÍTICO: Elemento #root não encontrado.");
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .then(registration => {
        console.log('[PWA] ServiceWorker ativo:', registration.scope);
      })
      .catch(error => {
        console.warn('[PWA] ServiceWorker não registrado (uso limitado offline):', error);
      });
  });
}
