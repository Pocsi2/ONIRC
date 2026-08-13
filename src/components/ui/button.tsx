import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "motion-material inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[16px] px-5 py-2.5 text-sm font-medium text-text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "surface-pearl hover:-translate-y-0.5 hover:shadow-float active:translate-y-0",
        secondary:
          "surface-frost text-text-secondary hover:bg-white/75 hover:text-text-primary [html[data-theme=night]_&]:hover:bg-white/10",
        ghost:
          "text-text-secondary hover:bg-white/50 hover:text-text-primary [html[data-theme=night]_&]:hover:bg-white/10",
      },
      size: {
        default: "h-11",
        sm: "h-9 rounded-[14px] px-4 text-xs",
        lg: "h-12 rounded-[18px] px-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
