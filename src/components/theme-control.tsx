"use client";

import * as React from "react";
import { Check, Monitor, Moon, Palette, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "@/lib/theme-store";
import { cn } from "@/lib/utils";

const options: Array<{ value: ThemePreference; label: string; icon: typeof Sun; description: string }> = [
  { value: "system", label: "Sistema", icon: Monitor, description: "Sigue la apariencia de este dispositivo." },
  { value: "day", label: "Día", icon: Sun, description: "Luz perla para leer con claridad." },
  { value: "night", label: "Noche cálida", icon: Moon, description: "Menos azul, más calma." },
];

export function ThemeControl() {
  const { preference, setPreference } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const panelId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="material-button inline-flex min-h-11 items-center gap-2 rounded-[16px] px-3 text-sm"
        aria-label="Elegir apariencia"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Apariencia</span>
      </button>
      {isOpen ? (
        <div id={panelId} className="surface-frost absolute right-0 top-[calc(100%+0.75rem)] z-feedback w-72 rounded-[24px] p-2" role="dialog" aria-label="Apariencia">
          <p className="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-[0.2em] text-text-muted">Apariencia</p>
          <div role="radiogroup" aria-label="Elegir apariencia" className="space-y-1">
            {options.map((option) => {
              const Icon = option.icon;
              const active = preference === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={cn("flex min-h-12 w-full items-center gap-3 rounded-[16px] px-3 text-left transition", active ? "bg-white/70 text-text-primary" : "text-text-secondary hover:bg-white/45")}
                  onClick={() => {
                    setPreference(option.value);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs leading-5 text-text-muted">{option.description}</span>
                  </span>
                  {active ? <Check className="h-4 w-4 text-memory-accessible" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
