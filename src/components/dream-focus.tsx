"use client";

import * as React from "react";
import { ArrowLeft, ExternalLink, Globe2, LockKeyhole, Pencil, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { DreamPearl } from "@/components/dream-pearl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dream } from "@/lib/dreams";
import { formatDreamDate } from "@/lib/dreams";
import { isPublicArchiveAvailable } from "@/lib/archive-state";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

type DreamFocusProps = {
  dream: Dream;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canShare: boolean;
  publicName?: string;
  onPublish: (publicName: string) => Promise<void>;
  onMakePrivate: () => void;
};

const publicPseudonymPattern = /^[\p{L}\p{N}][\p{L}\p{N} '’.-]*$/u;

function publicPseudonymError(value: string) {
  const clean = value.trim().replace(/\s+/g, " ");
  if (clean.length < 2 || clean.length > 32) return "Elige un seudónimo de 2 a 32 caracteres.";
  if (!publicPseudonymPattern.test(clean)) return "Usa letras, números, espacios, guiones, puntos o apóstrofes; no uses correo.";
  return null;
}

export function DreamFocus({ dream, onBack, onEdit, onDelete, canShare, publicName, onPublish, onMakePrivate }: DreamFocusProps) {
  const reducedMotion = useReducedMotion();
  const backRef = React.useRef<HTMLButtonElement>(null);
  const [confirming, setConfirming] = React.useState(false);
  const [confirmingPublic, setConfirmingPublic] = React.useState(false);
  const [pseudonym, setPseudonym] = React.useState(publicName ?? "");
  const [publicError, setPublicError] = React.useState("");
  const isPublic = dream.visibility === "public";

  React.useEffect(() => {
    window.setTimeout(() => backRef.current?.focus(), 30);
  }, []);

  return (
    <motion.section
      aria-label={`Sueño: ${dream.title}`}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      transition={reducedMotion ? reducedTransition : transitions.dream}
      className="fixed inset-0 z-focus overflow-y-auto bg-[color-mix(in_srgb,var(--surface-canvas)_94%,transparent)] px-4 pb-8 pt-24 sm:px-6 sm:pt-28 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <button ref={backRef} type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] px-2 text-sm text-text-secondary transition-colors hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" /> Volver al calendario
        </button>
        <motion.article layoutId={`memory-surface-${dream.id}`} className="material-opal relative mt-5 overflow-hidden rounded-[34px] px-6 py-10 sm:mt-7 sm:rounded-[48px] sm:px-12 sm:py-14 lg:px-16 lg:py-20">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/18 blur-3xl [html[data-theme=night]_&]:bg-mist-blush/[.07]" />
          <div className="relative">
            <div className="flex items-start justify-between gap-8">
              <DreamPearl dream={dream} size="xl" selected layoutId={`pearl-${dream.id}`} />
              <p className="max-w-[13rem] pt-2 text-right text-xs uppercase leading-6 tracking-[0.2em] text-text-muted">{isPublic ? "Público con seudónimo" : "Solo tú"}</p>
            </div>
            <p className="mt-12 text-sm text-text-muted sm:mt-16">{formatDreamDate(dream.date)}</p>
            <h1 className="mt-5 max-w-4xl font-display text-balance text-[clamp(4rem,10vw,9rem)] leading-[.84] tracking-[-0.065em]">{dream.title}</h1>
            <p className="memory-copy mt-10 whitespace-pre-wrap">{dream.body}</p>
            {dream.neuroFileUrl ? (
              <a href={dream.neuroFileUrl} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border-quiet)] px-4 text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:text-text-primary">
                <ExternalLink className="h-3.5 w-3.5" />Abrir referencia EEG / MRI
              </a>
            ) : null}

            <div className="mt-16 flex flex-col gap-5 border-t border-[var(--border-quiet)] pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm leading-6 text-text-muted">Fecha del registro: {formatDreamDate(dream.date)}.</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={onEdit}><Pencil className="h-4 w-4" />Editar</Button>
                {isPublicArchiveAvailable ? (isPublic ? <Button variant="secondary" onClick={onMakePrivate}><LockKeyhole className="h-4 w-4" />Hacer privado</Button> : <Button variant="secondary" onClick={() => setConfirmingPublic(true)} disabled={!canShare}><Globe2 className="h-4 w-4" />Hacerlo público</Button>) : null}
                <Button variant="ghost" onClick={() => setConfirming(true)}><Trash2 className="h-4 w-4" />Eliminar</Button>
              </div>
            </div>
            {!isPublic && isPublicArchiveAvailable && !canShare ? <p className="mt-4 text-sm leading-6 text-text-muted">Sincroniza una copia privada con tu cuenta antes de compartir.</p> : null}
            {!isPublicArchiveAvailable ? <p className="mt-4 text-sm leading-6 text-text-muted">Las publicaciones están desactivadas mientras se completa la revisión de privacidad.</p> : null}

            {isPublicArchiveAvailable && confirmingPublic ? (
              <div className="surface-hairline mt-7 max-w-xl rounded-[22px] p-5 text-sm leading-6 text-text-secondary" role="alert">
                <p>¿Hacer público “{dream.title}”? Se creará una copia con seudónimo. Puedes retirarla después.</p>
                <label className="mt-5 block text-sm font-medium text-text-secondary">Tu seudónimo público
                  <Input value={pseudonym} onChange={(event) => { setPseudonym(event.target.value); setPublicError(""); }} maxLength={32} placeholder="Por ejemplo, Marea quieta" className="mt-2" aria-describedby={publicError ? "pseudonym-error" : undefined} />
                </label>
                <p className="mt-2 text-xs leading-5 text-text-muted">2–32 caracteres. No uses tu correo ni un nombre que no quieras mostrar.</p>
                {publicError ? <p id="pseudonym-error" role="alert" className="mt-2 text-sm text-memory-accessible">{publicError}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => {
                    const validationError = publicPseudonymError(pseudonym);
                    if (validationError) {
                      setPublicError(validationError);
                      return;
                    }
                    void onPublish(pseudonym)
                      .then(() => setConfirmingPublic(false))
                      .catch((error: unknown) => setPublicError(error instanceof Error ? error.message : "No se pudo publicar el sueño."));
                  }}><Globe2 className="h-4 w-4" />Compartir públicamente</Button>
                  <button type="button" className="min-h-10 px-3 text-sm" onClick={() => setConfirmingPublic(false)}>Cancelar</button>
                </div>
              </div>
            ) : null}
            {confirming ? (
              <div className="mt-7 max-w-xl rounded-[22px] border border-[rgba(169,26,52,.23)] bg-[rgba(169,26,52,.07)] p-5 text-sm leading-6 text-text-secondary [html[data-theme=night]_&]:border-[rgba(255,145,160,.26)] [html[data-theme=night]_&]:bg-[rgba(255,145,160,.1)]" role="alert">
                <p>¿Eliminar “{dream.title}”? Podrás deshacerlo durante unos segundos.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={onDelete}>Eliminar sueño</Button>
                  <button type="button" className="min-h-10 px-3 text-sm" onClick={() => setConfirming(false)}>Cancelar</button>
                </div>
              </div>
            ) : null}
          </div>
        </motion.article>
      </div>
    </motion.section>
  );
}
