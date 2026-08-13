import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "surface-frost motion-standard flex min-h-14 w-full rounded-[18px] px-5 text-base text-text-primary placeholder:text-text-muted transition focus:bg-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] [html[data-theme=night]_&]:focus:bg-white/10",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
