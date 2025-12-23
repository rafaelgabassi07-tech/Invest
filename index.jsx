
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
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

// Registro de Service Worker blindado para evitar erros em ambientes de preview
const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;

  // Lista de hosts onde o SW deve ser ignorado para evitar erros de CORS/404
  const ignoredHosts = ['ai.studio', 'webcontainer.io', 'stackblitz.io', 'localhost'];
  const isIgnored = ignoredHosts.some(host => window.location.hostname.includes(host));

  if (isIgnored) {
    console.log('[SW] Service Worker desativado neste ambiente de preview para evitar conflitos.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('[SW] Registrado com sucesso:', registration.scope);
  } catch (error) {
    // Falha silenciosa para não alarmar o usuário no console
    console.info('[SW] Registro ignorado (possivelmente ambiente restrito):', error);
  }
};

window.addEventListener('load', registerServiceWorker);
