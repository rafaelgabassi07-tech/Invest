
const CACHE_VERSION = 'v2.3'; // Incrementado para forçar detecção de update
const STATIC_CACHE = `invest-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `invest-runtime-${CACHE_VERSION}`;

// Recursos essenciais para o funcionamento básico offline
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn-icons-png.flaticon.com/512/5501/5501360.png'
];

// Instalação: Pre-cache de ativos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
    // REMOVIDO: self.skipWaiting() automático. 
    // Agora o SW espera ação do usuário.
  );
});

// Listener para mensagem de atualização manual
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Ativação: Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégias de Fetch customizadas
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Estratégia: Network First (para navegação e manifest)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match('/index.html').then(response => {
             return response || caches.match('/');
          });
        })
    );
    return;
  }

  // 1.1 Manifest (Network First simple)
  if (url.pathname.endsWith('manifest.json')) {
     event.respondWith(
        fetch(event.request)
        .then(response => {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(event.request, copy));
            return response;
        })
        .catch(() => caches.match(event.request))
     );
     return;
  }

  // 2. Estratégia: Cache First (para dependências externas)
  if (url.hostname.includes('esm.sh') || url.hostname.includes('gstatic.com') || url.hostname.includes('flaticon.com')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
             return networkResponse;
          }
          const copy = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy));
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Estratégia: Stale-While-Revalidate (para outros ativos locais)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      }).catch((e) => {
          console.warn('[SW] Fetch failed:', e);
      });

      return cachedResponse || fetchPromise;
    })
  );
});
