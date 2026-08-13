"use client";

import { FormEvent, useState } from "react";
import { Check, Chrome, LogIn, LogOut, Mail, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  createAccountWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutOfOnirc,
  useAuthSession,
} from "@/lib/auth-store";
import { reducedTransition, transitions } from "@/lib/motion/tokens";

function friendlyAuthError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "El correo o la contraseña no coinciden.";
  if (code.includes("email-already-in-use")) return "Este correo ya tiene una cuenta. Prueba con Ingresar.";
  if (code.includes("weak-password")) return "Usa una contraseña de al menos 6 caracteres.";
  if (code.includes("popup-closed")) return "Cerraste la ventana de Google antes de terminar.";
  if (code.includes("unauthorized-domain")) return "Este dominio aún no está autorizado en Firebase.";
  return "No fue posible verificar tu cuenta. Inténtalo otra vez.";
}

export function AuthControl() {
  const { ready, user } = useAuthSession();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<"google" | "email" | "sign-out" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const close = () => {
    if (!pending) {
      setOpen(false);
      setError(null);
    }
  };

  const useGoogle = async () => {
    setPending("google");
    setError(null);
    try {
      await signInWithGoogle();
      setOpen(false);
    } catch (caught) {
      setError(friendlyAuthError(caught));
    } finally {
      setPending(null);
    }
  };

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending("email");
    setError(null);
    try {
      if (mode === "sign-in") await signInWithEmail(email.trim(), password);
      else await createAccountWithEmail(email.trim(), password);
      setOpen(false);
      setPassword("");
    } catch (caught) {
      setError(friendlyAuthError(caught));
    } finally {
      setPending(null);
    }
  };

  const leaveAccount = async () => {
    setPending("sign-out");
    try {
      await signOutOfOnirc();
    } finally {
      setPending(null);
    }
  };

  if (user) {
    const name = user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Cuenta";
    return (
      <div className="flex items-center gap-1.5">
        <span className="hidden max-w-28 truncate text-xs text-text-muted md:inline">{name}</span>
        <Button variant="ghost" size="sm" className="min-h-11 rounded-[16px] px-3" onClick={leaveAccount} disabled={pending === "sign-out"} aria-label="Cerrar sesión">
          <LogOut className="h-4 w-4" />
          <span className="hidden lg:inline">Salir</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button variant="secondary" size="sm" className="min-h-11 rounded-[16px] px-3" onClick={() => setOpen(true)} disabled={!ready}>
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Ingresar</span>
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div className="fixed inset-0 z-feedback flex items-end bg-[rgba(33,28,26,.28)] p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reducedMotion ? reducedTransition : transitions.standard} role="presentation" onMouseDown={close}>
            <motion.section role="dialog" aria-modal="true" aria-labelledby="auth-title" className="surface-opal w-full max-w-md rounded-[32px] p-6 sm:p-8" initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.99 }} transition={reducedMotion ? reducedTransition : transitions.expressive} onMouseDown={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-muted">Cuenta Onirc</p>
                  <h2 id="auth-title" className="mt-2 font-display text-4xl tracking-[-0.04em] text-text-primary">{mode === "sign-in" ? "Vuelve a tus recuerdos." : "Dales un lugar propio."}</h2>
                </div>
                <button type="button" className="material-button grid min-h-11 min-w-11 place-items-center rounded-[16px]" onClick={close} aria-label="Cerrar acceso" disabled={Boolean(pending)}><X className="h-4 w-4" /></button>
              </div>

              <p className="mt-4 text-sm leading-6 text-text-secondary">Verifica tu cuenta ahora. La sincronización privada de memorias se activará al configurar Firestore.</p>
              <Button type="button" variant="secondary" className="mt-6 w-full" onClick={useGoogle} disabled={Boolean(pending)}><Chrome className="h-4 w-4" />{pending === "google" ? "Abriendo Google…" : "Continuar con Google"}</Button>
              <div className="my-5 flex items-center gap-3 text-xs text-text-muted"><span className="h-px flex-1 bg-[var(--border-light)]" /> o con correo <span className="h-px flex-1 bg-[var(--border-light)]" /></div>

              <form className="space-y-4" onSubmit={submitEmail}>
                <label className="block text-sm font-medium text-text-secondary">Correo electrónico
                  <span className="surface-frost mt-2 flex min-h-12 items-center gap-3 rounded-[16px] px-4"><Mail className="h-4 w-4 text-text-muted" /><input className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-muted" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" required /></span>
                </label>
                <label className="block text-sm font-medium text-text-secondary">Contraseña
                  <input className="surface-frost mt-2 min-h-12 w-full rounded-[16px] px-4 outline-none placeholder:text-text-muted" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Al menos 6 caracteres" minLength={6} required />
                </label>
                {error ? <p role="alert" className="text-sm leading-6 text-[var(--color-memory-accessible)]">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={Boolean(pending)}>{pending === "email" ? "Verificando…" : mode === "sign-in" ? "Ingresar" : "Crear cuenta"}</Button>
              </form>
              <button type="button" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-text-secondary underline decoration-[var(--border-light)] underline-offset-4" onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(null); }} disabled={Boolean(pending)}><Check className="h-4 w-4" />{mode === "sign-in" ? "Crear una cuenta con correo" : "Ya tengo una cuenta"}</button>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
