
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
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
// Fix: Use a relative path './service-worker.js' instead of '/service-worker.js'
// to ensure the script is loaded from the same origin as the application,
// preventing origin mismatch errors in proxied or sandbox environments.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .then(registration => {
        console.log('[PWA] ServiceWorker registered with scope: ', registration.scope);
      })
      .catch(error => {
        // Log the error but don't disrupt the user experience
        console.warn('[PWA] ServiceWorker registration failed. The app will continue to work, but offline features may be limited.', error);
      });
  });
}
