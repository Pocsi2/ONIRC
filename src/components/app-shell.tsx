"use client";

import { CalendarDays, Feather, Moon, Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { Atmosphere } from "@/components/atmosphere";
import { ViewTransitionLink } from "@/components/view-transition-link";
import { reducedTransition, transitions } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Moon },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/new", label: "New dream", icon: Feather },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const navTransition = reducedMotion ? reducedTransition : transitions.standard;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Atmosphere />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-navigation px-4 py-4 sm:px-6 lg:px-8">
        <nav className="pointer-events-auto mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <ViewTransitionLink
            href="/"
            className="surface-frost group inline-flex h-12 items-center gap-3 rounded-[20px] px-4 text-sm font-medium text-text-primary"
            aria-label="ONEIRIC home"
          >
            <span className="relative grid h-7 w-7 place-items-center rounded-full bg-white/70 shadow-soft">
              <span className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_30%_20%,white,rgba(221,242,239,.58)_36%,rgba(232,225,241,.42)_72%,rgba(255,255,255,.82))]" />
              <Moon className="relative h-3.5 w-3.5 text-text-secondary" />
            </span>
            <span className="tracking-[0.22em]">ONEIRIC</span>
          </ViewTransitionLink>

          <div className="surface-frost hidden items-center gap-1 rounded-[22px] p-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href === "/calendar" && pathname.startsWith("/dreams"));
              return (
                <ViewTransitionLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "motion-material relative inline-flex h-10 items-center gap-2 rounded-[16px] px-4 text-sm text-text-secondary transition hover:text-text-primary",
                    active && "text-text-primary",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="nav-presence"
                      className="absolute inset-0 rounded-[16px] bg-white/68 shadow-soft"
                      transition={navTransition}
                    />
                  ) : null}
                  <Icon className="relative h-4 w-4" />
                  <span className="relative">{item.label}</span>
                </ViewTransitionLink>
              );
            })}
          </div>

          <ViewTransitionLink
            href="/new"
            className="surface-pearl motion-material inline-flex h-12 items-center gap-2 rounded-[20px] px-4 text-sm font-medium text-text-primary transition hover:-translate-y-0.5 hover:shadow-float"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Keep one</span>
          </ViewTransitionLink>
        </nav>
      </header>

      <main className="relative z-surface mx-auto min-h-screen max-w-[1440px] px-4 pb-28 pt-28 sm:px-6 lg:px-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-4 z-navigation px-4 md:hidden" aria-label="Mobile navigation">
        <div className="surface-frost mx-auto grid max-w-sm grid-cols-3 rounded-[24px] p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href === "/calendar" && pathname.startsWith("/dreams"));
            return (
              <ViewTransitionLink
                key={item.href}
                href={item.href}
                className={cn(
                  "motion-material relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-[18px] text-[11px] text-text-muted transition",
                  active && "text-text-primary",
                )}
              >
                {active ? <motion.span layoutId="mobile-nav-presence" transition={navTransition} className="absolute inset-0 rounded-[18px] bg-white/70 shadow-soft" /> : null}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{item.label}</span>
              </ViewTransitionLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
