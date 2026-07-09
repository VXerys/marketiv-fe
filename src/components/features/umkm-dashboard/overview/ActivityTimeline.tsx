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

const ACTIVITY_CONFIG: Record<ActivityType, {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  bg: string;
  color: string;
  border: string;
}> = {
  kreator_bergabung: { icon: UserPlus,    bg: "#f0f6ff", color: "#2563eb", border: "rgba(37,99,235,.18)" },
  submission_baru:   { icon: FileText,    bg: "#f7f3ff", color: "#7c3aed", border: "rgba(124,58,237,.18)" },
  campaign_selesai:  { icon: CheckCircle, bg: "#f1fbf5", color: "#16a34a", border: "rgba(22,163,74,.18)" },
  dana_cair:         { icon: DollarSign,  bg: "#fffbeb", color: "#d97706", border: "rgba(217,119,6,.18)" },
  campaign_dibuat:   { icon: Rocket,      bg: "#fff7ed", color: "#ea580c", border: "rgba(234,88,12,.18)" },
};

interface ActivityTimelineProps {
  activities?: Activity[];
  isLoading?: boolean;
}

export function ActivityTimeline({ activities = [], isLoading = false }: ActivityTimelineProps) {
  return (
    <div
      className="relative"
      style={{
        padding: "20px",
        borderRadius: 24,
        border: "1px solid rgba(17,24,39,.08)",
        background:
          "radial-gradient(circle at 100% 0%, rgba(249,115,22,.05), transparent 14rem), linear-gradient(180deg, #ffffff 0%, #fffdf9 100%)",
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
          marginBottom: 18,
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
            Aktivitas Terbaru
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
            Aktivitas Campaign
          </h3>
        </div>

        {activities.length > 0 && (
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
            {activities.length} aktivitas
          </span>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 12, alignItems: "start" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  background: "#eef2f7",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)",
                    animation: "shimmer 1.45s infinite",
                  }}
                />
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 14, background: "#f8fafc" }}>
                <div style={{ width: "55%", height: 12, borderRadius: 6, background: "#eef2f7", marginBottom: 8, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
                </div>
                <div style={{ width: "80%", height: 10, borderRadius: 6, background: "#eef2f7", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "28px 16px",
            borderRadius: 16,
            background: "rgba(249,115,22,.025)",
            border: "1px dashed rgba(249,115,22,.14)",
          }}
        >
          <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>📭</div>
          <div style={{ fontWeight: 700, color: "#182033", fontSize: ".86rem", marginBottom: 3 }}>
            Belum Ada Aktivitas
          </div>
          <div style={{ color: "#737f91", fontSize: ".76rem" }}>
            Aktivitas campaign akan muncul di sini.
          </div>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Vertical timeline connector */}
          <div
            style={{
              position: "absolute",
              left: 19,
              top: 20,
              bottom: 20,
              width: 1,
              borderRadius: 999,
              background: "linear-gradient(180deg, rgba(249,115,22,.22) 0%, rgba(249,115,22,.04) 100%)",
              zIndex: 0,
            }}
          />

          <div style={{ display: "grid", gap: 12 }}>
            {activities.map((act) => {
              let mappedType: ActivityType = "kreator_bergabung";
              if (act.type === "submission") mappedType = "submission_baru";
              else if (act.type === "payment")  mappedType = "dana_cair";
              else if (act.type === "campaign") mappedType = "campaign_dibuat";

              const cfg  = ACTIVITY_CONFIG[mappedType];
              const Icon = cfg.icon;

              return (
                <div
                  key={act.id}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "grid",
                    gridTemplateColumns: "40px 1fr",
                    gap: 12,
                    alignItems: "start",
                  }}
                >
                  {/* Icon dot */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      boxShadow: "0 2px 6px rgba(0,0,0,.04)",
                    }}
                  >
                    <Icon size={17} color={cfg.color} />
                  </div>

                  {/* Content bubble */}
                  <div
                    style={{
                      padding: "10px 13px",
                      borderRadius: 16,
                      background: "rgba(255,255,255,.75)",
                      border: "1px solid rgba(17,24,39,.05)",
                      boxShadow: "0 1px 4px rgba(0,0,0,.02)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 3 }}>
                      <strong
                        style={{
                          fontSize: ".83rem",
                          fontWeight: 760,
                          letterSpacing: "-.02em",
                          color: "#182033",
                          lineHeight: 1.3,
                        }}
                      >
                        {act.title}
                      </strong>
                      <span
                        style={{
                          fontSize: ".7rem",
                          color: "#9ca8b8",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {act.time}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: "#737f91", fontSize: ".78rem", lineHeight: 1.5, fontWeight: 500 }}>
                      {act.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
