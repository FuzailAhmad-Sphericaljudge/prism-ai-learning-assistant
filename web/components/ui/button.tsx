import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prism-violet/50 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 text-white hover:bg-white/15 border border-white/10 backdrop-blur-md shadow-sm",
        primary:
          "bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#F472B6] text-white font-semibold shadow-prism-glow hover:opacity-95 hover:shadow-lg hover:shadow-prism-violet/30",
        ghost:
          "text-foreground-muted hover:text-white hover:bg-white/[0.06] border border-transparent",
        glass:
          "bg-[#0E1018]/80 text-foreground border border-white/[0.08] backdrop-blur-md hover:bg-[#161926] hover:border-white/[0.16] shadow-glass",
        outline:
          "border border-white/15 bg-transparent hover:bg-white/[0.04] text-foreground hover:border-white/25",
        destructive:
          "bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25",
        link: "text-prism-cyan underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base font-semibold",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
