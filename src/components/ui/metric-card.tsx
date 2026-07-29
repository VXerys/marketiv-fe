import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { formatCompactCurrency, formatCurrency } from "@/lib/formatters";

/**
 * Kartu metrik kanonik untuk seluruh dashboard — UMKM, Kreator, dan Admin.
 *
 * Menggantikan empat implementasi yang sebelumnya hidup terpisah:
 * `features/dashboard/shared/DashboardMetricCard`, `umkm-dashboard/shared/
 * DashboardMetricCard`, `creator-dashboard/CreatorMetricCard`, dan
 * `features/dashboard/MetricBlock` — plus tiga tile yang di-hand-roll langsung
 * di dalam view Kreator (`StatTile`, `SummaryCard`, `MetricTile`).
 *
 * Ketujuhnya menampilkan susunan yang sama persis — chip ikon, label kapital,
 * nilai `font-display`, helper — tapi masing-masing memakai palet sendiri, dan
 * tiga di antaranya menuliskan hex mentah (`#1e1b4b`, `#7c3aed`) yang tidak ada
 * di token mana pun. Itulah sumber "gradien biru-violet vs orange vs violet"
 * yang bikin ketiga dashboard terasa dari produk berbeda.
 *
 * Semua warna di sini datang dari token `@theme` di `globals.css`. Jangan
 * menambah hex mentah — kalau sebuah tone belum ada, tambahkan tokennya dulu.
 */

export type MetricTone =
  | "default"
  | "primary"
  | "kreator"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent";

export type MetricTrendDirection = "up" | "down" | "neutral";
export type MetricCurrency = "none" | "compact" | "full";

/** Chip ikon: latar, teks, dan border per tone. Semuanya token, bukan hex. */
const toneIconClasses: Record<MetricTone, string> = {
  default: "bg-neutral-100 text-text-secondary border-border-soft",
  primary: "bg-primary-50 text-primary-700 border-primary-200/60",
  kreator: "bg-role-kreator-bg text-role-kreator-text border-role-kreator-border",
  success: "bg-success-soft text-success-strong border-success/20",
  warning: "bg-warning-soft text-warning-strong border-warning/20",
  danger: "bg-danger-soft text-danger-strong border-danger/20",
  info: "bg-info-soft text-info-strong border-info/20",
  accent: "bg-role-admin-bg text-role-admin-text border-role-admin-border",
};

/** Border + bayangan kartu saat `highlight`, mengikuti tone yang sama. */
const toneHighlightClasses: Record<MetricTone, string> = {
  default: "border-border-soft",
  primary: "border-primary-200/60 bg-gradient-to-br from-primary-50/30 to-surface-card",
  kreator: "border-role-kreator-border/70 bg-gradient-to-br from-role-kreator-bg/40 to-surface-card",
  success: "border-success/25 bg-gradient-to-br from-success-soft/30 to-surface-card",
  warning: "border-warning/25 bg-gradient-to-br from-warning-soft/30 to-surface-card",
  danger: "border-danger/25 bg-gradient-to-br from-danger-soft/30 to-surface-card",
  info: "border-info/25 bg-gradient-to-br from-info-soft/30 to-surface-card",
  accent: "border-role-admin-border/70 bg-gradient-to-br from-role-admin-bg/40 to-surface-card",
};

const trendClasses: Record<MetricTrendDirection, string> = {
  up: "text-success",
  down: "text-danger",
  neutral: "text-text-muted",
};

const trendIcons: Record<MetricTrendDirection, ReactNode> = {
  up: (
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-9 9-4-4-6 6" />
    </svg>
  ),
  down: (
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-9-9-4 4-6-6" />
    </svg>
  ),
  neutral: null,
};

function formatValue(value: ReactNode, currency: MetricCurrency): ReactNode {
  if (typeof value !== "number") return value;
  if (currency === "full") return formatCurrency(value);
  if (currency === "compact") return formatCompactCurrency(value);
  return value.toLocaleString("id-ID");
}

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  /** Baris kecil di bawah nilai — konteks, bukan nilai kedua. */
  helper?: ReactNode;
  icon?: ReactNode;
  tone?: MetricTone;
  /** Hanya berlaku saat `value` bertipe number. */
  currency?: MetricCurrency;
  /** Pil kecil di pojok kanan atas, mis. "Utama". */
  badge?: string;
  trend?: { text: string; direction?: MetricTrendDirection };
  /** Menonjolkan satu kartu di dalam satu grid — pakai maksimal satu per grid. */
  highlight?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = "default",
  currency = "none",
  badge,
  trend,
  highlight = false,
  className,
}: MetricCardProps) {
  const trendDirection = trend?.direction ?? "neutral";

  return (
    <div
      className={cn(
        "group relative min-w-0 select-none rounded-2xl border p-3.5 shadow-xs transition-all duration-300 sm:rounded-[22px] sm:p-4.5",
        "hover:-translate-y-1 hover:shadow-md hover:border-primary-500/20",
        highlight ? toneHighlightClasses[tone] : "border-border-soft bg-gradient-to-b from-surface-card to-surface-card-soft/60",
        className,
      )}
    >
      {(icon || badge) && (
        <div className="mb-2.5 flex items-center justify-between gap-3 sm:mb-3.5">
          {icon ? (
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-xs transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10 sm:rounded-[14px]",
                "[&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-5 sm:[&>svg]:w-5",
                toneIconClasses[tone],
              )}
            >
              {icon}
            </div>
          ) : (
            <span />
          )}
          {badge && (
            <span className="shrink-0 rounded-full border border-border-soft bg-neutral-50 px-2.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-text-secondary">
              {badge}
            </span>
          )}
        </div>
      )}

      <div className="truncate text-[0.66rem] font-extrabold uppercase leading-none tracking-wide text-text-muted sm:text-[0.74rem]">
        {label}
      </div>

      {/* `break-all` disengaja: nominal rupiah panjang tidak boleh merusak grid di 375px. */}
      <div className="mt-1 break-all font-display text-[1.2rem] font-black leading-none tracking-tight text-text-primary sm:mt-1.5 sm:text-[1.4rem] lg:text-[1.55rem]">
        {formatValue(value, currency)}
      </div>

      {(trend || helper) && (
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5 sm:mt-1.5">
          {trend && (
            <span className={cn("inline-flex shrink-0 items-center gap-0.5 text-[0.68rem] font-extrabold", trendClasses[trendDirection])}>
              {trendIcons[trendDirection]}
              <span>{trend.text}</span>
            </span>
          )}
          {helper && (
            <span className="min-w-0 truncate text-[0.68rem] font-semibold leading-none text-text-muted sm:text-[0.74rem]">
              {helper}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
