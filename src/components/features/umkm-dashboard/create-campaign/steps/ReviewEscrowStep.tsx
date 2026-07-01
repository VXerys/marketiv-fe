import { FormSectionCard } from "../cards/FormSectionCard";
import { EscrowSimulationCard } from "../cards/EscrowSimulationCard";
import { formatCurrency, formatCompactNumber } from "@/lib/formatters";
import { getDerivedBudgetValues } from "../create-campaign.utils";
import { DashboardBadge } from "@/components/features/umkm-dashboard/shared/DashboardBadge";

interface ReviewEscrowStepProps {
  title: string;
  category: string;
  description: string;
  brief: string;
  videoStyle: string;
  requiredPoints: string;
  callToAction: string;
  hashtags: string;
  externalAssetUrl: string;
  pricePerThousandViews: number;
  totalBudgetEscrow: number;
  creatorQuota: number;
  // checklist states
  termsAgreed: boolean;
  onChangeTermsAgreed: (val: boolean) => void;
  validationErrors?: Record<string, string>;
}

export function ReviewEscrowStep({
  title,
  category,
  description,
  brief,
  videoStyle,
  requiredPoints,
  callToAction,
  hashtags,
  externalAssetUrl,
  pricePerThousandViews,
  totalBudgetEscrow,
  creatorQuota,
  termsAgreed,
  onChangeTermsAgreed,
  validationErrors = {},
}: ReviewEscrowStepProps) {
  const { platformFee, totalPayment, estimatedViews } = getDerivedBudgetValues(
    pricePerThousandViews,
    totalBudgetEscrow,
    creatorQuota
  );

  const reviewGrid = [
    { label: "Nama Campaign / Produk", val: title },
    { label: "Niche Kategori", val: category },
    { label: "Deskripsi Produk", val: description },
    { label: "Konsep Brief Utama", val: brief },
    { label: "Gaya Tone Video", val: videoStyle.replace("_", " ").toUpperCase() },
    { label: "Call to Action (CTA)", val: callToAction.replace("_", " ").toUpperCase() },
    { label: "Tautan Aset Eksternal", val: externalAssetUrl, link: true },
    { label: "Rekomendasi Hashtag", val: hashtags || "-" },
  ];

  return (
    <FormSectionCard
      title="Review & Simulasi Escrow"
      description="Periksa kembali seluruh pengaturan kampanye Anda. Data yang dimasukkan bersifat final setelah dana escrow diamankan."
    >
      
      {/* Configuration Review List */}
      <div className="space-y-4">
        <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
          Rangkuman Rincian Kampanye
        </span>
        
        <div className="rounded-2xl border border-border-soft/60 bg-neutral-50/20 p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewGrid.map((item, idx) => (
              <div key={idx} className={item.label === "Deskripsi Produk" || item.label === "Konsep Brief Utama" ? "md:col-span-2" : ""}>
                <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  {item.label}
                </span>
                {item.link ? (
                  <a
                    href={item.val}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-extrabold text-primary hover:underline break-all block"
                  >
                    {item.val}
                  </a>
                ) : item.label === "Niche Kategori" ? (
                  <div className="mt-1">
                    <DashboardBadge type="category" value={category} className="font-extrabold uppercase" />
                  </div>
                ) : (
                  <span className="text-xs font-bold text-text-primary block whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto">
                    {item.val}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Escrow Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Left Side: Simulation Cost */}
        <div className="space-y-4">
          <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            Rincian Biaya Escrow
          </span>
          <div className="rounded-2xl border border-border-soft/60 bg-neutral-50/20 p-5 space-y-3.5">
            <div className="flex justify-between items-center text-xs font-semibold text-text-secondary">
              <span className="text-text-muted">Bayaran / 1K Views</span>
              <span className="font-extrabold text-text-primary">{formatCurrency(pricePerThousandViews)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold text-text-secondary">
              <span className="text-text-muted">Kuota Kreator</span>
              <span className="font-extrabold text-text-primary">{creatorQuota} Slot</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold text-text-secondary">
              <span className="text-text-muted">Estimasi Total Tayangan</span>
              <span className="font-extrabold text-success">{formatCompactNumber(estimatedViews)} Views</span>
            </div>
            
            <div className="border-t border-border-soft/60 pt-3.5 space-y-2 text-xs font-semibold text-text-secondary">
              <div className="flex justify-between items-center text-text-muted text-[11px]">
                <span>Anggaran Campaign (Escrow)</span>
                <span className="font-bold text-text-primary">{formatCurrency(totalBudgetEscrow)}</span>
              </div>
              <div className="flex justify-between items-center text-text-muted text-[11px]">
                <span>Biaya Platform (15%)</span>
                <span className="font-bold text-text-primary">{formatCurrency(platformFee)}</span>
              </div>
              <div className="flex justify-between items-center text-text-primary text-[11px] pt-2 border-t border-dashed border-border-soft">
                <span className="font-extrabold">Total Tagihan Awal</span>
                <span className="text-sm font-extrabold text-primary">{formatCurrency(totalPayment)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Escrow explanation card */}
        <div className="space-y-4">
          <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            Alur Keamanan Escrow
          </span>
          <EscrowSimulationCard />
        </div>
      </div>

      {/* Confirmation Checklist */}
      <div className="space-y-3 pt-3 border-t border-border-soft/60">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => onChangeTermsAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
          />
          <div className="min-w-0">
            <span className="block text-[11px] font-extrabold text-text-primary leading-tight">
              Saya menyetujui seluruh brief, instruksi, dan rincian nominal di atas.
            </span>
            <span className="block text-[10px] text-text-muted mt-1 leading-relaxed">
              Saya memahami bahwa dana akan didepositkan ke rekening escrow Marketiv, dan dibagikan otomatis ke kreator berdasarkan views konten valid hasil posting mereka.
            </span>
          </div>
        </label>
        {validationErrors.termsAgreed && (
          <p className="text-[10px] text-danger font-bold pl-7">{validationErrors.termsAgreed}</p>
        )}
      </div>

    </FormSectionCard>
  );
}
