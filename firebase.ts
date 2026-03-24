
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: "weekly-tasks-c3764.firebaseapp.com",
  projectId: "weekly-tasks-c3764",
  storageBucket: "weekly-tasks-c3764.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDER,
  appId: "1:1064302244918:web:7891a26eafba4d3c7fd497",
  measurementId: "G-B4BWEPNHCS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestForToken = async () => {
  if (!messaging) return;
  try {
    // Register it
    await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    // Use the READY one (guaranteed active) instead of the registration object above
    const readyRegistration = await navigator.serviceWorker.ready;

    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      serviceWorkerRegistration: readyRegistration  // ← use readyRegistration, not registration
    });
    return currentToken;
  } catch (err) {
    console.log('Token error:', err);
  }
};
// Use THIS for when the app is OPEN
if (messaging) {
  onMessage(messaging, (payload) => {
    console.log('Foreground message:', payload);
    // You can use a toast library here (like hot-toast or sonner)
    alert(payload.notification?.title);
  });
}