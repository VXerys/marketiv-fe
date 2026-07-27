"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createConversation } from "@/services/umkm/umkm-dashboard.service";
import {
  ResponsiveModal,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal";

/**
 * Pintu masuk Alur B: membuka ruang negosiasi dengan seorang kreator.
 *
 * HANYA MEMBUAT PERCAKAPAN. Form penawaran (harga, deadline, revisi) yang dulu
 * ada di sini sudah dipindah ke dalam ruang negosiasi, dan alasannya bukan
 * sekadar tata letak: urutan Alur B adalah chat → offer → accept → order, jadi
 * mengirim penawaran sebelum pernah bertukar pesan membalik alurnya.
 *
 * Versi sebelumnya juga tidak menulis apa pun — `setTimeout` 1,5 detik lalu
 * mengarahkan ke `/negosiasi/rc-offer-simulated`, sebuah order karangan.
 * Daftar campaign di dropdown-nya pun hardcode.
 */
interface StartNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  packageName: string;
  packagePrice: string;
}

export function StartNegotiationModal({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  packageName,
  packagePrice,
}: StartNegotiationModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const res = await createConversation(creatorId);
    setIsSubmitting(false);

    if (!res.success || !res.data) {
      toast.error(res.error ?? "Gagal membuka ruang negosiasi.");
      return;
    }

    onClose();
    router.push(`/dashboard/umkm/negosiasi/${res.data}`);
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-lg w-full p-0 overflow-hidden">
        <div>
          {/* Header */}
          <div className="px-6 py-4.5 bg-gradient-to-r from-primary-50/30 to-white border-b border-border-subtle flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-text-primary uppercase tracking-wider">
                Mulai Negosiasi
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5 font-semibold">
                Buka ruang chat dengan {creatorName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer select-none p-1 rounded-lg hover:bg-neutral-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Paket acuan */}
            <div className="rounded-xl bg-primary-50/20 border border-primary-100/30 p-3 flex justify-between items-center text-xs font-bold">
              <div className="space-y-0.5">
                <span className="text-[9px] text-primary uppercase block tracking-wider">Paket Acuan</span>
                <span className="text-text-primary text-[11px]">{packageName}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-text-muted uppercase block tracking-wider">Harga Rate Card</span>
                <span className="text-primary text-[11px] font-extrabold">{packagePrice}</span>
              </div>
            </div>

            {/* Urutan alur — supaya UMKM tahu apa yang terjadi setelah ini */}
            <div className="rounded-xl border border-neutral-200/60 p-4 space-y-2.5">
              <span className="block text-[10px] font-extrabold text-text-primary uppercase tracking-wider">
                Tahapannya
              </span>
              <ol className="space-y-1.5">
                {[
                  "Diskusikan kebutuhan Anda lewat chat.",
                  "Kirim Custom Offer dari dalam ruang negosiasi.",
                  "Kreator menerima atau menolak penawaran.",
                  "Setelah diterima, Anda membayar dan dana ditahan di escrow.",
                ].map((step, i) => (
                  <li key={step} className="flex gap-2.5 items-start">
                    <span className="h-4 w-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[9px] font-black mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[10px] text-text-secondary leading-relaxed font-semibold">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl bg-amber-50/20 border border-neutral-200/50 p-3.5 flex gap-3 items-start">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                !
              </span>
              <div className="min-w-0">
                <span className="block text-[10px] font-extrabold text-text-primary leading-tight">
                  Ketentuan Dana Escrow
                </span>
                <span className="block text-[9px] text-text-muted mt-1 leading-relaxed font-semibold">
                  Anda membayar persis harga yang disepakati — tanpa biaya tambahan. Dana ditahan
                  Marketiv dan baru dilepaskan ke kreator setelah Anda menyetujui hasil pekerjaannya.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-text-secondary text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 select-none text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleStart}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 select-none border border-primary hover:border-primary-600 shadow-xs flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Membuka…
                  </>
                ) : (
                  "Masuk ke Ruang Negosiasi"
                )}
              </button>
            </div>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
