import { Campaign } from "@/types/umkm-dashboard.types";
import { formatCurrency, formatCompactNumber } from "@/lib/formatters";
import { DashboardCard } from "../../shared/DashboardCard";

interface CampaignBriefCardProps {
  campaign: Campaign;
}

export function CampaignBriefCard({ campaign }: CampaignBriefCardProps) {
  return (
    <DashboardCard variant="default">
      <div className="p-6 border-b border-border-soft">
        <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">
          Brief & Panduan Konten
        </h3>
      </div>
      <div className="p-6 space-y-5">
        
        {/* Brief Text */}
        <div>
          <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Instruksi / Brief Pekerjaan
          </span>
          <p className="text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-line bg-neutral-50/50 p-4 rounded-xl border border-border-soft">
            {campaign.brief}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
              Niche Kategori
            </span>
            <span className="text-xs sm:text-sm font-bold text-text-primary capitalize">
              {campaign.niche}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
              Bayaran / 1K Views
            </span>
            <span className="text-xs sm:text-sm font-bold text-primary">
              {formatCurrency(campaign.pricePerThousandViews)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
              Kuota Kreator
            </span>
            <span className="text-xs sm:text-sm font-bold text-text-primary">
              {campaign.creatorQuota} Slot
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
              Target Views
            </span>
            <span className="text-xs sm:text-sm font-bold text-text-primary">
              {formatCompactNumber(campaign.creatorQuota * 15000)} Est. Views
            </span>
          </div>
        </div>

        {/* Warning Visual Note */}
        <div className="bg-primary-50 text-primary border border-primary-100/50 rounded-xl p-3.5 flex gap-2.5 text-xs leading-normal">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="font-bold block mb-0.5">Catatan Penting Untuk Brief</span>
            Brief ini digunakan kreator sebagai acuan produksi konten. Pastikan informasi produk, gaya video, dan call-to-action (CTA) sudah jelas sebelum dipublikasikan.
          </div>
        </div>

      </div>
    </DashboardCard>
  );
}
