import { DashboardCard } from "./DashboardCard";
import { StatusBadge } from "./StatusBadge";
import type { SubmissionPending } from "@/types/umkmDashboard";

interface ReviewSubmissionCardProps {
  submissions: SubmissionPending[];
}

interface PlatformIconProps {
  platform: SubmissionPending["platform"];
}

function PlatformIcon({ platform }: PlatformIconProps) {
  if (platform === "tiktok") {
    return (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    </div>
  );
}

export function ReviewSubmissionCard({ submissions }: ReviewSubmissionCardProps) {
  return (
    <DashboardCard className="col-span-12 lg:col-span-5 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg text-neutral-900 font-extrabold flex items-center gap-3">
          <span>Review Bukti</span>
          <span className="bg-red-50 text-red-600 text-xs w-6 h-6 rounded-full flex items-center justify-center border border-red-200/80 font-bold shadow-sm">
            {submissions.length}
          </span>
        </h3>
        <button className="text-primary text-xs font-bold hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider">
          Lihat Semua
        </button>
      </div>

      <div className="space-y-3.5">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-neutral-50/80 transition-all cursor-pointer border border-neutral-100 hover:border-white group hover:shadow-[0_8px_24px_rgba(16,32,51,0.03)] bg-white/50"
          >
            {/* Platform SVG */}
            <PlatformIcon platform={sub.platform} />

            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-955 font-bold group-hover:text-primary transition-colors">{sub.creatorName}</p>
              <p className="text-xs text-neutral-500 font-semibold truncate mt-0.5">{sub.campaignTitle}</p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <StatusBadge variant="pending">{sub.status}</StatusBadge>
              <span className="text-[10px] text-neutral-400 font-semibold">{sub.timeAgo}</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
