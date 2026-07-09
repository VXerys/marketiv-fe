"use client";

import { UserPlus, FileText, CheckCircle, DollarSign, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityType = "kreator_bergabung" | "submission_baru" | "campaign_selesai" | "dana_cair" | "campaign_dibuat";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
}

// ACTIVITY_CONFIG: warna dinamis per-type — dipertahankan sebagai inline karena
// nilainya dikirim ke icon sebagai prop `color` (Lucide tidak mendukung class Tailwind)
const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ComponentType<{ size?: number; color?: string }>; bg: string; color: string }> = {
  kreator_bergabung: { icon: UserPlus,      bg: "#f0f6ff", color: "#2563eb" },
  submission_baru:   { icon: FileText,      bg: "#f7f3ff", color: "#7c3aed" },
  campaign_selesai:  { icon: CheckCircle,   bg: "#f1fbf5", color: "#16a34a" },
  dana_cair:         { icon: DollarSign,    bg: "#fffbeb", color: "#d97706" },
  campaign_dibuat:   { icon: Rocket,        bg: "#fff7ed", color: "#ea580c" },
};

function ActivitySkeleton() {
  return (
    <div className="grid gap-3.5 items-start" style={{ gridTemplateColumns: "42px 1fr" }}>
      <div className="w-[42px] h-[42px] rounded-2xl bg-ink-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" />
      </div>
      <div className="p-3 rounded-[18px] bg-ink-50">
        <div className="w-[55%] h-3.5 rounded-lg bg-ink-100 mb-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" />
        </div>
        <div className="w-4/5 h-3 rounded-lg bg-ink-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" />
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
    <div className="p-5 rounded-3xl border border-border bg-gradient-to-b from-white to-[#fffdf9] shadow-sm">
      {/* Subtle orange radial glow in top-right corner */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{ background: "radial-gradient(circle at 100% 0%, rgba(249,115,22,.06), transparent 14rem)" }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-orange-600 text-[.72rem] font-[900] tracking-[.12em] uppercase mb-1.5">
            <span className="block w-3.5 h-0.5 rounded-full bg-orange-500" />
            Aktifitas terbaru
          </div>
          <h3 className="font-display text-[1.15rem] font-bold tracking-[-0.045em] text-ink-950 m-0">
            Aktivitas Campaign
          </h3>
        </div>
      </div>

      {isLoading ? (
        <div className="relative grid gap-4">
          {[1, 2, 3].map((i) => (
            <ActivitySkeleton key={i} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-6 text-ink-400 text-[.86rem]">
          Belum ada aktivitas.
        </div>
      ) : (
        <div className="relative grid gap-4">
          {/* Vertical timeline line */}
          <div
            className="absolute left-5 top-6 bottom-6 w-0.5 rounded-full z-0"
            style={{ background: "linear-gradient(180deg, rgba(249,115,22,.15) 0%, rgba(249,115,22,0) 100%)" }}
          />

          {activities.map((act) => {
            // Map types from mock to config keys
            let mappedType: ActivityType = "kreator_bergabung";
            if (act.type === "submission") mappedType = "submission_baru";
            else if (act.type === "payment")  mappedType = "dana_cair";
            else if (act.type === "campaign") mappedType = "campaign_dibuat";

            const cfg  = ACTIVITY_CONFIG[mappedType];
            const Icon = cfg.icon;

            return (
              <div
                key={act.id}
                className="relative z-10"
                style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 14, alignItems: "start" }}
              >
                {/* Icon dot */}
                <div
                  className="w-10 h-10 rounded-[15px] grid place-items-center border shadow-xs"
                  style={{
                    background:  cfg.bg,
                    borderColor: `${cfg.color}20`,
                  }}
                >
                  <Icon size={18} color={cfg.color} />
                </div>

                {/* Content bubble */}
                <div className="p-3 rounded-[18px] bg-white/60 border border-black/[.04] shadow-[0_2px_8px_rgba(0,0,0,.01)]">
                  <div className="flex justify-between gap-2.5 mb-1">
                    <strong className="text-[.84rem] tracking-[-0.02em] text-ink-950 leading-snug">
                      {act.title}
                    </strong>
                    <span className="text-[.72rem] text-ink-400 font-[700] whitespace-nowrap shrink-0">
                      {act.time}
                    </span>
                  </div>
                  <p className={cn("m-0 text-ink-500 text-[.8rem] leading-[1.45]")}>
                    {act.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
