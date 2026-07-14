"use client";

import { Lightbulb, AlertTriangle, TrendingUp, X, ArrowRight } from "lucide-react";
import { useState } from "react";

type InsightType = "insight" | "warning" | "recommendation";

interface Insight {
  id: string;
  type: string;
  text: string;
}

const INSIGHT_CONFIG: Record<InsightType, {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  bg: string;
  color: string;
  border: string;
  iconBg: string;
  pillBg: string;
}> = {
  insight: {
    icon: TrendingUp,
    label: "Insight Bisnis",
    bg: "radial-gradient(circle at 100% 0%, rgba(37,99,235,.12), transparent 14rem), linear-gradient(180deg, #ffffff, #f5f8ff)",
    color: "#2563eb",
    border: "rgba(37,99,235,.14)",
    iconBg: "rgba(37,99,235,.09)",
    pillBg: "rgba(37,99,235,.07)",
  },
  warning: {
    icon: AlertTriangle,
    label: "Perlu Perhatian",
    bg: "radial-gradient(circle at 100% 0%, rgba(217,119,6,.12), transparent 14rem), linear-gradient(180deg, #ffffff, #fffbeb)",
    color: "#d97706",
    border: "rgba(217,119,6,.16)",
    iconBg: "rgba(217,119,6,.09)",
    pillBg: "rgba(217,119,6,.07)",
  },
  recommendation: {
    icon: Lightbulb,
    label: "Rekomendasi",
    bg: "radial-gradient(circle at 100% 0%, rgba(249,115,22,.12), transparent 14rem), linear-gradient(180deg, #ffffff, #fff8ef)",
    color: "#ea580c",
    border: "rgba(249,115,22,.16)",
    iconBg: "rgba(249,115,22,.09)",
    pillBg: "rgba(249,115,22,.07)",
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
  const visible = insights.filter((i) => !dismissed.includes(i.id));

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: 24,
        border: "1px solid rgba(17,24,39,.08)",
        background:
          "radial-gradient(circle at 0% 100%, rgba(249,115,22,.05), transparent 14rem), linear-gradient(180deg, #ffffff 0%, #fffdf9 100%)",
        boxShadow: "0 6px 20px rgba(15,23,42,.05), 0 1px 0 rgba(255,255,255,.9) inset",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
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
              marginBottom: 5,
            }}
          >
            <span style={{ display: "block", width: 14, height: 2, borderRadius: 999, background: "#f97316" }} />
            AI Insight
          </div>
          <h3
            style={{
              fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "-.045em",
              color: "#182033",
              margin: 0,
            }}
          >
            Insight & Rekomendasi
          </h3>
        </div>

        {visible.length > 0 && (
          <span
            style={{
              fontSize: ".7rem",
              fontWeight: 800,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(249,115,22,.07)",
              border: "1px solid rgba(249,115,22,.14)",
              color: "#ea580c",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {visible.length} insight
          </span>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gap: 10 }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                padding: "13px 14px",
                borderRadius: 16,
                background: "#f8fafc",
                border: "1px solid rgba(17,24,39,.05)",
                display: "grid",
                gap: 7,
              }}
            >
              <div style={{ width: "35%", height: 11, borderRadius: 6, background: "#eef2f7", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
              </div>
              <div style={{ width: "90%", height: 10, borderRadius: 6, background: "#eef2f7", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
              </div>
              <div style={{ width: "70%", height: 10, borderRadius: 6, background: "#eef2f7", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "28px 16px",
            borderRadius: 16,
            background: "rgba(249,115,22,.025)",
            border: "1px dashed rgba(249,115,22,.14)",
          }}
        >
          <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>✨</div>
          <div style={{ fontWeight: 700, color: "#182033", fontSize: ".88rem", marginBottom: 3 }}>
            Semua Berjalan Baik!
          </div>
          <div style={{ color: "#737f91", fontSize: ".76rem" }}>
            Tidak ada insight saat ini.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {visible.map((insight) => {
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
              insight.text.toLowerCase().includes("views")
            ) {
              ctaLabel = "Lihat Analitik";
              ctaAction = onViewAnalyticsClick;
            }

            return (
              <div
                key={insight.id}
                className="hover-card-animate"
                style={{
                  position: "relative",
                  padding: "13px 14px",
                  borderRadius: 16,
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  boxShadow: "0 2px 8px rgba(15,23,42,.03)",
                }}
              >
                {/* Dismiss */}
                <button
                  onClick={() => setDismissed((d) => [...d, insight.id])}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 22,
                    height: 22,
                    border: "none",
                    borderRadius: 7,
                    background: "rgba(255,255,255,.65)",
                    color: "#9ca8b8",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    transition: ".15s ease",
                  }}
                >
                  <X size={11} />
                </button>

                {/* Icon + type label */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      display: "grid",
                      placeItems: "center",
                      background: cfg.iconBg,
                      flexShrink: 0,
                    }}
                  >
                    <cfg.icon size={14} color={cfg.color} />
                  </div>
                  <span
                    style={{
                      fontSize: ".72rem",
                      fontWeight: 800,
                      color: cfg.color,
                      letterSpacing: ".01em",
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>

                <p
                  style={{
                    margin: "0 0 10px",
                    color: "#556174",
                    fontSize: ".8rem",
                    lineHeight: 1.55,
                    paddingRight: ctaLabel ? 0 : 18,
                  }}
                >
                  {insight.text}
                </p>

                {ctaLabel && ctaAction && (
                  <button
                    onClick={ctaAction}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      minHeight: 28,
                      padding: "0 10px",
                      borderRadius: 8,
                      border: `1px solid ${cfg.border}`,
                      background: "rgba(255,255,255,.72)",
                      color: cfg.color,
                      fontSize: ".74rem",
                      fontWeight: 780,
                      cursor: "pointer",
                      transition: ".15s ease",
                    }}
                  >
                    {ctaLabel}
                    <ArrowRight size={11} />
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
