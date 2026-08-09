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
      style={{
        padding: "20px",
        borderRadius: 24,
        border: "1px solid rgba(17,24,39,.08)",
        background:
          "radial-gradient(circle at 100% 0%, rgba(249,115,22,.05), transparent 12rem), linear-gradient(180deg, #ffffff 0%, #fffdf9 100%)",
        boxShadow: "0 6px 20px rgba(15,23,42,.05), 0 1px 0 rgba(255,255,255,.9) inset",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#ea580c",
            fontSize: ".72rem",
            fontWeight: 900,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            marginBottom: 5,
          }}
        >
          <span style={{ display: "block", width: 14, height: 2, borderRadius: 999, background: "#f97316" }} />
          Aksi Cepat
        </div>
        <h3
          style={{
            fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "1.1rem",
            fontWeight: 700,
            letterSpacing: "-.045em",
            color: "#182033",
            margin: 0,
          }}
        >
          Aksi Cepat
        </h3>
      </div>

      {/* Grid 2×2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
        }}
      >
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="hover-card-animate"
            style={{
              position: "relative",
              overflow: "hidden",
              padding: "14px 13px 14px",
              borderRadius: 18,
              border: `1px solid ${action.border}`,
              background: action.bg,
              display: "flex",
              flexDirection: "column",
              textDecoration: "none",
              color: "inherit",
              boxShadow: action.primary
                ? `0 10px 24px ${action.shadowColor}, inset 0 1px 0 rgba(255,255,255,.22)`
                : `0 4px 10px ${action.shadowColor}`,
            }}
          >
            {/* Arrow indicator — top right */}
            <div
              style={{
                position: "absolute",
                top: 11,
                right: 11,
                width: 22,
                height: 22,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                background: action.primary ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.75)",
                border: action.primary ? "1px solid rgba(255,255,255,.14)" : `1px solid ${action.border}`,
              }}
            >
              <ArrowUpRight size={11} color={action.primary ? "rgba(255,255,255,.85)" : action.color} />
            </div>

            {/* Icon container */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                marginBottom: 12,
                background: action.primary ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.82)",
                border: action.primary ? "1px solid rgba(255,255,255,.16)" : `1px solid ${action.border}`,
                boxShadow: action.primary ? "0 4px 10px rgba(0,0,0,.12)" : "0 2px 6px rgba(0,0,0,.04)",
              }}
            >
              <action.icon size={16} color={action.primary ? "white" : action.color} />
            </div>

            <strong
              style={{
                display: "block",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: ".86rem",
                fontWeight: 800,
                letterSpacing: "-.02em",
                color: action.primary ? "white" : "#182033",
                marginBottom: 3,
                paddingRight: 20,
                lineHeight: 1.25,
              }}
            >
              {action.label}
            </strong>
            <span
              style={{
                display: "block",
                fontSize: ".72rem",
                fontWeight: 600,
                color: action.primary ? "rgba(255,255,255,.72)" : "#737f91",
                lineHeight: 1.4,
              }}
            >
              {action.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
