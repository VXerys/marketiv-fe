"use client";

import { Lightbulb, AlertTriangle, TrendingUp, X } from "lucide-react";
import { useState } from "react";

type InsightType = "insight" | "warning" | "recommendation";

interface Insight {
  id: string;
  type: string;
  text: string;
}

const INSIGHT_CONFIG: Record<InsightType, { icon: React.ComponentType<{ size?: number; color?: string }>; bg: string; color: string; border: string; headerBg: string }> = {
  insight: {
    icon: TrendingUp,
    bg: "#f0f6ff",
    color: "#2563eb",
    border: "rgba(37,99,235,.18)",
    headerBg: "rgba(37,99,235,.08)",
  },
  warning: {
    icon: AlertTriangle,
    bg: "#fffbeb",
    color: "#d97706",
    border: "rgba(217,119,6,.20)",
    headerBg: "rgba(217,119,6,.08)",
  },
  recommendation: {
    icon: Lightbulb,
    bg: "#fff7ed",
    color: "#ea580c",
    border: "rgba(249,115,22,.20)",
    headerBg: "rgba(249,115,22,.08)",
  },
};

interface InsightSectionProps {
  insights?: Insight[];
  isLoading?: boolean;
  onSearchCreatorClick?: () => void;
  onViewAnalyticsClick?: () => void;
}

export function InsightSection({ insights = [], isLoading = false, onSearchCreatorClick, onViewAnalyticsClick }: InsightSectionProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = insights.filter((i) => !dismissed.includes(i.id));

  return (
    <div
      style={{
        padding: "22px",
        borderRadius: 24,
        border: "1px solid rgba(17,24,39,.08)",
        background:
          "radial-gradient(circle at 0% 100%, rgba(249,115,22,.07), transparent 14rem), linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,255,255,.82))",
        boxShadow: "0 8px 24px rgba(15,23,42,.06)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#ea580c",
            fontSize: ".72rem",
            fontWeight: 900,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          <span style={{ display: "block", width: 14, height: 2, borderRadius: 999, background: "#f97316" }} />
          AI Insight
        </div>
        <h3
          style={{
            fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif",
            fontSize: "1.15rem",
            fontWeight: 700,
            letterSpacing: "-.045em",
            color: "#182033",
            margin: 0,
          }}
        >
          Insight & Rekomendasi
        </h3>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ padding: 16, borderRadius: 18, background: "#f3f5f8", display: "grid", gap: 8 }}>
              <div style={{ width: "40%", height: 14, borderRadius: 8, background: "#edf1f5", position: "relative", overflow: "hidden" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" style={{ animation: "shimmer 1.45s infinite" }} />
              </div>
              <div style={{ width: "90%", height: 12, borderRadius: 8, background: "#edf1f5", position: "relative", overflow: "hidden" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" style={{ animation: "shimmer 1.45s infinite" }} />
              </div>
              <div style={{ width: "70%", height: 12, borderRadius: 8, background: "#edf1f5", position: "relative", overflow: "hidden" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" style={{ animation: "shimmer 1.45s infinite" }} />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 16px", color: "#737f91", fontSize: ".86rem" }}>
          <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>✨</div>
          Tidak ada insight saat ini. Semua berjalan baik!
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {visible.map((insight) => {
            // Map types from mock data to InsightType
            let mappedType: InsightType = "insight";
            if (insight.type === "purple") mappedType = "insight";
            else if (insight.type === "info") mappedType = "recommendation";
            else if (insight.type === "success") mappedType = "insight";
            else if (insight.type === "warning") mappedType = "warning";
            
            const cfg = INSIGHT_CONFIG[mappedType];
            
            // Map action CTA label and action
            let ctaLabel = "";
            let ctaAction = undefined;
            if (insight.text.toLowerCase().includes("kreator")) {
              ctaLabel = "Cari Kreator";
              ctaAction = onSearchCreatorClick;
            } else if (insight.text.toLowerCase().includes("performa") || insight.text.toLowerCase().includes("views")) {
              ctaLabel = "Lihat Analitik";
              ctaAction = onViewAnalyticsClick;
            }

            return (
              <div
                key={insight.id}
                style={{
                  padding: "15px",
                  borderRadius: 18,
                  background: `linear-gradient(180deg, ${cfg.bg}, #ffffff)`,
                  border: `1px solid ${cfg.border}`,
                  boxShadow: "0 6px 16px rgba(15,23,42,.04)",
                  position: "relative",
                }}
              >
                <button
                  onClick={() => setDismissed((d) => [...d, insight.id])}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 24,
                    height: 24,
                    border: "none",
                    borderRadius: 8,
                    background: "transparent",
                    color: "#a0aaba",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={13} />
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                      background: cfg.headerBg,
                      flexShrink: 0,
                    }}
                  >
                    <cfg.icon size={15} color={cfg.color} />
                  </div>
                  <strong style={{ fontSize: ".88rem", letterSpacing: "-.02em", color: "#182033", paddingRight: 20 }}>
                    {mappedType === "insight" ? "Insight Bisnis" : mappedType === "warning" ? "Peringatan Penting" : "Rekomendasi Pintar"}
                  </strong>
                </div>

                <p style={{ margin: "0 0 12px", color: "#556174", fontSize: ".82rem", lineHeight: 1.55 }}>
                  {insight.text}
                </p>

                {ctaLabel && ctaAction && (
                  <button
                    onClick={ctaAction}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      minHeight: 32,
                      padding: "0 12px",
                      borderRadius: 10,
                      border: `1px solid ${cfg.border}`,
                      background: "rgba(255,255,255,.82)",
                      color: cfg.color,
                      fontSize: ".78rem",
                      fontWeight: 790,
                      cursor: "pointer",
                    }}
                  >
                    {ctaLabel} →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
