// 'use client';

// import { useEffect } from 'react';
// // import { messaging, requestForToken } from '@/firebase'; // Path to your firebase.ts
// import { onMessage } from 'firebase/messaging';

// export default function PushNotificationManager() {
//     useEffect(() => {
//         const setupNotifications = async () => {
//             // 1. Check if the browser supports notifications
//             if (!('Notification' in window)) {
//                 console.log('This browser does not support desktop notification');
//                 return;
//             }

//             // 2. Request Permission
//             const permission = await Notification.requestPermission();

//             if (permission === 'granted') {
//                 console.log('Notification permission granted.');

//                 // 3. Get the Token (using the function we wrote in firebase.ts)
//                 const token = await requestForToken();

//                 // TODO: Send this token to your database (Supabase) here!
//                 if (token) {
//                     console.log('My FCM Token:', token);
//                 }
//             } else {
//                 console.warn('Permission denied for notifications');
//             }
//         };

//         setupNotifications();

//         // 4. Handle Foreground Messages (Optional: shows alert if app is open)
//         if (messaging) {
//             const unsubscribe = onMessage(messaging, (payload) => {
//                 console.log('Foreground message received: ', payload);
//                 alert(`New Notification: ${payload.notification?.title}`);
//             });
//             return () => unsubscribe();
//         }
//     }, []);

//     return null; // This component doesn't need to render anything
// }