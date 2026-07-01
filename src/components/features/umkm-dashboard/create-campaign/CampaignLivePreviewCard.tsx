import { formatCurrency, formatCompactNumber } from "@/lib/formatters";
import { DashboardBadge } from "../shared/DashboardBadge";
import { DashboardCard } from "@/components/features/umkm-dashboard/shared/DashboardCard";

interface CampaignLivePreviewCardProps {
  title: string;
  category: string;
  brief: string;
  pricePerThousandViews: number;
  totalBudgetEscrow: number;
  creatorQuota: number;
}

export function CampaignLivePreviewCard({
  title,
  category,
  brief,
  pricePerThousandViews,
  totalBudgetEscrow,
  creatorQuota,
}: CampaignLivePreviewCardProps) {
  const displayTitle = title.trim() || "Judul campaign akan muncul di sini";
  const displayBrief = brief.trim() || "Isi brief agar kreator memahami kebutuhan Anda";
  
  const estimatedViews = pricePerThousandViews > 0 
    ? Math.round((totalBudgetEscrow / pricePerThousandViews) * 1000) 
    : 0;

  return (
    <DashboardCard className="rounded-3xl bg-white/70 overflow-hidden flex flex-col h-full min-h-[300px] select-none">

      
      {/* Top Cover Banner */}
      <div className="h-28 w-full bg-gradient-to-br from-primary-400/80 to-primary-600/90 relative flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
        
        {/* Absolute floating category badge */}
        <div className="absolute top-3 left-3 z-10">
          {category ? (
            <DashboardBadge type="category" value={category} className="font-extrabold uppercase" />
          ) : (
            <span className="text-[8px] font-extrabold text-text-muted bg-white border border-neutral-200/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Pilih kategori untuk melihat badge
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <span className="text-[8px] font-extrabold text-white bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full uppercase tracking-wider">
            Live Preview
          </span>
        </div>

        {/* Big icon placeholder */}
        <div className="relative text-center text-white space-y-1">
          <svg className="w-6 h-6 mx-auto opacity-75 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[9px] font-bold tracking-wider uppercase opacity-80 block">Campaign Cover</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white/40">
        <div className="space-y-2.5">
          <h4 className={`text-xs sm:text-sm font-extrabold leading-tight line-clamp-1 ${title.trim() ? "text-text-primary" : "text-text-muted italic"}`}>
            {displayTitle}
          </h4>
          <p className={`text-[10px] leading-relaxed line-clamp-3 ${brief.trim() ? "text-text-muted font-medium" : "text-text-muted/70 italic"}`}>
            {displayBrief}
          </p>
        </div>

        {/* Derived Analytics Info Grid */}
        <div className="grid grid-cols-2 gap-3.5 border-t border-dashed border-border-soft pt-3.5 mt-auto">
          <div>
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5 truncate">
              Anggaran Escrow
            </span>
            <span className="text-xs font-extrabold text-primary block truncate">
              {formatCurrency(totalBudgetEscrow)}
            </span>
          </div>

          <div>
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5 truncate">
              Bayaran / 1K Views
            </span>
            <span className="text-xs font-extrabold text-text-primary block truncate">
              {formatCurrency(pricePerThousandViews)}
            </span>
          </div>

          <div>
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5 truncate">
              Kuota Kreator
            </span>
            <span className="text-xs font-extrabold text-text-primary block truncate">
              {creatorQuota} Slot Konten
            </span>
          </div>

          <div>
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5 truncate">
              Target Views
            </span>
            <span className="text-xs font-extrabold text-success block truncate">
              {formatCompactNumber(estimatedViews)} Views
            </span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
