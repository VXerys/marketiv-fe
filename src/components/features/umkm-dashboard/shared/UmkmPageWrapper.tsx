import { cn } from "@/lib/utils";

export interface UmkmPageWrapperProps {
  children: React.ReactNode;
  maxWidth?: number;
  className?: string;
}

/**
 * UmkmPageWrapper — Shared layout container for all UMKM dashboard pages.
 *
 * Standardises:
 *   - Responsive horizontal + vertical padding via clamp()
 *   - CSS Grid vertical stacking with a consistent 26px gap
 *   - Max-width centering (default 1400px, override via `maxWidth` prop)
 *
 * Usage:
 *   <UmkmPageWrapper>             — 1400px max (Overview, Kreator, etc.)
 *   <UmkmPageWrapper maxWidth={1440}> — 1440px max (Campaign list)
 *
 * DO NOT add overflow-y-auto here. Scroll is managed by DashboardShell/SidebarInset.
 */
export function UmkmPageWrapper({
  children,
  maxWidth = 1400,
  className,
}: UmkmPageWrapperProps) {
  return (
    <div
      className={cn("w-full", className)}
      style={{
        padding: "clamp(16px, 3vw, 28px)",
        display: "grid",
        gap: 26,
        alignContent: "start",
        maxWidth: `${maxWidth}px`,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {children}
    </div>
  );
}
