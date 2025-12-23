// This is the service worker file.

self.addEventListener('push', event => {
  const data = event.data.json();
  console.log('Push notification received:', data);

  const title = data.title || 'RS Drop Notification';
  const options = {
    body: data.body || 'Você tem uma nova notificação.',
    icon: '/icon.png', // You can replace this with your app's icon
    badge: '/badge.png' // Appears in the notification tray on some devices
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  console.log('On notification click: ', event.notification.tag);
  event.notification.close();

  // This looks for an existing window and focuses it.
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url == '/' && 'focus' in client)
        return client.focus();
    }
    if (clients.openWindow)
      return clients.openWindow('/');
  }));
});
