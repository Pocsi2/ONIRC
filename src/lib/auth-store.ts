"use client";

import { useSyncExternalStore } from "react";
import type { User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export type AuthSnapshot = { ready: boolean; user: User | null };

type FirebaseAuthSdk = typeof import("firebase/auth");
type AuthClient = { auth: Awaited<ReturnType<typeof getFirebaseAuth>>; sdk: FirebaseAuthSdk };

const sessionHintKey = "onirc:firebase-session-hint:v1";
let snapshot: AuthSnapshot = { ready: false, user: null };
let clientPromise: Promise<AuthClient> | null = null;
let observerPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function hasSessionHint() {
  try {
    return window.localStorage.getItem(sessionHintKey) === "1";
  } catch {
    return false;
  }
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
    .then(({ auth, sdk }) => new Promise<void>((resolve) => {
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
    }))
    .catch(() => {
      snapshot = { ready: true, user: null };
      persistSessionHint(false);
      notify();
    });

  return observerPromise;
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (hasSessionHint()) {
    void observeAuth();
  } else if (!snapshot.ready) {
    snapshot = { ready: true, user: null };
    queueMicrotask(notify);
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
  await sdk.signInWithPopup(auth, new sdk.GoogleAuthProvider());
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
