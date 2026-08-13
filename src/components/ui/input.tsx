import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "surface-frost motion-standard flex min-h-14 w-full rounded-[22px] px-5 text-base text-text-primary placeholder:text-text-muted transition focus:bg-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(145,188,194,.72)]",
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
