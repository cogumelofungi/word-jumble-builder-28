// Service Worker específico para as páginas publicadas (escopo /app/)
const CACHE_NAME = `published-app-pwa-v${Date.now()}`;
const STATIC_CACHE = 'published-app-static-v1';

console.log('[SW-APP] Service Worker iniciado');

self.addEventListener('install', (event) => {
  console.log('[SW-APP] Instalando...');
  // Ativa imediatamente a nova versão
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW-APP] Ativando...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== STATIC_CACHE) {
            console.log('[SW-APP] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => {
      console.log('[SW-APP] Service Worker ativado e pronto');
      return self.clients.claim();
    })
  );
});

// Estratégia híbrida: network-first para páginas /app/, cache-first para estáticos
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignorar requisições de outros domínios
  if (!url.origin || url.origin !== self.location.origin) return;

  const isAppRoute = url.pathname.startsWith('/app');

  if (isAppRoute) {
    // Network-first para rotas do app
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, copy);
              console.log('[SW-APP] Cache atualizado para:', url.pathname);
            });
          }
          return res;
        })
        .catch((error) => {
          console.log('[SW-APP] Falha na rede, tentando cache:', url.pathname);
          return caches.match(req).then((cached) => {
            if (cached) {
              console.log('[SW-APP] Servindo do cache:', url.pathname);
              return cached;
            }
            console.error('[SW-APP] Recurso não disponível:', url.pathname);
            throw error;
          });
        })
    );
    return;
  }

  // Cache-first para recursos estáticos
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        console.log('[SW-APP] Servindo do cache (estático):', url.pathname);
        return cached;
      }
      return fetch(req).then((res) => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const copy = res.clone();
        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(req, copy);
          console.log('[SW-APP] Cache criado para (estático):', url.pathname);
        });
        return res;
      });
    })
  );
});

// Recebe mensagens (ex.: atualização de manifest)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'UPDATE_MANIFEST') {
    console.log('[SW-APP] Requisição de atualização do manifest:', event.data.manifest?.name);
  }
  
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW-APP] Forçando ativação imediata');
    self.skipWaiting();
  }
});
