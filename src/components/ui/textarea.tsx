import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "surface-frost motion-standard min-h-48 w-full resize-none rounded-[22px] px-5 py-5 text-base leading-7 text-text-primary placeholder:text-text-muted transition focus:bg-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] [html[data-theme=night]_&]:focus:bg-white/10",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
