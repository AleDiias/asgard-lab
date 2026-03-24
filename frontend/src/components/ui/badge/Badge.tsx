import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex max-w-full shrink-0 items-center justify-center truncate rounded-[5px] border px-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-transparent focus-visible:bg-transparent",
      },
      size: {
        /** Compacto — listas densas, legendas */
        sm: "h-[18px] min-h-[18px] min-w-0 py-0 text-[10px] leading-none",
        /** Padrão do design — 49×23 px (mín.) */
        md: "h-[23px] min-h-[23px] min-w-[49px] py-0 text-xs leading-none",
        /** Destaque */
        lg: "h-[28px] min-h-[28px] min-w-[56px] py-0.5 text-sm leading-tight",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
