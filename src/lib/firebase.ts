import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web configuration identifies the project; it is not an admin secret.
// Security is enforced with Firebase Authentication and Firestore rules.
const firebaseConfig = {
  apiKey: "AIzaSyCWTx8Af5q0QNZGNPHv2xFwhjj5Of-iA9s",
  authDomain: "onirc-production.firebaseapp.com",
  projectId: "onirc-production",
  storageBucket: "onirc-production.firebasestorage.app",
  messagingSenderId: "667576199032",
  appId: "1:667576199032:web:eca085bfdef48c2f198a8d",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);
