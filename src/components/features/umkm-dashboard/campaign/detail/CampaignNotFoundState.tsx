import { Button } from "@/components/ui/Button";

export function CampaignNotFoundState() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft text-warning mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div className="flex flex-col gap-1.5 max-w-sm mb-6">
        <h3 className="text-heading-2 text-text-primary">Campaign tidak ditemukan</h3>
        <p className="text-body-base text-text-muted">
          Campaign yang Anda cari tidak tersedia, sudah dinonaktifkan, atau telah dihapus dari sistem.
        </p>
      </div>

      <div>
        <Button variant="primary" size="md" href="/dashboard/umkm/campaign">
          Kembali ke Campaign Saya
        </Button>
      </div>
    </div>
  );
}
