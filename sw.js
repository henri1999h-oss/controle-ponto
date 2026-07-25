/* ==========================================================================
   sw.js — Service Worker: cacheia o app-shell para funcionamento 100%
   offline após o primeiro acesso. Os DADOS ficam no IndexedDB (não aqui);
   este arquivo só cuida dos arquivos estáticos do aplicativo.
   ========================================================================== */

const CACHE_NAME = 'meu-ponto-v1';
const ARQUIVOS_PARA_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/db.js',
  './js/calc.js',
  './js/export.js',
  './js/ui-helpers.js',
  './js/view-wizard.js',
  './js/view-dashboard.js',
  './js/view-newday.js',
  './js/view-calendar.js',
  './js/view-history.js',
  './js/view-export.js',
  './js/view-backup.js',
  './js/view-settings.js',
  './js/app.js',
  './vendor/xlsx.full.min.js',
  './vendor/jspdf.umd.min.js',
  './vendor/jspdf.plugin.autotable.min.js',
  './vendor/jszip.min.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ARQUIVOS_PARA_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) => Promise.all(
      nomes.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
    )).then(() => self.clients.claim())
  );
});

// Estratégia: cache-first para o app shell, com fallback de rede.
// Isso garante que o app abra mesmo sem internet após a instalação.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia)).catch(() => {});
        return resposta;
      }).catch(() => cached);
    })
  );
});
