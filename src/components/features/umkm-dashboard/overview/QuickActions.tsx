"use client";

import Link from "next/link";
import { Plus, Search, List, Wallet, ArrowUpRight } from "lucide-react";

interface QuickAction {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  description: string;
  href: string;
  primary?: boolean;
  color: string;
  bg: string;
  border: string;
  shadowColor: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: Plus,
    label: "Buat Kampanye",
    description: "Mulai kampanye baru sekarang",
    href: "/dashboard/umkm/campaign/buat",
    primary: true,
    color: "white",
    bg: "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.15), transparent 8rem), linear-gradient(135deg, #fb7a18 0%, #ea580c 60%, #c2410c 100%)",
    border: "rgba(194,65,12,.24)",
    shadowColor: "rgba(234,88,12,.22)",
  },
  {
    icon: Search,
    label: "Cari Kreator",
    description: "Temukan kreator terbaik",
    href: "/dashboard/umkm/kreator",
    color: "#2563eb",
    bg: "radial-gradient(circle at 100% 0%, rgba(37,99,235,.12), transparent 10rem), linear-gradient(180deg, #ffffff, #f5f8ff)",
    border: "rgba(37,99,235,.12)",
    shadowColor: "rgba(37,99,235,.04)",
  },
  {
    icon: List,
    label: "Lihat Kampanye",
    description: "Kelola semua kampanye",
    href: "/dashboard/umkm/campaign",
    color: "#7c3aed",
    bg: "radial-gradient(circle at 100% 0%, rgba(124,58,237,.12), transparent 10rem), linear-gradient(180deg, #ffffff, #faf8ff)",
    border: "rgba(124,58,237,.12)",
    shadowColor: "rgba(124,58,237,.04)",
  },
  {
    icon: Wallet,
    label: "Kelola Keuangan",
    description: "Transaksi & Dana Aman",
    href: "/dashboard/umkm/keuangan",
    color: "#16a34a",
    bg: "radial-gradient(circle at 100% 0%, rgba(22,163,74,.12), transparent 10rem), linear-gradient(180deg, #ffffff, #f4fcf7)",
    border: "rgba(22,163,74,.12)",
    shadowColor: "rgba(22,163,74,.04)",
  },
];

export function QuickActions() {
  return (
    <div
      className="relative rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] h-full flex flex-col justify-between"
    >
      <div className="flex flex-col h-full justify-between">
        {/* Header */}
        <div className="mb-3 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 block mb-0.5">
            AKSI CEPAT
          </span>
          <h3 className="text-base font-black text-slate-900 tracking-tight font-display">
            Akses Fitur Utama
          </h3>
        </div>

        {/* Grid 2×2 */}
        <div className="grid grid-cols-2 gap-2.5 flex-1">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              data-onboarding={action.primary ? "create-campaign" : undefined}
              className="hover-card-animate relative overflow-hidden p-3 rounded-2xl flex flex-col justify-between transition-all"
              style={{
                border: `1px solid ${action.border}`,
                background: action.bg,
                boxShadow: action.primary
                  ? `0 10px 24px ${action.shadowColor}, inset 0 1px 0 rgba(255,255,255,.22)`
                  : `0 4px 10px ${action.shadowColor}`,
              }}
            >
              {/* Arrow indicator */}
              <div
                className="absolute top-2.5 right-2.5 w-5 h-5 rounded-md grid place-items-center"
                style={{
                  background: action.primary ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.75)",
                  border: action.primary ? "1px solid rgba(255,255,255,.14)" : `1px solid ${action.border}`,
                }}
              >
                <ArrowUpRight size={11} color={action.primary ? "rgba(255,255,255,.85)" : action.color} />
              </div>

              {/* Icon container */}
              <div
                className="w-7 h-7 rounded-lg grid place-items-center mb-2 shrink-0"
                style={{
                  background: action.primary ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.82)",
                  border: action.primary ? "1px solid rgba(255,255,255,.16)" : `1px solid ${action.border}`,
                }}
              >
                <action.icon size={14} color={action.primary ? "white" : action.color} />
              </div>

              <div>
                <strong
                  className="block font-display text-xs font-black tracking-tight leading-snug mb-0.5 pr-4"
                  style={{ color: action.primary ? "white" : "#0f172a" }}
                >
                  {action.label}
                </strong>
                <span
                  className="block text-[10px] font-semibold leading-tight line-clamp-2"
                  style={{ color: action.primary ? "rgba(255,255,255,.75)" : "#64748b" }}
                >
                  {action.description}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

