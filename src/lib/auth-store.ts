"use client";

import { useSyncExternalStore } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

export type AuthSnapshot = { ready: boolean; user: User | null };

let snapshot: AuthSnapshot = { ready: false, user: null };
let observing = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function observeAuth() {
  if (observing || typeof window === "undefined") return;
  observing = true;
  onAuthStateChanged(firebaseAuth, (user) => {
    snapshot = { ready: true, user };
    notify();
  });
}

function subscribe(listener: () => void) {
  observeAuth();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

const serverSnapshot: AuthSnapshot = { ready: false, user: null };

export function useAuthSession() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

export async function signInWithGoogle() {
  await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
}

export async function signInWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function createAccountWithEmail(email: string, password: string) {
  await createUserWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signOutOfOnirc() {
  await signOut(firebaseAuth);
}
