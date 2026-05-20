const CACHE = 'spacebook-v3';
const SUPABASE_HOST = 'cnsoenjefbhsmljgcuan.supabase.co';

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

// フェッチ戦略：
// - Supabase API（予約データ等）：キャッシュせず常に最新を取得（オフライン時もキャッシュ返さない＝最新性優先）
// - GET以外（POST/PATCH/DELETE）：キャッシュ対象外
// - それ以外（HTML/アイコン/フォント/React/Supabaseライブラリ等の静的資源）：
//   ネットワーク優先で取得し、成功したらキャッシュへ保存。失敗時はキャッシュから返す（オフライン対応）
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase API はキャッシュ介入せず素通し
  if (url.hostname === SUPABASE_HOST) {
    return;
  }

  // GET以外はキャッシュ対象外
  if (e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 200番台のみキャッシュ（エラーレスポンスをキャッシュしない）
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
