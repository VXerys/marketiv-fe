"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ShieldCheck,
  Users,
  Zap,
  Sparkles,
  Megaphone,
  Handshake,
  Lock,
  Target,
  Briefcase,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketivLogo } from "@/components/ui/MarketivLogo";

interface HeroBullet {
  icon: string;
  text: string;
}

interface AuthSplitProps {
  role: "umkm" | "creator";
  heroTitle: string;
  heroTagline: string;
  heroBullets?: readonly HeroBullet[];
  children: React.ReactNode;
  className?: string;
}

const ROLE_STYLES = {
  umkm: {
    heroImage: "/umkm_logout_hero.jpg",
    glowColor: "rgba(249, 115, 22, 0.45)",
    badgeText: "Solusi Pemasaran UMKM",
    badgeClass: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    iconBg: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    gradientText: "from-orange-400 via-amber-300 to-white",
    metrics: [
      { icon: TrendingUp, val: "1,200+", label: "Campaign Aktif" },
      { icon: ShieldCheck, val: "Rp 450M+", label: "Escrow Aman" },
    ],
    bulletIcons: [Megaphone, Handshake, Lock],
  },
  creator: {
    heroImage: "/kreator_logout_hero.jpg",
    glowColor: "rgba(124, 58, 237, 0.45)",
    badgeText: "Monetisasi Konten Kreator",
    badgeClass: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    iconBg: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    gradientText: "from-violet-400 via-purple-300 to-white",
    metrics: [
      { icon: Users, val: "10,000+", label: "Kreator Bergabung" },
      { icon: Zap, val: "100%", label: "Pembayaran Tepat Waktu" },
    ],
    bulletIcons: [Target, Briefcase, Wallet],
  },
} as const;

/**
 * Split-screen layout auth ultra-premium dengan Framer Motion & Dark Luxury Glassmorphism.
 */
export function AuthSplit({
  role,
  heroTitle,
  heroTagline,
  heroBullets,
  children,
  className,
}: AuthSplitProps) {
  const s = ROLE_STYLES[role];

  return (
    <div
      className={cn(
        "w-full max-w-[1040px] overflow-hidden rounded-[2.5rem]",
        "border border-neutral-200/90 bg-white shadow-2xl transition-all duration-300",
        "flex flex-col md:flex-row min-h-[660px]",
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

          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-3 py-1 text-[0.7rem] font-[800] text-ink-500 shadow-3xs">
            <Sparkles className="h-3 w-3 text-orange-500" />
            Official Platform
          </span>
        </div>

        {/* Content Children */}
        <div className="my-auto w-full">{children}</div>

        {/* Form Footer info */}
        <div className="mt-8 text-center text-[0.72rem] font-semibold text-ink-400">
          © {new Date().getFullYear()} Marketiv Inc. Seluruh hak cipta dilindungi.
        </div>
      </div>

      {/* Hero Panel Visual (Kanan di desktop) — Dark Luxury Glassmorphism dengan Motion */}
      <div className="relative hidden md:flex md:w-[48%] flex-col justify-between overflow-hidden p-8 lg:p-10 text-white select-none bg-[#090D16]">
        {/* Ambient lighting glows */}
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-50 transition-all duration-700"
          style={{ backgroundColor: s.glowColor }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 transition-all duration-700"
          style={{ backgroundColor: s.glowColor }}
        />

        {/* Subtle grid mesh background */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04]"
          aria-hidden="true"
        />

        {/* Dynamic Content wrapper with Framer Motion */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 flex flex-col justify-between h-full"
          >
            {/* Top Header Badge */}
            <div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[0.72rem] font-[800] backdrop-blur-md shadow-sm",
                  s.badgeClass
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {s.badgeText}
              </span>
            </div>

            {/* Middle Main Copy & Glass Benefit Cards */}
            <div className="my-auto py-6">
              <h2
                className={cn(
                  "font-display text-2xl lg:text-3xl font-[900] leading-snug tracking-tight text-transparent bg-clip-text bg-gradient-to-r",
                  s.gradientText
                )}
              >
                {heroTitle}
              </h2>
              <p className="mt-3 text-xs lg:text-sm font-medium leading-relaxed text-neutral-300/90">
                {heroTagline}
              </p>

              {/* Glass Benefit Bullets */}
              {heroBullets && heroBullets.length > 0 && (
                <div className="mt-6 space-y-3">
                  {heroBullets.map((b, i) => {
                    const BulletIcon = s.bulletIcons[i % s.bulletIcons.length] || Sparkles;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                        className="flex items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3.5 backdrop-blur-xl shadow-lg transition-all duration-200 hover:bg-white/[0.07] hover:border-white/20 hover:translate-x-1"
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                            s.iconBg
                          )}
                        >
                          <BulletIcon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-neutral-100 leading-tight">
                          {b.text}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Metrics Bar (Glassmorphism) */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.05] p-3.5 backdrop-blur-2xl shadow-2xl">
              {s.metrics.map((m, idx) => {
                const IconComponent = m.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-xl border",
                        s.iconBg
                      )}
                    >
                      <IconComponent className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="font-display text-sm font-[900] leading-none text-white">
                        {m.val}
                      </div>
                      <div className="mt-1 text-[0.65rem] font-semibold text-neutral-400 leading-tight">
                        {m.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
