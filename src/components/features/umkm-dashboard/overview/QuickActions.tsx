"use client";

import Link from "next/link";
import { Plus, Search, List, Wallet } from "lucide-react";

interface QuickAction {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  description: string;
  href: string;
  primary?: boolean;
  color: string;
  bg: string;
  border: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: Plus,
    label: "Buat Campaign",
    description: "Mulai campaign baru",
    href: "/dashboard/umkm/campaign/buat",
    primary: true,
    color: "white",
    bg: "linear-gradient(180deg, #fb7a18 0%, #ea580c 100%)",
    border: "rgba(194,65,12,.22)",
  },
  {
    icon: Search,
    label: "Cari Kreator",
    description: "Temukan kreator terbaik",
    href: "/dashboard/umkm/kreator",
    color: "#2563eb",
    bg: "linear-gradient(180deg, #f0f6ff, #e8f2ff)",
    border: "rgba(37,99,235,.18)",
  },
  {
    icon: List,
    label: "Lihat Campaign",
    description: "Kelola semua campaign",
    href: "/dashboard/umkm/campaign",
    color: "#7c3aed",
    bg: "linear-gradient(180deg, #f7f3ff, #f1ecff)",
    border: "rgba(124,58,237,.18)",
  },
  {
    icon: Wallet,
    label: "Kelola Keuangan",
    description: "Transaksi & escrow",
    href: "/dashboard/umkm/keuangan",
    color: "#16a34a",
    bg: "linear-gradient(180deg, #f1fbf5, #e8f8ef)",
    border: "rgba(22,163,74,.18)",
  },
];

export function QuickActions() {
  return (
    <div
      style={{
        padding: "22px",
        borderRadius: 24,
        border: "1px solid rgba(17,24,39,.08)",
        background:
          "radial-gradient(circle at 100% 0%, rgba(249,115,22,.06), transparent 12rem), linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,255,255,.82))",
        boxShadow: "0 8px 24px rgba(15,23,42,.06)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
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
            marginBottom: 6,
          }}
        >
          <span style={{ display: "block", width: 14, height: 2, borderRadius: 999, background: "#f97316" }} />
          Aksi Cepat
        </div>
        <h3
          style={{
            fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif",
            fontSize: "1.15rem",
            fontWeight: 700,
            letterSpacing: "-.045em",
            color: "#182033",
            margin: 0,
          }}
        >
          Quick Actions
        </h3>
      </div>

      {/* Grid 2x2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            style={{
              padding: "16px 14px",
              borderRadius: 18,
              border: `1px solid ${action.border}`,
              background: action.bg,
              textAlign: "left",
              cursor: "pointer",
              boxShadow: action.primary
                ? "0 14px 30px rgba(234,88,12,.22), inset 0 1px 0 rgba(255,255,255,.22)"
                : "0 6px 16px rgba(15,23,42,.04)",
              transition: ".22s cubic-bezier(.2,.8,.2,1)",
              display: "flex",
              flexDirection: "column",
              textDecoration: "none",
              color: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow = action.primary
                ? "0 20px 40px rgba(234,88,12,.28), inset 0 1px 0 rgba(255,255,255,.24)"
                : "0 12px 28px rgba(15,23,42,.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = action.primary
                ? "0 14px 30px rgba(234,88,12,.22), inset 0 1px 0 rgba(255,255,255,.22)"
                : "0 6px 16px rgba(15,23,42,.04)";
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 13,
                display: "grid",
                placeItems: "center",
                background: action.primary ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.72)",
                marginBottom: 12,
                border: action.primary ? "1px solid rgba(255,255,255,.18)" : `1px solid ${action.border}`,
              }}
            >
              <action.icon size={17} color={action.primary ? "white" : action.color} />
            </div>
            <strong
              style={{
                display: "block",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                fontSize: ".88rem",
                fontWeight: 800,
                letterSpacing: "-.018em",
                color: action.primary ? "white" : "#182033",
                marginBottom: 3,
              }}
            >
              {action.label}
            </strong>
            <span
              style={{
                display: "block",
                fontSize: ".74rem",
                fontWeight: 650,
                color: action.primary ? "rgba(255,255,255,.72)" : "#737f91",
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
