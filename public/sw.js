// sw.js - Service Worker para JS Fit App
const CACHE_NAME = 'jsfitapp-v1.0.0';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/aluno.html',
  '/personal.html',
  '/manifest.json',
  '/css/stylealuno.css',
  '/css/stylepersonal.css'
];

// URLs da API que devem ser sempre buscadas da rede
const API_URLS = [
  '/api/health',
  '/api/workouts',
  '/api/save-workout',
  '/api/get-workout'
];

// Evento de instalação do Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache aberto');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Todos os arquivos foram cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Falha ao fazer cache:', error);
      })
  );
});

// Evento de ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker ativado');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Requisições da API - sempre buscar da rede
  if (API_URLS.some(apiUrl => requestUrl.pathname.startsWith(apiUrl))) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Arquivos de dados de treinos - cache com fallback para rede
  if (requestUrl.pathname.startsWith('/data/workouts/')) {
    event.respondWith(handleDataRequest(event.request));
    return;
  }
  
  // Outros recursos - cache first com fallback para rede
  event.respondWith(handleCacheFirst(event.request));
});

// Handler para requisições da API
async function handleApiRequest(request) {
  try {
    console.log('[SW] Buscando da API:', request.url);
    
    // Sempre tentar a rede primeiro para APIs
    const networkResponse = await fetch(request, {
      cache: 'no-cache'
    });
    
    // Se a resposta for bem-sucedida, opcionalmente cachear
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Erro na rede para API, tentando cache:', error);
    
    // Se a rede falhar, tentar o cache (apenas para GET)
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Se não há cache, retornar erro offline
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Sem conexão com a internet',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handler para arquivos de dados (treinos)
async function handleDataRequest(request) {
  try {
    console.log('[SW] Buscando dados:', request.url);
    
    // Tentar rede primeiro
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cachear a resposta
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log('[SW] Rede falhou para dados, tentando cache:', error);
    
    // Se a rede falhar, tentar o cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não há cache, retornar 404
    return new Response(
      JSON.stringify({
        error: 'Not Found',
        message: 'Dados não encontrados offline',
        offline: true
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handler para cache first (recursos estáticos)
async function handleCacheFirst(request) {
  try {
    // Verificar cache primeiro
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Servindo do cache:', request.url);
      return cachedResponse;
    }
    
    // Se não está no cache, buscar da rede
    console.log('[SW] Cache miss, buscando da rede:', request.url);
    const networkResponse = await fetch(request);
    
    // Cachear a resposta se for bem-sucedida
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Erro na rede:', error);
    
    // Se é uma página HTML, retornar página offline
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/index.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    // Para outros recursos, retornar erro
    return new Response('Offline', { status: 503 });
  }
}

// Listener para mensagens dos clientes
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_WORKOUT') {
    // Cachear um treino específico
    const { shareId, data } = event.data;
    caches.open(CACHE_NAME).then(cache => {
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      cache.put(`/data/workouts/${shareId}.json`, response);
    });
  }
});

// Listener para sincronização em background (se suportado)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync executado');
    event.waitUntil(syncData());
  }
});

// Função para sincronizar dados
async function syncData() {
  try {
    // Verificar se há dados pendentes para sincronizar
    const pendingData = await self.registration.sync.getTags();
    console.log('[SW] Dados pendentes para sync:', pendingData);
    
    // Implementar lógica de sincronização se necessário
    
  } catch (error) {
    console.error('[SW] Erro na sincronização:', error);
  }
}

// Log de eventos importantes
self.addEventListener('error', error => {
  console.error('[SW] Erro no Service Worker:', error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Promise rejeitada:', event.reason);
});

console.log('[SW] Service Worker registrado com sucesso');