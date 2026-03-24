// public/sw.js
self.addEventListener('push', function (event) {
  console.log('Push received:', event);

  let data = { title: 'Default Title', body: 'Default Body' };
  
  try {
    if (event.data) {
      data = event.data.json();
      console.log('Payload data:', data);
    }
  } catch (e) {
    console.error('Error parsing push JSON:', e);
  }

  const options = {
    body: data.body || 'No message content',
    icon: '/icon.png', // Double check this exists in /public/icon.png
    badge: '/badge.png',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});