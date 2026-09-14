import { PrecacheController } from 'workbox-precaching';
import { handleLegacyUpdate } from './legacy-updates.mjs';

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
/** 旧画面にも案内できる、ビルド時に埋め込んだアプリの版情報。 */
const manifest = self.__WB_MANIFEST;
precache.addToCacheList(manifest);
const revision = manifest.find((entry) => entry.url === 'index.html')?.revision ?? 'workbox';

self.addEventListener('install', (event) => {
  // 全資産の保存に成功するまで既存のSWを置き換えない。
  event.waitUntil(precache.install(event));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(precache.activate(event));
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
  else handleLegacyUpdate(event, revision);
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
