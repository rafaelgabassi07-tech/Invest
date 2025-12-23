
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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Evita erros de origem cruzada em ambientes de preview como ai.studio ou stackblitz
    const isPreviewEnv = window.location.hostname.includes('ai.studio') || 
                         window.location.hostname.includes('webcontainer') ||
                         window.location.hostname.includes('stackblitz');

    if (isPreviewEnv) {
      console.log('[SW] Service Worker ignorado no ambiente de preview.');
      return;
    }

    navigator.serviceWorker.register('./service-worker.js').catch((err) => {
      // Usa log em vez de warn para não poluir o console com erros esperados
      console.log('[SW] Falha no registro (esperado em dev):', err.message);
    });
  });
}
