import { DashboardButton } from "../../shared/DashboardButton";

interface SaveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SaveDraftModal({ isOpen, onClose, onConfirm }: SaveDraftModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Content Container */}
      <div className="bg-white rounded-[28px] border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-sm w-full z-10 relative space-y-6 text-center animate-in scale-in duration-200">
        <div className="h-12 w-12 rounded-full bg-primary-50 text-primary border border-primary-100 flex items-center justify-center mx-auto shadow-2xs">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider">
            Simpan sebagai Draft?
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Apakah Anda ingin menyimpan data kampanye ini sebagai draft? Anda dapat melanjutkannya kembali kapan saja melalui dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full">
          <DashboardButton
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="flex-1 h-10 text-xs bg-white border border-border-soft hover:bg-neutral-50"
          >
            Batal
          </DashboardButton>
          <DashboardButton
            variant="primary"
            size="sm"
            onClick={onConfirm}
            className="flex-1 h-10 text-xs"
          >
            Simpan Draft
          </DashboardButton>
        </div>
      </div>
    </div>
  );
}
