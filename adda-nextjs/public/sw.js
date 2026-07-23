/**
 * ADDA — F2.6e-3 / Web Push service worker.
 *
 * ⚠️ QƏTİ QAYDA: burada `fetch` hadisəsi dinlənilmir və HEÇ NƏ keşlənmir.
 * Bu SW kök scope-da (/) qeydiyyatdan keçir; `fetch` handler əlavə etsək
 * Next.js-in marşrutlaşdırması, ISR və RSC axını arasına girərdi.
 * Bu yalnız bildiriş SW-idir — offline rejim F2.7-dən sonra ayrıca qərar.
 *
 * İkonlar (`/icon-192.png`, `/badge-72.png`) İSTƏYƏ BAĞLIDIR — fayl yoxdursa
 * brauzer sadəcə öz ikonunu göstərir, bildiriş yenə də çatır.
 */
/* global self, clients */

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }

  var title = data.title || 'ADDA';
  var options = {
    body: data.body || '',
    tag: data.tag || 'adda',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: { url: data.url || '/' },
    renotify: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var client = list[i];
        if (client.url.indexOf(target) !== -1 && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
      return undefined;
    })
  );
});

/**
 * Brauzer abunəliyi öz-özünə yenilədikdə (açar rotasiyası) serveri xəbərdar et,
 * yoxsa köhnə endpoint ölü qalar və bildirişlər sakitcə itər.
 */
self.addEventListener('pushsubscriptionchange', function (event) {
  event.waitUntil(
    self.registration.pushManager
      .getSubscription()
      .then(function (sub) {
        if (!sub) return undefined;
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub.toJSON()),
        });
      })
      .catch(function () {
        return undefined;
      })
  );
});
