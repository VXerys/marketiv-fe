"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export function NegotiationHeader() {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      {/* Title block */}
      <div>
        <div className="inline-flex items-center gap-2 text-orange-600 text-[.74rem] font-[900] tracking-[.12em] uppercase mb-1.5">
          <span className="block w-[18px] h-0.5 rounded-full bg-orange-500" />
          Kelola Negosiasi
        </div>
        <h2 className="font-display text-[clamp(1.5rem,2.8vw,2.1rem)] font-bold tracking-[-0.065em] text-ink-950 m-0 mb-1.5 leading-none">
          Negosiasi Rate Card
        </h2>
        <p className="text-ink-500 text-[.88rem] m-0">
          Kelola percakapan, penawaran, dan pembayaran escrow untuk kerja sama kreator pilihan Anda.
        </p>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
        <Link
          href="/dashboard/umkm/kreator"
          className="inline-flex items-center gap-2 min-h-[46px] px-[22px] rounded-xl border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white font-[800] text-[.9rem] tracking-[-0.012em] shadow-[0_14px_34px_rgba(234,88,12,.22),inset_0_1px_0_rgba(255,255,255,.22)] cursor-pointer whitespace-nowrap no-underline hover:shadow-[0_18px_40px_rgba(234,88,12,.30)] hover:-translate-y-px transition-all duration-200"
        >
          <Search size={17} />
          Cari Kreator Baru
        </Link>
      </div>
    </div>
  );
}
