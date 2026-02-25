import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "soft" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-coral text-white border border-transparent hover:bg-brand-coral/90 shadow-lg shadow-brand-coral/25",
  outline:
    "bg-white/15 text-white border border-white/60 hover:bg-white/25 backdrop-blur-sm",
  soft:
    "bg-pink-50 text-brand-coral border border-pink-200 hover:bg-pink-100",
  ghost:
    "bg-transparent text-white border border-transparent hover:bg-white/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
