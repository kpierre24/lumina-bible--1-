const STATIC_CACHE_NAME = 'lumina-static-v3';
const API_CACHE_NAME = 'lumina-api-v3';

// App Shell files to be cached on install
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon.svg',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap'
];

// Install service worker and cache app shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('SW: Caching App Shell');
                return cache.addAll(APP_SHELL_URLS);
            })
            .catch(error => {
                console.error('SW: Failed to cache app shell', error);
            })
    );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        console.log('SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event handler
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // API requests (cache-first)
    if (url.hostname === 'bible-api.com') {
        event.respondWith(
            caches.open(API_CACHE_NAME).then(async cache => {
                const cachedResponse = await cache.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                try {
                    const networkResponse = await fetch(request);
                    if (networkResponse && networkResponse.ok) {
                        cache.put(request, networkResponse.clone());
                    }
                    return networkResponse;
                } catch (error) {
                    console.error('SW: API fetch failed', error);
                    return new Response(JSON.stringify({ error: 'This content is not available offline.' }), {
                        status: 408,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            })
        );
        return;
    }

    // For SPA navigation, serve index.html from cache first.
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html').then(response => {
                return response || fetch(request); // Fallback to network if not in cache
            })
        );
        return;
    }

    // Other requests (stale-while-revalidate for app assets)
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            const fetchPromise = fetch(request).then(networkResponse => {
                caches.open(STATIC_CACHE_NAME).then(cache => {
                    // Check for valid response to avoid caching errors
                    if (networkResponse && networkResponse.status === 200) {
                         cache.put(request, networkResponse.clone());
                    }
                });
                return networkResponse;
            }).catch(error => {
                console.error("SW: Fetch for asset failed:", request.url, error);
                // If fetch fails, the promise rejects, and if there's no cached response,
                // the browser will show a network error, which is expected.
            });
            // Return cached response immediately if available, otherwise wait for fetch.
            return cachedResponse || fetchPromise;
        })
    );
});
