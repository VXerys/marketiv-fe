import { STEP_TIPS } from "./create-campaign.constants";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/features/umkm-dashboard/shared/DashboardCard";

interface CampaignHealthChecklistProps {
  currentStep: number;
  productInfoValid: boolean;
  briefValid: boolean;
  assetValid: boolean;
  budgetValid: boolean;
  reviewValid: boolean;
  stepValidationTried?: Record<number, boolean>;
}

export function CampaignHealthChecklist({
  currentStep,
  productInfoValid,
  briefValid,
  assetValid,
  budgetValid,
  reviewValid,
  stepValidationTried = {},
}: CampaignHealthChecklistProps) {
  
  // Calculate status for each step
  const getStepStatus = (stepNum: number, isValid: boolean) => {
    const tried = stepValidationTried[stepNum];
    if (currentStep === stepNum) {
      return tried && !isValid ? "invalid" : "active";
    }
    if (isValid) return "completed";
    if (tried) return "invalid";
    return "pending";
  };

  const checkItems = [
    {
      step: 1,
      label: "Informasi Produk",
      desc: "Detail nama produk, niche, & deskripsi",
      status: getStepStatus(1, productInfoValid),
    },
    {
      step: 2,
      label: "Brief & Panduan Konten",
      desc: "Instruksi gaya konten video & CTA",
      status: getStepStatus(2, briefValid),
    },
    {
      step: 3,
      label: "Aset Mentah / Media",
      desc: "Link file eksternal Drive/Dropbox",
      status: getStepStatus(3, assetValid),
    },
    {
      step: 4,
      label: "Budget & Kuota Kreator",
      desc: "Bayaran per views & kuota slot",
      status: getStepStatus(4, budgetValid),
    },
    {
      step: 5,
      label: "Review & Simulasi",
      desc: "Persetujuan escrow & rilis dana",
      status: getStepStatus(5, reviewValid),
    },
  ];

  const activeTip = STEP_TIPS[currentStep] || "Lengkapi formulir secara perlahan.";

  return (
    <div className="space-y-6">
      
      {/* Step specific tips box */}
      <DashboardCard className="bg-amber-50/20 border border-neutral-200/50 p-5 shadow-[0_8px_30px_-10px_rgba(235,94,40,0.03),_inset_0_1px_0_rgba(255,255,255,0.95)] space-y-3.5 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary" />
        <div className="pl-2 space-y-1">
          <span className="block text-[9px] font-extrabold text-primary uppercase tracking-wider">
            Tips Langkah Ini
          </span>
          <p className="text-xs font-bold text-text-primary leading-relaxed">
            "{activeTip}"
          </p>
        </div>
      </DashboardCard>

      {/* Progress Checklist items card */}
      <DashboardCard className="bg-white/70 border border-neutral-200/50 shadow-[0_12px_30px_-10px_rgba(235,94,40,0.04),_0_4px_12px_-5px_rgba(0,0,0,0.015),_inset_0_1px_0_rgba(255,255,255,0.95)] p-5.5 space-y-4">
        <div className="flex items-center gap-2 border-b border-border-soft/50 pb-3">
          <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
            Kelengkapan Pembuatan
          </span>
        </div>

        <div className="space-y-4">
          {checkItems.map((item) => {
            const isActive = item.status === "active";
            const isCompleted = item.status === "completed";
            const isInvalid = item.status === "invalid";

            return (
              <div key={item.step} className="flex gap-3">
                <div className="shrink-0 pt-0.5">
                  {isCompleted ? (
                    <span className="h-4.5 w-4.5 rounded-full bg-success text-white flex items-center justify-center shadow-xs border border-white">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : isInvalid ? (
                    <span className="h-4.5 w-4.5 rounded-full bg-danger text-white flex items-center justify-center shadow-xs border border-white">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </span>
                  ) : isActive ? (
                    <span className="h-4.5 w-4.5 rounded-full bg-primary text-white border border-white flex items-center justify-center text-[9px] font-bold shadow-2xs animate-pulse">
                      {item.step}
                    </span>
                  ) : (
                    <span className="h-4.5 w-4.5 rounded-full border-2 border-neutral-300 bg-white flex items-center justify-center text-[9px] font-bold text-text-muted">
                      {item.step}
                    </span>
                  )}
                </div>
                
                <div className="min-w-0">
                  <span 
                    className={cn(
                      "block text-xs font-bold leading-none",
                      isActive ? "text-primary" : isCompleted ? "text-text-primary" : isInvalid ? "text-danger" : "text-text-muted"
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="block text-[9px] text-text-muted mt-1 leading-tight font-semibold">
                    {item.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardCard>

    </div>
  );
}
