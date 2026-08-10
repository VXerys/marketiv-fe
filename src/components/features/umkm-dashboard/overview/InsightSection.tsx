"use client";

import { Lightbulb, AlertTriangle, TrendingUp, X, ArrowRight } from "lucide-react";
import { useState } from "react";

type InsightType = "insight" | "warning" | "recommendation";

interface Insight {
  id: string;
  type: string;
  text: string;
}

const FALLBACK_INSIGHTS: Insight[] = [
  {
    id: "fb-1",
    type: "recommendation",
    text: "Optimalisasi Jam Posting: Upload video di jam 18.00 - 21.00 untuk potensi views maksimal.",
  },
  {
    id: "fb-2",
    type: "insight",
    text: "Tingkatkan Retensi: Sertakan promo unik di 3 detik pertama video campaign.",
  },
];

const INSIGHT_CONFIG: Record<InsightType, {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  bg: string;
  color: string;
  border: string;
  iconBg: string;
}> = {
  insight: {
    icon: TrendingUp,
    label: "Analisis Bisnis",
    bg: "radial-gradient(circle at 100% 0%, rgba(37,99,235,.12), transparent 14rem), linear-gradient(180deg, #ffffff, #f5f8ff)",
    color: "#2563eb",
    border: "rgba(37,99,235,.14)",
    iconBg: "rgba(37,99,235,.09)",
  },
  warning: {
    icon: AlertTriangle,
    label: "Perlu Perhatian",
    bg: "radial-gradient(circle at 100% 0%, rgba(217,119,6,.12), transparent 14rem), linear-gradient(180deg, #ffffff, #fffbeb)",
    color: "#d97706",
    border: "rgba(217,119,6,.16)",
    iconBg: "rgba(217,119,6,.09)",
  },
  recommendation: {
    icon: Lightbulb,
    label: "Rekomendasi",
    bg: "radial-gradient(circle at 100% 0%, rgba(249,115,22,.12), transparent 14rem), linear-gradient(180deg, #ffffff, #fff8ef)",
    color: "#ea580c",
    border: "rgba(249,115,22,.16)",
    iconBg: "rgba(249,115,22,.09)",
  },
};

interface InsightSectionProps {
  insights?: Insight[];
  isLoading?: boolean;
  onSearchCreatorClick?: () => void;
  onViewAnalyticsClick?: () => void;
}

export function InsightSection({
  insights = [],
  isLoading = false,
  onSearchCreatorClick,
  onViewAnalyticsClick,
}: InsightSectionProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const userVisible = insights.filter((i) => !dismissed.includes(i.id));
  
  // Combine user insights with fallbacks so 4 grid slots are always filled
  const combined = [...userVisible];
  for (const fb of FALLBACK_INSIGHTS) {
    if (combined.length < 4 && !dismissed.includes(fb.id)) {
      combined.push(fb);
    }
  }
  const displayInsights = combined.slice(0, 4);

  return (
    <div
      className="relative rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] h-full flex flex-col justify-between"
    >
      <div className="flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 block mb-0.5">
              REKOMENDASI CERDAS
            </span>
            <h3 className="text-base font-black text-slate-900 tracking-tight font-display">
              Saran & Rekomendasi
            </h3>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200/60 text-[10px] font-extrabold shrink-0">
            {displayInsights.length} saran
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-2.5 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-50 space-y-2">
                <div className="w-1/2 h-3 rounded bg-slate-200 animate-pulse" />
                <div className="w-full h-8 rounded bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          /* Grid 2×2 matching QuickActions */
          <div className="grid grid-cols-2 gap-2.5 flex-1">
            {displayInsights.map((insight) => {
              let mappedType: InsightType = "insight";
              if (insight.type === "warning") mappedType = "warning";
              else if (insight.type === "info" || insight.type === "purple" || insight.type === "success") mappedType = "insight";
              else mappedType = "recommendation";

              const cfg = INSIGHT_CONFIG[mappedType];

              let ctaLabel = "";
              let ctaAction: (() => void) | undefined;
              if (insight.text.toLowerCase().includes("kreator")) {
                ctaLabel = "Cari Kreator";
                ctaAction = onSearchCreatorClick;
              } else if (
                insight.text.toLowerCase().includes("performa") ||
                insight.text.toLowerCase().includes("views") ||
                insight.text.toLowerCase().includes("analisis")
              ) {
                ctaLabel = "Lihat Analitik";
                ctaAction = onViewAnalyticsClick;
              } else {
                ctaLabel = "Pelajari";
                ctaAction = onViewAnalyticsClick;
              }

              return (
                <div
                  key={insight.id}
                  className="hover-card-animate relative p-3 rounded-2xl border flex flex-col justify-between transition-all"
                  style={{
                    background: cfg.bg,
                    borderColor: cfg.border,
                  }}
                >
                  {/* Dismiss */}
                  <button
                    type="button"
                    onClick={() => setDismissed((d) => [...d, insight.id])}
                    className="absolute top-2.5 right-2.5 w-4 h-4 rounded-md border-0 bg-white/70 hover:bg-white text-slate-400 hover:text-slate-700 grid place-items-center cursor-pointer transition-colors"
                  >
                    <X size={10} />
                  </button>

                  <div>
                    {/* Icon + type label */}
                    <div className="flex items-center gap-1.5 mb-1.5 pr-4">
                      <div
                        className="w-5 h-5 rounded-md grid place-items-center shrink-0"
                        style={{ background: cfg.iconBg }}
                      >
                        <cfg.icon size={12} color={cfg.color} />
                      </div>
                      <span
                        className="text-[10px] font-black tracking-tight truncate"
                        style={{ color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    <p className="text-[10px] font-medium text-slate-600 leading-tight line-clamp-3 mb-1">
                      {insight.text}
                    </p>
                  </div>

                  {ctaLabel && (
                    <button
                      type="button"
                      onClick={ctaAction}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-white/80 hover:bg-white transition-colors cursor-pointer border self-start mt-1"
                      style={{
                        borderColor: cfg.border,
                        color: cfg.color,
                      }}
                    >
                      <span>{ctaLabel}</span>
                      <ArrowRight size={9} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


