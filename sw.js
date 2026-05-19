const CACHE = 'spacebook-v2';

// インストール時：即座にアクティブ化
self.addEventListener('install', e => {
  self.skipWaiting();
});

// アクティブ時：古いキャッシュを全削除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ネットワーク優先：常に最新を取得、オフライン時だけキャッシュから返す
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 取得できたらキャッシュにも保存（次回オフライン用）
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
