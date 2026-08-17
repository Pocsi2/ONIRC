"use client";

import * as React from "react";
import { Check, Feather, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Dream, DreamDraft } from "@/lib/dreams";
import { todayIso } from "@/lib/dreams";
import { useDreamStore } from "@/lib/dreams-store";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

type ComposerProps = {
  mode: "create" | "edit";
  dream?: Dream;
  initialDate: string;
  onClose: () => void;
  onSaved: (dream: Dream) => void;
};

function focusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
}

export function DreamComposer({ mode, dream, initialDate, onClose, onSaved }: ComposerProps) {
  const reducedMotion = useReducedMotion();
  const { addDream, updateDream, savedDraft, saveLocalDraft, clearLocalDraft, cloud } = useDreamStore();
  const isEdit = mode === "edit" && Boolean(dream);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  const titleRef = React.useRef<HTMLInputElement>(null);
  const initialDraftRef = React.useRef(savedDraft);
  const [date, setDate] = React.useState(initialDate);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [error, setError] = React.useState("");
  const [isDirty, setIsDirty] = React.useState(false);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);
  const hasNarrative = body.trim().length > 0;
  const revealDetails = isEdit || hasNarrative;

  React.useEffect(() => {
    const source = isEdit && dream ? dream : initialDraftRef.current;
    setDate(source?.date ?? initialDate);
    setTitle(source?.title ?? "");
    setBody(source?.body ?? "");
    setError("");
    setIsDirty(false);
    window.setTimeout(() => bodyRef.current?.focus(), 40);
  }, [dream, initialDate, isEdit]);

  React.useEffect(() => {
    if (isEdit || !isDirty) return;
    const timer = window.setTimeout(() => saveLocalDraft({ date, title, body }), 280);
    return () => window.clearTimeout(timer);
  }, [body, date, isDirty, isEdit, saveLocalDraft, title]);

  function updateField(setter: React.Dispatch<React.SetStateAction<string>>, value: string) {
    setter(value);
    setIsDirty(true);
    if (error) setError("");
  }

  function closeWithCare() {
    if (isDirty && !confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeWithCare();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const elements = focusableElements(dialogRef.current);
    if (!elements.length) return;
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (cleanBody.length < 8) {
      setError("Escribe al menos 8 caracteres.");
      bodyRef.current?.focus();
      return;
    }
    if (cleanTitle.length < 2) {
      setError("El título debe tener 2 caracteres o más.");
      titleRef.current?.focus();
      return;
    }
    if (!date || date > todayIso()) {
      setError("No se permiten fechas futuras.");
      return;
    }
    const draft: DreamDraft = { date, title: cleanTitle, body: cleanBody };
    const saved = isEdit && dream ? updateDream(dream.id, draft) : addDream(draft);
    if (!saved) {
      setError("Registro no encontrado.");
      return;
    }
    clearLocalDraft();
    setIsDirty(false);
    onSaved(saved);
  }

  const sheetInitial = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.99 };
  const sheetAnimate = reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 };

  return (
    <motion.div className="fixed inset-0 z-feedback flex items-end bg-[rgba(36,30,27,.16)] p-0 sm:items-center sm:justify-center sm:p-6 [html[data-theme=night]_&]:bg-black/42" initial={{ opacity: 0 }} animate={{ opacity: 1, pointerEvents: "auto" }} exit={{ opacity: 0, pointerEvents: "none" }} transition={reducedMotion ? reducedTransition : transitions.standard}>
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dream-composer-title"
        aria-describedby="dream-composer-description"
        onKeyDown={onKeyDown}
        initial={sheetInitial}
        animate={sheetAnimate}
        exit={sheetInitial}
        transition={reducedMotion ? reducedTransition : transitions.expressive}
        className="material-opal relative max-h-[92vh] w-full overflow-y-auto rounded-t-[34px] px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-[660px] sm:rounded-[38px] sm:p-9"
      >
        <div className="mb-8 flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-text-muted">{isEdit ? "Editar sueño" : "Registrar sueño"}</p>
            <h2 id="dream-composer-title" className="mt-3 font-display text-5xl leading-[.92] tracking-[-0.045em]">{isEdit ? "Editar sueño" : "Describe el sueño."}</h2>
            <p id="dream-composer-description" className="mt-3 max-w-md text-sm leading-6 text-text-secondary">{cloud.status === "synced" ? "Guardado en este dispositivo y sincronizado con tu cuenta." : "Guardado en este dispositivo. No se comparte."}</p>
          </div>
          <button type="button" className="material-button grid h-11 w-11 shrink-0 place-items-center rounded-full" aria-label="Cerrar formulario" onClick={closeWithCare}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <label htmlFor="dream-body" className="block">
            <span className="mb-2 block text-sm font-medium text-text-secondary">Descripción</span>
            <Textarea id="dream-body" ref={bodyRef} autoFocus value={body} onChange={(event) => updateField(setBody, event.target.value)} placeholder="Escribe lo que recuerdes." className="min-h-48" aria-invalid={Boolean(error && body.trim().length < 8)} />
          </label>
          <AnimatePresence initial={false}>
            {revealDetails ? (
              <motion.div initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={reducedMotion ? reducedTransition : transitions.standard} className="grid gap-5 sm:grid-cols-[.78fr_1.22fr]">
                <label htmlFor="dream-date" className="block">
                  <span className="mb-2 block text-sm font-medium text-text-secondary">Fecha</span>
                  <Input id="dream-date" type="date" value={date} max={todayIso()} onChange={(event) => updateField(setDate, event.target.value)} aria-invalid={Boolean(error && date > todayIso())} />
                </label>
                <label htmlFor="dream-title" className="block">
                  <span className="mb-2 block text-sm font-medium text-text-secondary">Título</span>
                  <Input id="dream-title" ref={titleRef} value={title} onChange={(event) => updateField(setTitle, event.target.value)} placeholder="Añade un título" maxLength={120} aria-invalid={Boolean(error && title.trim().length < 2)} />
                </label>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {error ? <p role="alert" className="rounded-[16px] bg-[rgba(169,26,52,.1)] px-4 py-3 text-sm leading-6 text-memory-accessible [html[data-theme=night]_&]:bg-[rgba(255,145,160,.14)]">{error}</p> : null}
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-quiet)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="min-h-11 px-2 text-sm text-text-secondary underline-offset-4 hover:underline" onClick={closeWithCare}>Cerrar</button>
            <Button type="submit"><Feather className="h-4 w-4" />{isEdit ? "Actualizar" : "Guardar"}</Button>
          </div>
        </form>

        {confirmDiscard ? (
          <div className="surface-hairline mt-6 rounded-[20px] p-4 text-sm leading-6 text-text-secondary" role="alert">
            <p>Hay cambios sin guardar. El borrador sigue en este dispositivo.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={onClose}>Cerrar y guardar borrador</Button>
              <button type="button" className="min-h-10 px-3 text-sm" onClick={() => setConfirmDiscard(false)}>Seguir escribiendo</button>
            </div>
          </div>
        ) : null}
        {isEdit ? <p className="mt-5 flex items-center gap-2 text-xs text-text-muted"><Check className="h-3.5 w-3.5" />{cloud.status === "synced" ? "Cambios sincronizados con tu cuenta." : "Cambios guardados en este dispositivo."}</p> : null}
      </motion.div>
    </motion.div>
  );
}
