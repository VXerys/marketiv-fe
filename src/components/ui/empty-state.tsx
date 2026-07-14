/**
 * EmptyState — UI Primitive
 *
 * Dashboard-friendly empty state for lists, tables, and sections.
 *
 * Props:
 *   icon?       — ReactNode (e.g., Phosphor icon or SVG)
 *   title       — Main empty state heading
 *   description — Supporting text
 *   action?     — Optional CTA (any ReactNode, typically a Button)
 *
 * Uses:    cn
 * Tokens:  @theme design tokens from globals.css
 */
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Optional icon element displayed above the title. */
  icon?: React.ReactNode;
  /** Main heading for the empty state. */
  title: string;
  /** Supporting description text. */
  description: string;
  /** Optional action element (e.g., a Button component). */
  action?: React.ReactNode;
  /** Additional class names for the root wrapper. */
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 px-6 text-center",
        className
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          {icon}
        </div>
      )}

      <div className="flex flex-col gap-1.5 max-w-sm">
        <h3 className="text-heading-2 text-text-primary">{title}</h3>
        <p className="text-body-base text-text-muted">{description}</p>
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
