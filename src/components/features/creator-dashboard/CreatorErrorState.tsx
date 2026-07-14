interface CreatorErrorStateProps {
  errorMsg?: string;
  onRetry: () => void;
}

export function CreatorErrorState({
  errorMsg = "Gagal memuat data dari server.",
  onRetry,
}: CreatorErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-red-50/15 backdrop-blur-md rounded-2xl border border-red-200/40 shadow-[0_8px_30px_rgb(239,68,68,0.01)] max-w-lg mx-auto mt-6">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-6 shadow-sm">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-extrabold text-neutral-900 mb-2">
        Koneksi Gagal
      </h3>
      <p className="text-sm text-neutral-500 font-medium leading-relaxed max-w-sm mb-6">
        {errorMsg}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all border border-red-600/20 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
        </svg>
        <span>Coba Lagi</span>
      </button>
    </div>
  );
}
