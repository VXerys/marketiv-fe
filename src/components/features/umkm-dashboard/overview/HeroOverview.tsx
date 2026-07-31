"use client";

import { TrendingUp, Users, Eye, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroOverviewProps {
  businessName?: string;
  campaignAktif?: number;
  totalViews?: string;
  totalKreator?: number;
  danaBerjalan?: string;
  isLoading?: boolean;
}

function SkeletonBlock({ width = "100%", height = 16 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 10,
        background: "rgba(255,255,255,.15)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent)",
          animation: "shimmer 1.45s infinite",
        }}
      />
    </div>
  );
}

/**
 * Default parameter di sini dulu berisi angka contoh (`5`, `"2.4jt"`, `28`,
 * `"Rp 12.5jt"`) dan nama `"Dapur Sehat"`. Karena default hanya berlaku saat
 * prop `undefined` — persis kondisi ketika pembacaan gagal — hero menampilkan
 * angka karangan tepat pada saat data tidak ada. Sekarang strip.
 */
export function HeroOverview({
  businessName = "",
  campaignAktif,
  totalViews = "—",
  totalKreator,
  danaBerjalan = "—",
  isLoading = false,
}: HeroOverviewProps) {
  const stats = [
    { icon: TrendingUp, label: "Campaign Aktif", value: campaignAktif === undefined ? "—" : String(campaignAktif), colorClass: "bg-orange-500/10 border-orange-500/20 text-orange-400", glowColor: "hover:shadow-[0_8px_24px_rgba(249,115,22,0.1)]" },
    { icon: Eye, label: "Total Views", value: totalViews, colorClass: "bg-blue-500/10 border-blue-500/20 text-blue-400", glowColor: "hover:shadow-[0_8px_24px_rgba(59,130,246,0.1)]" },
    { icon: Users, label: "Total Kreator", value: totalKreator === undefined ? "—" : String(totalKreator), colorClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", glowColor: "hover:shadow-[0_8px_24px_rgba(16,185,129,0.1)]" },
    { icon: Wallet, label: "Dana Berjalan", value: danaBerjalan, colorClass: "bg-purple-500/10 border-purple-500/20 text-purple-400", glowColor: "hover:shadow-[0_8px_24px_rgba(139,92,246,0.1)]" },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-[32px] border border-white/10"
      style={{
        background:
          "radial-gradient(circle at 8% 12%, rgba(249,115,22,.20), transparent 28rem), radial-gradient(circle at 92% 86%, rgba(59,130,246,.12), transparent 24rem), linear-gradient(135deg, #0b1528 0%, #112240 50%, #080f1a 100%)",
        boxShadow: "0 32px 90px rgba(15,23,42,.30), inset 0 1px 0 rgba(255,255,255,.05)",
      }}
    >
      {/* Grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.032) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)",
        }}
      />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        {/* Top row: greeting + status badge */}
        <div className="flex flex-row justify-between items-start gap-6 mb-8">
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid gap-2.5">
                <SkeletonBlock width={130} height={12} />
                <SkeletonBlock width={300} height={36} />
                <SkeletonBlock width={220} height={12} />
              </div>
            ) : (
              <>
                {/* Active pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-[0.72rem] font-[800] uppercase tracking-wider mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse" />
                  Dashboard Aktif
                </div>

                {/* Heading */}
                <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-black text-white tracking-tight leading-none mb-2.5">
                  Selamat datang,{" "}
                  <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-orange-400 bg-clip-text text-transparent">
                    {businessName}
                  </span>
                </h1>

                <p className="text-white/50 text-xs sm:text-sm font-semibold">
                  Ringkasan bisnis Anda hari ini — semua dalam satu tampilan.
                </p>
              </>
            )}
          </div>

        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "group p-4.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md transition-all duration-300 select-none hover:-translate-y-1 hover:bg-white/[0.06] hover:border-white/[0.12]",
                stat.glowColor
              )}
            >
              {isLoading ? (
                <div className="grid gap-2">
                  <SkeletonBlock width={30} height={30} />
                  <SkeletonBlock width="70%" height={24} />
                  <SkeletonBlock width="50%" height={10} />
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mb-4 transition-transform duration-300 group-hover:scale-105",
                      stat.colorClass
                    )}
                  >
                    <stat.icon size={16} strokeWidth={2.5} />
                  </div>
                  <div className="text-[10px] text-white/45 font-extrabold uppercase tracking-wider leading-none mb-1.5">
                    {stat.label}
                  </div>
                  <div className="font-display text-2xl sm:text-[1.75rem] font-black text-white tracking-tight leading-none">
                    {stat.value}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
