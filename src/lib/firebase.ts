import type { FirebaseApp } from "firebase/app";

// Firebase's web configuration identifies the project; it is not an admin secret.
// Authentication and Firestore rules enforce access. The SDK is imported on demand
// so an anonymous visit to the local journal does not pay for cloud code up front.
const firebaseConfig = {
  apiKey: "AIzaSyCWTx8Af5q0QNZGNPHv2xFwhjj5Of-iA9s",
  authDomain: "onirc-production.firebaseapp.com",
  projectId: "onirc-production",
  storageBucket: "onirc-production.firebasestorage.app",
  messagingSenderId: "667576199032",
  appId: "1:667576199032:web:eca085bfdef48c2f198a8d",
};

let appPromise: Promise<FirebaseApp> | null = null;

export function getFirebaseApp() {
  if (!appPromise) {
    appPromise = import("firebase/app").then(({ getApp, getApps, initializeApp }) => (
      getApps().length ? getApp() : initializeApp(firebaseConfig)
    ));
  }

  return appPromise;
}

export async function getFirebaseAuth() {
  const [{ getAuth }, app] = await Promise.all([import("firebase/auth"), getFirebaseApp()]);
  return getAuth(app);
}

export async function getFirebaseDb() {
  const [{ getFirestore }, app] = await Promise.all([import("firebase/firestore"), getFirebaseApp()]);
  return getFirestore(app);
}
