"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void;
};

type ViewTransitionLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  onBeforeTransition?: () => void;
};

export function ViewTransitionLink({
  href,
  className,
  onBeforeTransition,
  onClick,
  onFocus,
  onPointerEnter,
  ...props
}: ViewTransitionLinkProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const prefetch = React.useCallback(() => {
    if (href.startsWith("/")) router.prefetch(href);
  }, [href, router]);

  React.useEffect(() => {
    prefetch();
  }, [prefetch]);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    const transition = (document as ViewTransitionDocument).startViewTransition?.bind(document);

    if (onBeforeTransition) {
      flushSync(onBeforeTransition);
    }

    if (transition && !reducedMotion) {
      transition(() => {
        router.push(href);
      });
      return;
    }

    router.push(href);
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      onFocus={(event) => {
        prefetch();
        onFocus?.(event);
      }}
      onPointerEnter={(event) => {
        prefetch();
        onPointerEnter?.(event);
      }}
      className={cn("focus-visible:outline-none", className)}
      {...props}
    />
  );
}
