"use client";

import type { ReactNode } from "react";
import { CalendarDays, Compass } from "lucide-react";
import { Atmosphere } from "@/components/atmosphere";
import { AuthControl } from "@/components/auth-control";
import { ThemeControl } from "@/components/theme-control";
import { ViewTransitionLink } from "@/components/view-transition-link";
import { DreamStoreProvider } from "@/lib/dreams-store";
import { isPublicArchiveAvailable } from "@/lib/archive-state";
import { ThemeProvider } from "@/lib/theme-store";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DreamStoreProvider>
        <div className="relative min-h-screen overflow-x-clip">
          <Atmosphere />
          <a href="#main-content" className="sr-only z-feedback focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-[14px] focus:bg-[var(--surface-canvas)] focus:px-4 focus:py-3 focus:text-sm focus:shadow-soft">
            Ir al contenido
          </a>
          <header className="pointer-events-none fixed inset-x-0 top-0 z-navigation px-4 py-3 sm:px-6 lg:px-8">
            <nav className="pointer-events-auto mx-auto flex max-w-[1440px] items-center justify-between gap-3 border-b border-[var(--border-quiet)] pb-3" aria-label="Navegación principal">
              <ViewTransitionLink href="/" className="inline-flex min-h-11 items-center text-[0.94rem] font-medium tracking-[0.2em] text-text-primary" aria-label="Inicio de Onirc">
                Onirc<span className="ml-1 text-memory-accessible">.</span>
              </ViewTransitionLink>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ViewTransitionLink href="/calendar" className="inline-flex min-h-11 items-center gap-2 rounded-[14px] px-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary" aria-label="Calendario">
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendario</span>
                </ViewTransitionLink>
                {isPublicArchiveAvailable ? (
                  <ViewTransitionLink href="/explorar" className="inline-flex min-h-11 items-center gap-2 rounded-[14px] px-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary" aria-label="Explorar sueños públicos">
                    <Compass className="h-4 w-4" />
                    <span className="hidden md:inline">Explorar</span>
                  </ViewTransitionLink>
                ) : null}
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
