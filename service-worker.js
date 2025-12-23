
const CACHE_VERSION = 'v2.6'; // Incremento de versão
const STATIC_CACHE = `invest-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `invest-runtime-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn-icons-png.flaticon.com/512/5501/5501360.png'
];

self.addEventListener('install', (event) => {
  // O 'install' apenas baixa os arquivos para o cache.
  // NÃO chamamos self.skipWaiting() aqui para evitar atualização forçada.
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Listener crítico: Só atualiza quando a UI mandar
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Comando manual recebido: SKIP_WAITING. Ativando nova versão...');
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando nova versão...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // Assim que ativado, assume o controle das abas abertas imediatamente (mas só após o reload visual)
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network First para navegação (HTML) para garantir dados frescos no reload
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html').then(res => res || caches.match('/'));
      })
    );
    return;
  }

  // Cache First para libs externas e ícones
  if (url.hostname.includes('esm.sh') || url.hostname.includes('flaticon.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then(res => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(event.request, copy));
          return res;
        });
      })
    );
    return;
  }

  // Stale-While-Revalidate para o restante (CSS, JS locais)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const copy = networkRes.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy));
        }
        return networkRes;
      }).catch(() => {});

      return cached || fetchPromise;
    })
  );
});
