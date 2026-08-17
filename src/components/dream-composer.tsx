"use client";

import * as React from "react";
import { Check, Feather, Globe2, Link2, LockKeyhole, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Dream, DreamDraft } from "@/lib/dreams";
import { normalizeNeuroFileUrl, todayIso, type DreamVisibility } from "@/lib/dreams";
import { useDreamStore } from "@/lib/dreams-store";
import { isPublicArchiveAvailable } from "@/lib/archive-state";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

type ComposerProps = {
  mode: "create" | "edit";
  dream?: Dream;
  initialDate: string;
  onClose: () => void;
  onSaved: (dream: Dream) => void;
};

const publicPseudonymPattern = /^[\p{L}\p{N}][\p{L}\p{N} '’.-]*$/u;

function focusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
}

export function DreamComposer({ mode, dream, initialDate, onClose, onSaved }: ComposerProps) {
  const reducedMotion = useReducedMotion();
  const { addDream, updateDream, savedDraft, saveLocalDraft, clearLocalDraft, cloud, publishDream, makeDreamPrivate } = useDreamStore();
  const isEdit = mode === "edit" && Boolean(dream);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  const titleRef = React.useRef<HTMLInputElement>(null);
  const initialDraftRef = React.useRef(savedDraft);
  const [date, setDate] = React.useState(initialDate);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [neuroFileUrl, setNeuroFileUrl] = React.useState("");
  const [showNeuroLink, setShowNeuroLink] = React.useState(false);
  const [visibility, setVisibility] = React.useState<DreamVisibility>("private");
  const [pseudonym, setPseudonym] = React.useState(cloud.publicName ?? "");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);
  const hasNarrative = body.trim().length > 0;
  const revealDetails = isEdit || hasNarrative;

  React.useEffect(() => {
    const source = isEdit && dream ? dream : initialDraftRef.current;
    setDate(source?.date ?? initialDate);
    setTitle(source?.title ?? "");
    setBody(source?.body ?? "");
    setNeuroFileUrl(source?.neuroFileUrl ?? "");
    setShowNeuroLink(Boolean(source?.neuroFileUrl));
    setVisibility(isEdit && dream?.visibility === "public" ? "public" : "private");
    setPseudonym(cloud.publicName ?? "");
    setError("");
    setIsDirty(false);
    window.setTimeout(() => bodyRef.current?.focus(), 40);
  }, [cloud.publicName, dream, initialDate, isEdit]);

  React.useEffect(() => {
    if (isEdit || !isDirty) return;
    const timer = window.setTimeout(() => saveLocalDraft({ date, title, body, neuroFileUrl }), 280);
    return () => window.clearTimeout(timer);
  }, [body, date, isDirty, isEdit, neuroFileUrl, saveLocalDraft, title]);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitted = new FormData(event.currentTarget);
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
    const submittedNeuroUrl = submitted.get("neuroFileUrl");
    const normalizedNeuroUrl = normalizeNeuroFileUrl(typeof submittedNeuroUrl === "string" ? submittedNeuroUrl : neuroFileUrl);
    if (normalizedNeuroUrl === null) {
      setError("El enlace EEG/fMRI debe ser una URL segura que empiece con https://");
      return;
    }
    const submittedPseudonym = submitted.get("publicName");
    const cleanPseudonym = (typeof submittedPseudonym === "string" ? submittedPseudonym : pseudonym).trim().replace(/\s+/g, " ");
    if (visibility === "public") {
      if (!isPublicArchiveAvailable || cloud.status !== "synced") {
        setError("Inicia sesión y sincroniza tu cuenta antes de hacerlo público.");
        return;
      }
      if (cleanPseudonym.length < 2 || cleanPseudonym.length > 32) {
        setError("Elige un seudónimo público de 2 a 32 caracteres.");
        return;
      }
      if (!publicPseudonymPattern.test(cleanPseudonym)) {
        setError("El seudónimo sólo puede usar letras, números, espacios, guiones, puntos o apóstrofes.");
        return;
      }
    }
    const draft: DreamDraft = { date, title: cleanTitle, body: cleanBody, neuroFileUrl: normalizedNeuroUrl };
    setSaving(true);
    const saved = isEdit && dream ? updateDream(dream.id, draft) : addDream(draft);
    if (!saved) {
      setError("Registro no encontrado.");
      setSaving(false);
      return;
    }
    try {
      if (visibility === "public" && saved.visibility !== "public") await publishDream(saved.id, cleanPseudonym);
      if (visibility === "private" && saved.visibility === "public") await makeDreamPrivate(saved.id);
    } catch {
      // The private source is already preserved. The store exposes the precise
      // cloud error and the detail view remains the safe retry path.
    }
    clearLocalDraft();
    setIsDirty(false);
    setSaving(false);
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
            <p id="dream-composer-description" className="mt-3 max-w-md text-sm leading-6 text-text-secondary">{visibility === "public" ? "Primero se preserva en privado; después se crea la copia pública." : cloud.status === "synced" ? "Guardado en este dispositivo y sincronizado con tu cuenta." : "Guardado en este dispositivo. No se comparte."}</p>
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
          {revealDetails ? (
            <div className="space-y-5">
              <fieldset>
                <legend className="text-sm font-medium text-text-secondary">Privacidad</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-[20px] border border-[var(--border-quiet)] bg-white/20 p-1.5 [html[data-theme=night]_&]:bg-white/[.025]">
                  <button type="button" aria-pressed={visibility === "private"} onClick={() => { setVisibility("private"); setIsDirty(true); setError(""); }} className={`flex min-h-11 items-center justify-center gap-2 rounded-[15px] px-3 text-sm transition-[color,background-color,box-shadow] ${visibility === "private" ? "bg-[var(--surface-canvas)] text-text-primary shadow-soft" : "text-text-muted"}`}><LockKeyhole className="h-3.5 w-3.5" />Privado</button>
                  <button type="button" aria-pressed={visibility === "public"} onClick={() => { setVisibility("public"); setIsDirty(true); setError(""); }} className={`flex min-h-11 items-center justify-center gap-2 rounded-[15px] px-3 text-sm transition-[color,background-color,box-shadow] ${visibility === "public" ? "bg-[var(--surface-canvas)] text-text-primary shadow-soft" : "text-text-muted"}`}><Globe2 className="h-3.5 w-3.5" />Hacer público</button>
                </div>
                <p className="mt-2 text-xs leading-5 text-text-muted">Privado por defecto. La copia pública muestra el relato y tu seudónimo, nunca el enlace clínico.</p>
              </fieldset>

              {visibility === "public" ? (
                <label htmlFor="dream-pseudonym" className="block">
                  <span className="mb-2 block text-sm font-medium text-text-secondary">Seudónimo público</span>
                  <Input id="dream-pseudonym" name="publicName" value={pseudonym} onChange={(event) => updateField(setPseudonym, event.target.value)} placeholder="Cómo quieres firmarlo" maxLength={32} autoComplete="off" />
                  {cloud.status !== "synced" ? <span className="mt-2 block text-xs leading-5 text-text-muted">Necesitas iniciar sesión y sincronizar antes de publicar.</span> : null}
                </label>
              ) : null}

              {showNeuroLink ? (
                <label htmlFor="dream-neuro-file" className="block">
                  <span className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-text-secondary">
                    <span className="flex items-center gap-2"><Link2 className="h-3.5 w-3.5" />EEG / fMRI <span className="font-normal text-text-muted">opcional</span></span>
                    <button type="button" className="min-h-9 px-2 text-xs font-normal text-text-muted underline-offset-4 hover:underline" onClick={() => { setNeuroFileUrl(""); setShowNeuroLink(false); setIsDirty(true); }}>Quitar</button>
                  </span>
                  <Input id="dream-neuro-file" name="neuroFileUrl" type="url" inputMode="url" value={neuroFileUrl} onChange={(event) => updateField(setNeuroFileUrl, event.target.value)} placeholder="https://…" maxLength={2048} aria-describedby="dream-neuro-file-note" />
                  <span id="dream-neuro-file-note" className="mt-2 block text-xs leading-5 text-text-muted">Sólo enlaza una referencia segura. Permanece en tu memoria privada y no se publica.</span>
                </label>
              ) : (
                <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border-quiet)] px-4 text-sm text-text-secondary transition-colors hover:text-text-primary" onClick={() => { setShowNeuroLink(true); setIsDirty(true); }}><Link2 className="h-3.5 w-3.5" />Vincular EEG / fMRI</button>
              )}
            </div>
          ) : null}
          {error ? <p role="alert" className="rounded-[16px] bg-[rgba(169,26,52,.1)] px-4 py-3 text-sm leading-6 text-memory-accessible [html[data-theme=night]_&]:bg-[rgba(255,145,160,.14)]">{error}</p> : null}
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-quiet)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="min-h-11 px-2 text-sm text-text-secondary underline-offset-4 hover:underline" onClick={closeWithCare}>Cerrar</button>
            <Button type="submit" disabled={saving}><Feather className="h-4 w-4" />{saving ? "Guardando…" : isEdit ? "Actualizar" : visibility === "public" ? "Guardar y publicar" : "Guardar"}</Button>
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
