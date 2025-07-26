// service-worker.js
self.addEventListener('install', function (event) {
  console.log('[ServiceWorker] 설치 완료');
});

self.addEventListener('fetch', function (event) {
  // 네트워크만 사용함 (캐싱 없음)
});
