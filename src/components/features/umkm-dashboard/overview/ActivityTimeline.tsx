"use client";

import { UserPlus, FileText, CheckCircle, DollarSign, Rocket } from "lucide-react";

type ActivityType = "kreator_bergabung" | "submission_baru" | "campaign_selesai" | "dana_cair" | "campaign_dibuat";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
}

const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ComponentType<{ size?: number; color?: string }>; bg: string; color: string }> = {
  kreator_bergabung: { icon: UserPlus, bg: "#f0f6ff", color: "#2563eb" },
  submission_baru: { icon: FileText, bg: "#f7f3ff", color: "#7c3aed" },
  campaign_selesai: { icon: CheckCircle, bg: "#f1fbf5", color: "#16a34a" },
  dana_cair: { icon: DollarSign, bg: "#fffbeb", color: "#d97706" },
  campaign_dibuat: { icon: Rocket, bg: "#fff7ed", color: "#ea580c" },
};

function ActivitySkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 14, alignItems: "start", marginBottom: 16 }}>
      <div style={{ width: 42, height: 42, borderRadius: 16, background: "#edf1f5", position: "relative", overflow: "hidden" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" style={{ animation: "shimmer 1.45s infinite" }} />
      </div>
      <div style={{ padding: "12px 14px", borderRadius: 18, background: "#f3f5f8" }}>
        <div style={{ width: "55%", height: 14, borderRadius: 8, background: "#edf1f5", marginBottom: 8, position: "relative", overflow: "hidden" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" style={{ animation: "shimmer 1.45s infinite" }} />
        </div>
        <div style={{ width: "80%", height: 12, borderRadius: 8, background: "#edf1f5", position: "relative", overflow: "hidden" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" style={{ animation: "shimmer 1.45s infinite" }} />
        </div>
      </div>
    </div>
  );
}

interface ActivityTimelineProps {
  activities?: Activity[];
  isLoading?: boolean;
}

export function ActivityTimeline({ activities = [], isLoading = false }: ActivityTimelineProps) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: 24,
        border: "1px solid rgba(17,24,39,.08)",
        background:
          "radial-gradient(circle at 100% 0%, rgba(249,115,22,.06), transparent 14rem), linear-gradient(180deg, #ffffff, #fffdf9)",
        boxShadow: "0 8px 24px rgba(15,23,42,.06)",
        /* No min-height — card shrinks to content */
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
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
              marginBottom: 6,
            }}
          >
            <span style={{ display: "block", width: 14, height: 2, borderRadius: 999, background: "#f97316" }} />
            Aktifitas terbaru
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
            Aktivitas Campaign
          </h3>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <ActivitySkeleton key={i} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 16px", color: "#737f91", fontSize: ".86rem" }}>
          Belum ada aktivitas.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, position: "relative" }}>
          {/* Vertical line indicator */}
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 24,
              bottom: 24,
              width: 2,
              background: "linear-gradient(180deg, rgba(249,115,22,.15) 0%, rgba(249,115,22,0) 100%)",
              zIndex: 0,
            }}
          />

          {activities.map((act) => {
            // Map types from mock to config
            let mappedType: ActivityType = "kreator_bergabung";
            if (act.type === "submission") mappedType = "submission_baru";
            else if (act.type === "payment") mappedType = "dana_cair";
            else if (act.type === "campaign") mappedType = "campaign_dibuat";
            
            const cfg = ACTIVITY_CONFIG[mappedType];
            const Icon = cfg.icon;

            return (
              <div key={act.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 14, alignItems: "start", position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 15,
                    display: "grid",
                    placeItems: "center",
                    background: cfg.bg,
                    border: `1px solid ${cfg.color}15`,
                    boxShadow: "0 4px 12px rgba(0,0,0,.03)",
                  }}
                >
                  <Icon size={18} color={cfg.color} />
                </div>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,.6)",
                    border: "1px solid rgba(17,24,39,.04)",
                    boxShadow: "0 2px 8px rgba(0,0,0,.01)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
                    <strong style={{ fontSize: ".84rem", letterSpacing: "-.02em", color: "#182033" }}>{act.title}</strong>
                    <span style={{ fontSize: ".72rem", color: "#a0aaba", fontWeight: 700, whiteSpace: "nowrap" }}>{act.time}</span>
                  </div>
                  <p style={{ margin: 0, color: "#737f91", fontSize: ".8rem", lineHeight: 1.45 }}>{act.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
