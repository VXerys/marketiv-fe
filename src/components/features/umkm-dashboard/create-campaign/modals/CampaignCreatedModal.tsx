import { DashboardButton } from "../../shared/DashboardButton";

interface CampaignCreatedModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onReset: () => void;
}

export function CampaignCreatedModal({ isOpen, onConfirm, onReset }: CampaignCreatedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />
      
      {/* Content Container */}
      <div className="bg-white rounded-[28px] border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-sm w-full z-10 relative space-y-6 text-center animate-in scale-in duration-300">
        <div className="h-14 w-14 rounded-full bg-success-soft/20 text-success border border-success-soft/10 flex items-center justify-center mx-auto shadow-2xs">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider">
            Campaign Berhasil Disiapkan!
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Kampanye Anda berhasil dibuat secara simulasi dan dana escrow telah diamankan. Setelah integrasi backend selesai, data akan langsung tersimpan permanen.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full pt-2">
          <DashboardButton
            variant="primary"
            size="md"
            onClick={onConfirm}
            className="w-full h-10 text-xs"
          >
            Lihat Campaign Saya
          </DashboardButton>
          <DashboardButton
            variant="secondary"
            size="md"
            onClick={onReset}
            className="w-full h-10 text-xs bg-white border border-border-soft hover:bg-neutral-50"
          >
            Buat Campaign Baru Lagi
          </DashboardButton>
        </div>
      </div>
    </div>
  );
}
