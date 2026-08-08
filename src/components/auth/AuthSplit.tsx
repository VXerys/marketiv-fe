"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketivLogo } from "@/components/ui/MarketivLogo";

interface AuthSplitProps {
  role: "umkm" | "creator";
  heroTitle?: string;
  heroTagline?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  heroBullets?: readonly any[];
  children: React.ReactNode;
  className?: string;
}

const ROLE_CONFIG = {
  umkm: {
    heroImage: "/umkm_auth_hero.jpg",
    badgeText: "Untuk Pemilik UMKM",
    badgeClass: "bg-orange-500/20 text-orange-200 border-orange-400/40 backdrop-blur-md",
    title: "Promosikan produk bersama kreator lokal.",
    tagline: "Temukan kreator yang sesuai dan jalankan promosi dengan proses yang lebih sederhana dan terukur.",
    benefits: [
      {
        title: "Mulai sesuai anggaran",
        desc: "Tentukan kebutuhan promosi berdasarkan kemampuan usaha Anda.",
      },
      {
        title: "Temukan kreator yang sesuai",
        desc: "Pilih kreator berdasarkan kategori dan kebutuhan produk.",
      },
      {
        title: "Pantau dalam satu alur",
        desc: "Informasi kampanye dan status pekerjaan tersedia di Marketiv.",
      },
    ],
  },
  creator: {
    heroImage: "/creator_auth_hero.jpg",
    badgeText: "Untuk Kreator Konten",
    badgeClass: "bg-violet-500/20 text-violet-200 border-violet-400/40 backdrop-blur-md",
    title: "Berkarya bersama brand lokal.",
    tagline: "Temukan peluang kolaborasi dengan UMKM dan bangun portofolio melalui konten yang Anda buat.",
    benefits: [
      {
        title: "Campaign sesuai niche",
        desc: "Temukan pekerjaan yang relevan dengan gaya konten Anda.",
      },
      {
        title: "Kolaborasi yang lebih jelas",
        desc: "Brief, pekerjaan, dan status tersedia dalam satu alur.",
      },
      {
        title: "Pembayaran melalui Marketiv",
        desc: "Status pekerjaan dan pembayaran tercatat dalam platform.",
      },
    ],
  },
} as const;

/**
 * Editorial Split-screen layout auth ultra-clean & premium.
 * Mempertahankan foto 100% dengan overlay gradien lembut tanpa card bertumpuk.
 */
export function AuthSplit({
  role,
  children,
  className,
}: AuthSplitProps) {
  const cfg = ROLE_CONFIG[role];

  return (
    <div
      className={cn(
        "w-full max-w-[1060px] overflow-hidden rounded-[2.5rem]",
        "border border-neutral-200/90 bg-white shadow-2xl transition-all duration-300",
        "flex flex-col md:flex-row min-h-[680px]",
        className
      )}
    >
      {/* Form Panel (Kiri di desktop) */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white">
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02] focus-visible:outline-none"
          >
            <MarketivLogo size={34} />
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-3 py-1 text-[0.7rem] font-extrabold text-text-muted shadow-2xs">
            <Sparkles className="h-3 w-3 text-orange-500" />
            Official Platform
          </span>
        </div>

        {/* Form Content */}
        <div className="my-auto w-full">{children}</div>

        {/* Form Footer */}
        <div className="mt-8 text-center text-[0.72rem] font-semibold text-text-muted">
          © {new Date().getFullYear()} Marketiv Inc. Seluruh hak cipta dilindungi.
        </div>
      </div>

      {/* Hero Panel Visual (Kanan di desktop) — Editorial Photography + Direct Gradient Overlay */}
      <div className="relative hidden md:flex md:w-[50%] flex-col justify-between overflow-hidden p-8 lg:p-10 text-white select-none bg-slate-950">
        {/* High-Res Background Photography */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={cfg.heroImage}
              alt="Marketiv Hero Visual"
              fill
              priority
              className="object-cover object-center filter brightness-[0.88]"
            />
            {/* Seamless Editorial Dark Gradient Overlay (Foto jelas di atas, teks kontras tinggi di bawah) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 via-55% to-slate-950/20" />
          </motion.div>
        </AnimatePresence>

        {/* Top Role Badge */}
        <div className="relative z-10">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-extrabold shadow-md",
              cfg.badgeClass
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            {cfg.badgeText}
          </span>
        </div>

        {/* Bottom Seamless Typography & Micro-Benefits */}
        <div className="relative z-10 mt-auto pt-10">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="space-y-4"
          >
            {/* Main Headline & Supporting Text */}
            <div>
              <h2 className="font-display text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight">
                {cfg.title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-300/90 max-w-md">
                {cfg.tagline}
              </p>
            </div>

            {/* 3 Compact Benefit Rows */}
            <div className="pt-2 space-y-3 border-t border-white/10">
              {cfg.benefits.map((b, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white shrink-0 mt-0.5 border border-white/20">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-extrabold text-white leading-tight">
                      {b.title}
                    </span>
                    <span className="block text-[11px] text-slate-300 font-medium leading-normal mt-0.5">
                      {b.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
