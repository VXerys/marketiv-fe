import { DashboardButton } from "../shared";

interface CampaignErrorStateProps {
  onRetry: () => void;
  errorMsg?: string;
}

export function CampaignErrorState({ onRetry, errorMsg }: CampaignErrorStateProps) {
  return (
    <div className="state-card py-16 px-6 sm:px-12 flex flex-col items-center text-center max-w-4xl mx-auto my-6">
      <div className="state-icon mb-6 bg-red-50! border-red-200! text-red-600!">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-2xl font-display font-extrabold text-neutral-950 mb-3 tracking-tight">
        Gagal Memuat Kampanye
      </h3>
      <p className="text-neutral-500 max-w-lg text-sm leading-relaxed mb-8 font-medium">
        {errorMsg || "Terjadi kesalahan saat membuka daftar kampanye Anda. Silakan coba lagi."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
        <DashboardButton variant="primary" onClick={onRetry}>
          Coba Lagi
        </DashboardButton>
      </div>
    </div>
  );
}
