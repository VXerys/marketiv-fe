"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BetaNoticeBannerProps {
  className?: string;
  variant?: "floating" | "inline";
}

const STORAGE_KEY = "marketiv_beta_banner_dismissed_aug2026";

/**
 * Banner Pengumuman Beta Release s.d 31 Agustus 2026.
 *
 * Desain premium, non-intrusif, serta menyimpan status tutup di localStorage.
 */
export function BetaNoticeBanner({
  className,
  variant = "inline",
}: BetaNoticeBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "relative z-30 flex items-center justify-between gap-3 px-4 py-2 text-white shadow-sm transition-all duration-300",
        "bg-gradient-to-r from-orange-600 via-amber-500 to-violet-600",
        variant === "floating"
          ? "mx-4 my-2 rounded-2xl border border-white/20 backdrop-blur-md"
          : "w-full",
        className
      )}
    >
      <div className="mx-auto flex flex-wrap items-center justify-center gap-2 text-center text-xs font-[750] tracking-tight">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[0.68rem] font-[850] backdrop-blur-sm border border-white/25">
          <Sparkles className="h-3 w-3 text-amber-200 animate-pulse" />
          BETA RELEASE
        </span>
        <span>
          Marketiv saat ini dalam periode uji coba terbatas (Beta Tester) hingga{" "}
          <strong className="underline underline-offset-2">31 Agustus 2026</strong>.
        </span>
      </div>

      <button
        onClick={handleDismiss}
        className="shrink-0 rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
        aria-label="Tutup pengumuman"
      >
        <X size={15} />
      </button>
    </div>
  );
}
