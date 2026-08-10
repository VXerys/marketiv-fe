"use client";

import { UserPlus, FileText, CheckCircle, DollarSign, Rocket, MessageCircle, ChevronRight } from "lucide-react";

type ActivityType = "kreator_bergabung" | "submission_baru" | "campaign_selesai" | "dana_cair" | "campaign_dibuat" | "progress";

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
  kreator_bergabung: { icon: UserPlus,       bg: "#f0f6ff", color: "#2563eb", border: "rgba(37,99,235,.18)" },
  submission_baru:   { icon: FileText,       bg: "#f7f3ff", color: "#7c3aed", border: "rgba(124,58,237,.18)" },
  campaign_selesai:  { icon: CheckCircle,    bg: "#f1fbf5", color: "#16a34a", border: "rgba(22,163,74,.18)" },
  dana_cair:         { icon: DollarSign,     bg: "#fffbeb", color: "#d97706", border: "rgba(217,119,6,.18)" },
  campaign_dibuat:   { icon: Rocket,         bg: "#fff7ed", color: "#ea580c", border: "rgba(234,88,12,.18)" },
  progress:          { icon: MessageCircle,  bg: "#f0f9ff", color: "#0284c7", border: "rgba(2,132,199,.18)" },
};

interface ActivityTimelineProps {
  activities?: Activity[];
  isLoading?: boolean;
  onViewAllClick?: () => void;
}

export function ActivityTimeline({ activities = [], isLoading = false, onViewAllClick }: ActivityTimelineProps) {
  // Capped at 5 activities per user requirement
  const visibleActivities = activities.slice(0, 5);

  return (
    <div
      className="relative rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] h-full flex flex-col justify-between"
    >
      <div className="flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 block mb-0.5">
              AKTIVITAS TERBARU
            </span>
            <h3 className="text-base font-black text-slate-900 tracking-tight font-display">
              Aktivitas Campaign
            </h3>
          </div>

          <button
            type="button"
            onClick={onViewAllClick}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors cursor-pointer shrink-0"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid gap-2.5 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-[38px_1fr] gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
                <div className="p-3 rounded-2xl bg-slate-50 space-y-2">
                  <div className="w-1/2 h-3 rounded-md bg-slate-200 animate-pulse" />
                  <div className="w-3/4 h-3 rounded-md bg-slate-150 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleActivities.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-orange-50/40 border border-dashed border-orange-200/60 flex-1 flex flex-col items-center justify-center">
            <div className="text-2xl mb-2">📭</div>
            <div className="text-xs font-bold text-slate-900 mb-1">
              Belum Ada Aktivitas
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Aktivitas campaign akan muncul di sini.
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between gap-2.5">
            {visibleActivities.map((act) => {
              let mappedType: ActivityType = "kreator_bergabung";
              if (act.type === "submission")      mappedType = "submission_baru";
              else if (act.type === "payment")    mappedType = "dana_cair";
              else if (act.type === "campaign")   mappedType = "campaign_dibuat";
              else if (act.type === "progress")   mappedType = "progress";

              const cfg  = ACTIVITY_CONFIG[mappedType];
              const Icon = cfg.icon;

              return (
                <div
                  key={act.id}
                  className="grid grid-cols-[34px_1fr] gap-2.5 items-center group flex-1"
                >
                  {/* Icon badge */}
                  <div
                    className="w-8 h-8 rounded-xl grid place-items-center shrink-0 border transition-transform group-hover:scale-105"
                    style={{
                      background: cfg.bg,
                      borderColor: cfg.border,
                    }}
                  >
                    <Icon size={15} color={cfg.color} />
                  </div>

                  {/* Content card */}
                  <div className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100 group-hover:bg-slate-100/60 transition-colors h-full flex flex-col justify-center min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <strong className="text-xs font-black text-slate-900 leading-snug truncate">
                        {act.title}
                      </strong>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 whitespace-nowrap">
                        {act.time}
                      </span>
                    </div>
                    <p className="text-[11px] font-normal text-slate-600 leading-tight line-clamp-1">
                      {act.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

