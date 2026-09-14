import { PrecacheController } from 'workbox-precaching';

/** オフライン起動時に、キャッシュ欠落を理由とした通信も発生させない。 */
const precache = new PrecacheController({
  fallbackToNetwork: false,
  plugins: [
    {
      requestWillFetch: async ({ request }) => {
        if (self.navigator.onLine === false) throw new Error('Offline');
        return request;
      },
    },
  ],
});
precache.addToCacheList(self.__WB_MANIFEST);

self.addEventListener('install', (event) => {
  // 全資産の保存に成功するまで既存のSWを置き換えない。
  event.waitUntil(precache.install(event));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(precache.activate(event));
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const scope = new URL(self.registration.scope);
  if (event.request.method !== 'GET' || url.origin !== scope.origin) return;
  const asset =
    event.request.mode === 'navigate' && url.pathname.startsWith(scope.pathname)
      ? new URL('index.html', scope).href
      : url.href;
  if (precache.getCacheKeyForURL(asset)) {
    event.respondWith(
      precache.matchPrecache(asset).then((response) => response || Response.error()),
    );
  } else if (self.navigator.onLine === false) {
    event.respondWith(Response.error());
  }
});
