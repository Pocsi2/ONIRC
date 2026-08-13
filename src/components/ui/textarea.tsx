import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "surface-frost motion-standard min-h-48 w-full resize-none rounded-[28px] px-5 py-5 text-base leading-7 text-text-primary placeholder:text-text-muted transition focus:bg-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(145,188,194,.72)]",
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
