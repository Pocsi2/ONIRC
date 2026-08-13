"use client";

import type { ReactNode } from "react";
import { CalendarDays, Sparkle } from "lucide-react";
import { Atmosphere } from "@/components/atmosphere";
import { AuthControl } from "@/components/auth-control";
import { ThemeControl } from "@/components/theme-control";
import { ViewTransitionLink } from "@/components/view-transition-link";
import { DreamStoreProvider } from "@/lib/dreams-store";
import { ThemeProvider } from "@/lib/theme-store";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DreamStoreProvider>
        <div className="relative min-h-screen overflow-x-clip">
          <Atmosphere />
          <a href="#main-content" className="sr-only z-feedback focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-[14px] focus:bg-[var(--surface-canvas)] focus:px-4 focus:py-3 focus:text-sm focus:shadow-soft">
            Ir al calendario
          </a>
          <header className="pointer-events-none fixed inset-x-0 top-0 z-navigation px-4 py-4 sm:px-6 lg:px-8">
            <nav className="pointer-events-auto mx-auto flex max-w-[1440px] items-center justify-between gap-3" aria-label="Navegación principal">
              <ViewTransitionLink href="/" className="surface-frost inline-flex h-12 items-center gap-3 rounded-[20px] px-4 text-sm font-medium" aria-label="Inicio de Onirc">
                <span className="relative grid h-7 w-7 place-items-center rounded-full bg-white/65 shadow-soft [html[data-theme=night]_&]:bg-white/10">
                  <span className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_30%_20%,white,rgba(221,242,239,.58)_36%,rgba(232,225,241,.42)_72%,rgba(255,255,255,.82))]" />
                  <Sparkle className="relative h-3.5 w-3.5 text-text-secondary" />
                </span>
                <span className="tracking-[0.16em]">Onirc</span>
              </ViewTransitionLink>
              <div className="flex items-center gap-2">
                <ViewTransitionLink href="/calendar" className="material-button inline-flex min-h-11 items-center gap-2 rounded-[16px] px-3 text-sm" aria-label="Calendario">
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendario</span>
                </ViewTransitionLink>
                <AuthControl />
                <ThemeControl />
              </div>
            </nav>
          </header>
          <main id="main-content" className="relative z-surface mx-auto min-h-screen max-w-[1440px] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </DreamStoreProvider>
    </ThemeProvider>
  );
}
