"use client";

interface NegotiationErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function NegotiationErrorState({
  message = "Gagal memuat daftar negosiasi. Silakan coba beberapa saat lagi.",
  onRetry,
}: NegotiationErrorStateProps) {
  return (
    <div className="rounded-3xl border border-danger/25 bg-danger-soft/10 p-10 text-center max-w-xl mx-auto my-8 space-y-4">
      <div className="h-12 w-12 rounded-full bg-danger-soft/30 flex items-center justify-center mx-auto text-danger">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold text-danger">Gagal Memuat Negosiasi</h3>
        <p className="text-xs text-text-secondary max-w-xs mx-auto font-medium">
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 rounded-xl bg-danger text-white text-xs font-bold transition-colors cursor-pointer select-none shadow-xs border border-danger"
      >
        Coba Lagi
      </button>
    </div>
  );
}
