// // // public/sw.js
// self.addEventListener('push', function (event) {
//   console.log('Push received:', event);

//   let data = { title: 'Default Title', body: 'Default Body' };
  
//   try {
//     if (event.data) {
//       data = event.data.json();
//       console.log('Payload data:', data);
//     }
//   } catch (e) {
//     console.error('Error parsing push JSON:', e);
//   }

//   const options = {
//     body: data.body || 'No message content',
//     icon: '/icon.png', // Double check this exists in /public/icon.png
//     badge: '/badge.png',
//   };

//   event.waitUntil(
//     self.registration.showNotification(data.title || 'Notification', options)
//   );
// });

// // public/sw.js

// self.addEventListener('install', (event) => {
//     // بيجبر النسخة الجديدة إنها تبقى نشطة فوراً بدل ما تستنى في الـ waiting
//     self.skipWaiting(); 
// });

// self.addEventListener('activate', (event) => {
//     // بيخلي النسخة الجديدة تتحكم في الصفحة الحالية فوراً من غير ما تحتاج Refresh
//     event.waitUntil(clients.claim()); 
// });

// self.addEventListener('notificationclick', function(event) {
//     event.notification.close(); // إغلاق الإشعار

//     // التعامل مع ضغطة الزرار أو الإشعار نفسه
//     event.waitUntil(
//         clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
//             // إذا كان الويب سايت مفتوح أصلاً، نركز عليه (Focus)
//             for (let i = 0; i < clientList.length; i++) {
//                 let client = clientList[i];
//                 if (client.url === '/' && 'focus' in client) {
//                     return client.focus();
//                 }
//             }
//             // إذا لم يكن مفتوحاً، افتحه في نافذة جديدة
//             if (clients.openWindow) {
//                 return clients.openWindow('/');
//             }
//         })
//     );
// });


// // الاستماع للضغط على الإشعار أو الزراير
// // self.addEventListener('notificationclick', (event) => {
// //   const notification = event.notification;

// //   notification.close(); // قفل الإشعار فوراً

// //   // لو ضغط على زرار "عرض المهام" أو ضغط على جسم الإشعار نفسه
// //   event.waitUntil(
// //     clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
// //       // لو الموقع مفتوح في أي Tab، نركز عليه
// //       for (let client of windowClients) {
// //         if (client.url === '/' && 'focus' in client) {
// //           return client.focus();
// //         }
// //       }
// //       // لو مش مفتوح، نفتح نافذة جديدة
// //       if (clients.openWindow) {
// //         return clients.openWindow('/');
// //       }
// //     })
// //   );
// // });

// الاستماع لاستقبال الإشعار (Push Event)
self.addEventListener('push', function (event) {
  let data = { title: 'Default Title', body: 'Default Body', data: { url: '/' } };
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error('Error parsing push JSON:', e);
  }

  const options = {
    body: data.body || 'No message content',
    icon: '/icon.png',
    badge: '/badge.png',
    // مهم جداً: تمرير الداتا هنا عشان الـ click event يشوفها
    data: data.data || { url: '/' }, 
    tag: 'task-reminder',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

// التعامل مع الضغط على الإشعار (Click Event)
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // إغلاق الإشعار فوراً

    // جلب الرابط من الداتا اللي بعتناها في الـ Push
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // التحقق إذا كان الرابط المطلوب مفتوح في أي Tab
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                // بنستخدم includes عشان لو فيه parameters في الـ URL
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // لو مش مفتوح، افتح اللينك المبعوث من السيرفر
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// الأحداث الأساسية للـ Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim()); 
});