"use client";

import * as React from "react";

export type ThemePreference = "system" | "day" | "night";

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
const storageKey = "onirc:appearance:v1";
let preferenceSnapshot: ThemePreference = "system";
let didLoad = false;
const listeners = new Set<() => void>();

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  const systemNight = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = preference === "system" ? (systemNight ? "night" : "day") : preference;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved === "night" ? "dark" : "light";
}

function emit() {
  listeners.forEach((listener) => listener());
}

function ensureLoaded() {
  if (didLoad || typeof window === "undefined") return;
  didLoad = true;
  const stored = window.localStorage.getItem(storageKey);
  preferenceSnapshot = stored === "day" || stored === "night" || stored === "system" ? stored : "system";
  applyTheme(preferenceSnapshot);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureLoaded();
  listener();
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemChange = () => {
    if (preferenceSnapshot === "system") {
      applyTheme("system");
      emit();
    }
  };
  media.addEventListener("change", handleSystemChange);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", handleSystemChange);
  };
}

function getSnapshot() {
  ensureLoaded();
  return preferenceSnapshot;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = React.useSyncExternalStore(subscribe, getSnapshot, () => "system" as ThemePreference);
  const setPreference = React.useCallback((next: ThemePreference) => {
    preferenceSnapshot = next;
    window.localStorage.setItem(storageKey, next);
    applyTheme(next);
    emit();
  }, []);
  const value = React.useMemo(() => ({ preference, setPreference }), [preference, setPreference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
