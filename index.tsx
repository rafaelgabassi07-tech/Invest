
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

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
    // Evita erros de origem cruzada em ambientes de preview
    const isPreviewEnv = window.location.hostname.includes('ai.studio') || 
                         window.location.hostname.includes('webcontainer') ||
                         window.location.hostname.includes('stackblitz');

    if (isPreviewEnv) {
      console.log('[SW] Service Worker ignorado no ambiente de preview.');
      return;
    }

    // Tenta registrar o SW, mas falha silenciosamente se o arquivo não existir (erro 404 comum em deploy sem pasta public)
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[SW] Registrado com sucesso:', registration.scope);
      })
      .catch((err) => {
        // Log apenas informativo, não erro, para não poluir o console do usuário
        console.info('[SW] Service Worker não registrado (possivelmente modo dev ou arquivo ausente na build):', err.message);
      });
  });
}
