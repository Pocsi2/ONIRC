"use client";

import type { ReactNode } from "react";
import { Atmosphere } from "@/components/atmosphere";
import { AuthControl } from "@/components/auth-control";
import { MemoryLine } from "@/components/memory-line";
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
          <MemoryLine />
          <a href="#main-content" className="sr-only z-feedback focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-[14px] focus:bg-[var(--surface-canvas)] focus:px-4 focus:py-3 focus:text-sm focus:shadow-soft">
            Ir al contenido
          </a>
          <header className="pointer-events-none fixed inset-x-0 top-0 z-navigation px-4 py-3 sm:px-6 lg:px-8">
            <nav className="pointer-events-auto mx-auto flex max-w-[1440px] items-center justify-between gap-3" aria-label="Navegación principal">
              <ViewTransitionLink href="/" className="inline-flex min-h-11 items-center text-[0.78rem] font-medium tracking-[0.28em] text-text-primary/80" aria-label="Inicio de Onirc">
                Onirc<span className="memory-mark ml-1 h-px w-4 bg-memory-electric" aria-hidden="true" />
              </ViewTransitionLink>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <AuthControl />
                <ThemeControl />
              </div>
            </nav>
          </header>
          <main id="main-content" className="relative z-surface mx-auto min-h-screen max-w-[1440px] px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8">
            {children}
          </main>
        </div>
      </DreamStoreProvider>
    </ThemeProvider>
  );
}
