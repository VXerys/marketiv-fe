import { Button } from "@/components/ui/Button";

interface CampaignErrorStateProps {
  onRetry: () => void;
  errorMsg?: string;
}

export function CampaignErrorState({ onRetry, errorMsg }: CampaignErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center border border-border-soft rounded-2xl bg-white shadow-xs">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div className="flex flex-col gap-1.5 max-w-sm">
        <h3 className="text-heading-2 text-text-primary">Gagal memuat campaign</h3>
        <p className="text-body-base text-text-muted">
          {errorMsg || "Terjadi kesalahan saat mengambil data campaign. Silakan coba lagi."}
        </p>
      </div>

      <div>
        <Button variant="primary" size="md" onClick={onRetry}>
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
