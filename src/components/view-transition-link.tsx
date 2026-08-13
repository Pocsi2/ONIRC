"use client";

import * as React from "react";
import { flushSync } from "react-dom";
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
  ...props
}: ViewTransitionLinkProps) {
  const router = useRouter();

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

    if (transition) {
      transition(() => {
        flushSync(() => router.push(href));
      });
      return;
    }

    router.push(href);
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn("focus-visible:outline-none", className)}
      {...props}
    />
  );
}
