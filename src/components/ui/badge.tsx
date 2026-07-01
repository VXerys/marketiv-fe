/**
 * Badge — UI Primitive
 *
 * Variants:    default | success | warning | danger | info | neutral | escrow
 * Style:       rounded pill, small, dashboard-friendly
 * Uses:        cva + cn
 * Tokens:      semantic color tokens from globals.css @theme
 */
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // Base
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        /** General-purpose / brand */
        default: "bg-primary-50 text-primary-700 border border-primary-200",
        /** Confirmed / completed / success */
        success:
          "bg-success-soft text-success-strong border border-success-soft",
        /** Pending / in-review / warning */
        warning:
          "bg-warning-soft text-warning-strong border border-warning-soft",
        /** Error / fraud / rejected */
        danger: "bg-danger-soft text-danger-strong border border-danger-soft",
        /** Informational / processing */
        info: "bg-info-soft text-info-strong border border-info-soft",
        /** Neutral / draft / inactive */
        neutral:
          "bg-neutral-100 text-neutral-700 border border-neutral-200",
        /**
         * Escrow — funds held in trust.
         * Uses secondary (navy) palette to signal financial custody.
         */
        escrow:
          "bg-secondary-50 text-secondary-700 border border-secondary-200",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
