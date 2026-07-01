/**
 * Skeleton — UI Primitive
 *
 * Lightweight loading placeholder.
 * Uses a simple CSS pulse animation (no external animation library).
 * Use as a drop-in replacement for content during async loads.
 *
 * Tokens:  @theme design tokens from globals.css
 */
import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-200", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
