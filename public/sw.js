// Service Worker para PWA
const CACHE_NAME = 'published-app-pwa-v1'; // Fixo ao invés de Date.now()
const STATIC_CACHE = 'app-builder-static-v1';
const urlsToCache = [
  '/placeholder.svg',
  '/manifest.json'
];

// URLs que devem sempre buscar da rede primeiro
const networkFirstUrls = [
  '/',
  '/app/',
  '/app',
  '/sw.js'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
  // Força a ativação imediata
  self.skipWaiting();
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  // Ignorar requisições não-HTTP e diferentes do mesmo origin
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  const url = new URL(event.request.url);
  const isNetworkFirst = networkFirstUrls.some(path => url.pathname === path || url.pathname.startsWith(path));
  
  if (isNetworkFirst) {
    // Network-first para páginas da aplicação
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Se a resposta é válida, atualiza o cache
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Se falha na rede, tenta o cache
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-first para recursos estáticos
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          
          return fetch(event.request).then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
        })
    );
  }
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Remove todos os caches antigos exceto o atual e o estático
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar controle de todas as páginas abertas
      return self.clients.claim();
    })
  );
});
