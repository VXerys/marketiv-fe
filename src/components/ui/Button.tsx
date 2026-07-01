/**
 * Button — UI Primitive
 *
 * Variants:    primary | secondary | outline | ghost | danger
 * Sizes:       sm | md | lg | icon
 * Supports:    disabled, className, asChild-less href via next/link
 * Uses:        cva + cn
 * Tokens:      @theme design tokens from globals.css
 */
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-full font-semibold whitespace-nowrap",
    "transition-all duration-200 cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        /** Marketiv Orange — primary CTA */
        primary:
          "bg-primary text-white border border-transparent hover:bg-primary-600 shadow-sm shadow-primary/20",
        /** Muted warm secondary — lower emphasis */
        secondary:
          "bg-neutral-100 text-text-primary border border-border-subtle hover:bg-neutral-200",
        /** Soft / tinted — light orange wash for secondary actions */
        soft:
          "bg-primary-50 text-primary border border-primary-100 hover:bg-primary-100",
        /** Outlined — ghost with border */
        outline:
          "bg-transparent text-primary border border-primary hover:bg-primary-50",
        /** No background — minimal emphasis */
        ghost:
          "bg-transparent text-text-secondary border border-transparent hover:bg-neutral-100",
        /** Destructive action */
        danger:
          "bg-danger text-white border border-transparent hover:bg-danger-strong shadow-sm shadow-danger/20",
      },
      size: {
        sm: "h-8 px-4 text-xs",
        md: "h-10 px-6 text-sm",
        lg: "h-12 px-8 text-base font-bold",
        /** Extra-large — for hero/landing CTAs */
        xl: "px-6 py-3 sm:px-8 sm:py-3.5 min-w-[200px] sm:min-w-[220px] text-base sm:text-lg font-bold",
        /** Square icon-only button — pair with an icon child */
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** When provided, renders as a next/link anchor. */
  href?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

export function Button({
  variant,
  size,
  href,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link
        href={href}
        className={cn(classes, disabled && "pointer-events-none opacity-50")}
        aria-disabled={disabled}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
