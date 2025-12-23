
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
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

// Registro de Service Worker
const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;

  const ignoredHosts = ['ai.studio', 'webcontainer.io', 'stackblitz.io', 'localhost'];
  const isIgnored = ignoredHosts.some(host => window.location.hostname.includes(host));

  if (isIgnored) {
    console.log('[SW] Service Worker desativado neste ambiente de preview.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('[SW] Registrado com sucesso:', registration.scope);
  } catch (error) {
    console.info('[SW] Registro ignorado:', error);
  }
};

window.addEventListener('load', registerServiceWorker);
