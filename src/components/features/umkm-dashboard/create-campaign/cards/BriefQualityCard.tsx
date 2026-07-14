import { DashboardCard } from "@/components/features/umkm-dashboard/shared/DashboardCard";
import { DashboardProgress } from "@/components/features/umkm-dashboard/shared/DashboardProgress";
import { DashboardBadge } from "@/components/features/umkm-dashboard/shared/DashboardBadge";

interface BriefQualityCardProps {
  campaignTitle: string;
  productCategory: string;
  productDescription: string;
  mainBrief: string;
  callToAction: string;
  externalAssetUrl: string;
}

export function BriefQualityCard({
  campaignTitle,
  productCategory,
  productDescription,
  mainBrief,
  callToAction,
  externalAssetUrl,
}: BriefQualityCardProps) {
  // Score calculations
  const checklist = [
    { label: "Informasi Produk Jelas", met: campaignTitle.trim().length > 3 && productDescription.trim().length >= 30 },
    { label: "Kategori Niche Terpilih", met: productCategory.trim().length > 0 },
    { label: "Brief & Instruksi Jelas", met: mainBrief.trim().length >= 40 },
    { label: "CTA Kampanye Ditentukan", met: callToAction.trim().length > 0 },
    { label: "Tautan Aset Terhubung", met: externalAssetUrl.trim().startsWith("https://") },
  ];

  const score = checklist.filter((c) => c.met).length;
  
  const getQualityText = (s: number) => {
    if (s <= 2) return { text: "Kurang Lengkap", tone: "red" as const, progressTone: "red" as const };
    if (s <= 4) return { text: "Cukup Baik", tone: "amber" as const, progressTone: "orange" as const };
    return { text: "Sangat Premium", tone: "green" as const, progressTone: "green" as const };
  };

  const status = getQualityText(score);

  return (
    <DashboardCard className="bg-neutral-50/45 border border-border-soft/60 p-5.5 space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-border-soft/50 pb-3">
        <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
          Skor Kualitas Brief Anda
        </span>
        <DashboardBadge type="tone" tone={status.tone} className="text-[9px] h-4.5 px-2">
          {status.text}
        </DashboardBadge>
      </div>

      {/* Progress Bar Score */}
      <DashboardProgress
        label={`Skor Kelengkapan (${score}/5)`}
        value={score}
        max={5}
        tone={status.progressTone}
        className="text-[9px]"
      />

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 gap-2 pt-1">
        {checklist.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[10px]">
            {item.met ? (
              <svg className="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-neutral-300 shrink-0" />
            )}
            <span className={item.met ? "text-text-secondary font-bold" : "text-text-muted font-semibold"}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
