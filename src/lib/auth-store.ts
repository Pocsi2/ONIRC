"use client";

import { useSyncExternalStore } from "react";
import type { User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export type AuthSnapshot = { ready: boolean; user: User | null };

type FirebaseAuthSdk = typeof import("firebase/auth");
type AuthClient = { auth: Awaited<ReturnType<typeof getFirebaseAuth>>; sdk: FirebaseAuthSdk };

const sessionHintKey = "onirc:firebase-session-hint:v1";
const googleRedirectKey = "onirc:google-redirect:v1";
let snapshot: AuthSnapshot = { ready: false, user: null };
let clientPromise: Promise<AuthClient> | null = null;
let observerPromise: Promise<void> | null = null;
let subscriptionBootstrapped = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function persistSessionHint(hasSession: boolean) {
  try {
    if (hasSession) window.localStorage.setItem(sessionHintKey, "1");
    else window.localStorage.removeItem(sessionHintKey);
  } catch {
    // Private browsing can deny storage. Firebase still remains the authority.
  }
}

function getAuthClient() {
  if (!clientPromise) {
    clientPromise = Promise.all([import("firebase/auth"), getFirebaseAuth()]).then(([sdk, auth]) => ({ sdk, auth }));
  }

  return clientPromise;
}

function observeAuth() {
  if (observerPromise) return observerPromise;
  observerPromise = getAuthClient()
    .then(({ auth, sdk }) => {
      // Completing a same-tab Google flow is harmless when there is no
      // redirect result and is required by embedded/mobile browsers.
      void sdk.getRedirectResult(auth).catch(() => undefined);
      return new Promise<void>((resolve) => {
      sdk.onAuthStateChanged(
        auth,
        (user) => {
          snapshot = { ready: true, user };
          persistSessionHint(Boolean(user));
          notify();
          resolve();
        },
        () => {
          snapshot = { ready: true, user: null };
          persistSessionHint(false);
          notify();
          resolve();
        },
      );
      });
    })
    .catch(() => {
      snapshot = { ready: true, user: null };
      persistSessionHint(false);
      notify();
    });

  return observerPromise;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!subscriptionBootstrapped) {
    subscriptionBootstrapped = true;
    let shouldRestoreSession = false;
    try {
      shouldRestoreSession = window.localStorage.getItem(sessionHintKey) === "1"
        || window.sessionStorage.getItem(googleRedirectKey) === "1";
    } catch {
      // Storage may be unavailable; explicit account intent remains the fallback.
    }

    if (shouldRestoreSession) {
      void observeAuth();
    } else {
      snapshot = { ready: true, user: null };
      queueMicrotask(notify);
    }
  }

  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

const serverSnapshot: AuthSnapshot = { ready: false, user: null };

export function useAuthSession() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

/** Starts Firebase only after explicit account intent or a remembered session. */
export async function prepareAuthSession() {
  await observeAuth();
}

export async function signInWithGoogle() {
  await prepareAuthSession();
  const { auth, sdk } = await getAuthClient();
  const provider = new sdk.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const userAgent = window.navigator.userAgent;
  const embedded = /ChatGPT|Electron|Instagram|FBAN|FBAV|; wv\)|WebView/i.test(userAgent);
  if (embedded) {
    window.sessionStorage.setItem(googleRedirectKey, "1");
    await sdk.signInWithRedirect(auth, provider);
    return;
  }
  try {
    await sdk.signInWithPopup(auth, provider);
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (!code.includes("popup-blocked") && !code.includes("operation-not-supported-in-this-environment")) throw error;
    window.sessionStorage.setItem(googleRedirectKey, "1");
    await sdk.signInWithRedirect(auth, provider);
  }
}

export async function signInWithGoogleRedirect() {
  await prepareAuthSession();
  const { auth, sdk } = await getAuthClient();
  const provider = new sdk.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  window.sessionStorage.setItem(googleRedirectKey, "1");
  await sdk.signInWithRedirect(auth, provider);
}

export function consumeGoogleRedirect() {
  try {
    if (window.sessionStorage.getItem(googleRedirectKey) !== "1") return false;
    window.sessionStorage.removeItem(googleRedirectKey);
    return true;
  } catch {
    return false;
  }
}

export async function signInWithEmail(email: string, password: string) {
  await prepareAuthSession();
  const { auth, sdk } = await getAuthClient();
  await sdk.signInWithEmailAndPassword(auth, email, password);
}

export async function createAccountWithEmail(email: string, password: string) {
  await prepareAuthSession();
  const { auth, sdk } = await getAuthClient();
  await sdk.createUserWithEmailAndPassword(auth, email, password);
}

export async function signOutOfOnirc() {
  const { auth, sdk } = await getAuthClient();
  await sdk.signOut(auth);
  persistSessionHint(false);
}
