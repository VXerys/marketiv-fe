"use client";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function OrderSuccessModal({ isOpen, onClose, onConfirm }: OrderSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-main/40 backdrop-blur-xs" onClick={onClose} />
      
      {/* Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-lg border border-neutral-200/50 animate-in zoom-in-95 duration-200">
        
        {/* Success Icon */}
        <div className="h-14 w-14 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto text-xl shadow-xs border border-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider">
            Deposit Berhasil Diverifikasi!
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed font-medium">
            Dana escrow Anda telah berhasil dikunci di sistem keamanan Marketiv. Kreator akan segera diberi tahu untuk memulai produksi video konten.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-text-secondary text-xs font-bold transition-all duration-200 cursor-pointer select-none text-center"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer border border-primary hover:border-primary-600 shadow-xs text-center select-none"
          >
            Pantau Pekerjaan
          </button>
        </div>

      </div>
    </div>
  );
}
