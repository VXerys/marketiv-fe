"use client";

import { TrendingUp, TrendingDown, CheckCircle, Users, Eye, Shield, CreditCard } from "lucide-react";

interface KPICardProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  note?: string;
  growth?: number;
  iconBg?: string;
  iconColor?: string;
  iconBorder?: string;
  isLoading?: boolean;
}

function KPICard({
  icon: Icon,
  label,
  value,
  note,
  growth,
  iconBg = "#fff7ed",
  iconColor = "#ea580c",
  iconBorder = "rgba(249,115,22,.18)",
  isLoading = false,
}: KPICardProps) {
  const isPositive = (growth ?? 0) >= 0;

  if (isLoading) {
    return (
      <div
        style={{
          padding: 18,
          borderRadius: 22,
          background: "linear-gradient(180deg, #ffffff, #fffdf9)",
          border: "1px solid rgba(17,24,39,.08)",
          boxShadow: "0 6px 20px rgba(15,23,42,.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ width: 40, height: 40, borderRadius: 15, background: "#edf1f5", position: "relative", overflow: "hidden" }}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
          </div>
          <div style={{ width: 52, height: 20, borderRadius: 7, background: "#edf1f5", position: "relative", overflow: "hidden" }}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
          </div>
        </div>
        <div style={{ width: "55%", height: 12, borderRadius: 7, background: "#edf1f5", marginBottom: 9, position: "relative", overflow: "hidden" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
        </div>
        <div style={{ width: "75%", height: 28, borderRadius: 7, background: "#edf1f5", position: "relative", overflow: "hidden" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        padding: "18px",
        borderRadius: 22,
        background:
          "radial-gradient(circle at 100% 0%, rgba(249,115,22,.06), transparent 10rem), linear-gradient(180deg, #ffffff, #fffdf9)",
        border: "1px solid rgba(17,24,39,.08)",
        boxShadow: "0 6px 20px rgba(15,23,42,.05)",
        overflow: "hidden",
        transition: ".22s cubic-bezier(.2,.8,.2,1)",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-3px)";
        el.style.boxShadow = "0 16px 40px rgba(15,23,42,.09)";
        el.style.borderColor = "rgba(249,115,22,.18)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "0 6px 20px rgba(15,23,42,.05)";
        el.style.borderColor = "rgba(17,24,39,.08)";
      }}
    >
      {/* Top row: icon + growth badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 15,
            display: "grid",
            placeItems: "center",
            background: iconBg,
            border: `1px solid ${iconBorder}`,
            boxShadow: "0 6px 18px rgba(15,23,42,.05)",
          }}
        >
          <Icon size={18} color={iconColor} />
        </div>

        {growth !== undefined && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              height: 24,
              padding: "0 8px",
              borderRadius: 999,
              background: isPositive ? "#f1fbf5" : "#fff5f5",
              border: `1px solid ${isPositive ? "rgba(22,163,74,.20)" : "rgba(220,38,38,.18)"}`,
              color: isPositive ? "#177b42" : "#b4232a",
              fontSize: ".7rem",
              fontWeight: 800,
            }}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{ color: "#737f91", fontSize: ".78rem", fontWeight: 760, marginBottom: 5 }}>{label}</div>

      {/* Value */}
      <div
        style={{
          fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
          fontSize: "clamp(1.5rem, 2.5vw, 1.9rem)",
          lineHeight: 0.95,
          letterSpacing: "-.07em",
          fontWeight: 700,
          color: "#182033",
          marginBottom: note ? 7 : 0,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>

      {note && (
        <div style={{ color: "#a0aaba", fontSize: ".74rem", fontWeight: 700 }}>{note}</div>
      )}
    </div>
  );
}

interface KPISectionProps {
  isLoading?: boolean;
  kpisData?: {
    campaignActive: number;
    campaignCompleted?: number;
    creatorJoined: number;
    viewsValid: number;
    escrowBalance: number;
    totalSpend: number;
  };
}

export function KPISection({ isLoading = false, kpisData }: KPISectionProps) {
  const kpis: KPICardProps[] = [
    {
      icon: TrendingUp,
      label: "Campaign Aktif",
      value: String(kpisData?.campaignActive ?? 5),
      note: "2 akan berakhir minggu ini",
      growth: 25,
      iconBg: "#fff7ed",
      iconColor: "#ea580c",
      iconBorder: "rgba(234,88,12,.18)",
    },
    {
      icon: CheckCircle,
      label: "Campaign Selesai",
      value: String(kpisData?.campaignCompleted ?? 18),
      note: "Bulan ini: 3 selesai",
      growth: 12,
      iconBg: "#f1fbf5",
      iconColor: "#16a34a",
      iconBorder: "rgba(22,163,74,.18)",
    },
    {
      icon: Users,
      label: "Total Kreator",
      value: String(kpisData?.creatorJoined ?? 28),
      note: "4 kreator baru minggu ini",
      growth: 16,
      iconBg: "#f0f6ff",
      iconColor: "#2563eb",
      iconBorder: "rgba(37,99,235,.18)",
    },
    {
      icon: Eye,
      label: "Total Views",
      value:
        typeof kpisData?.viewsValid === "number"
          ? `${(kpisData.viewsValid / 1_000_000).toFixed(1)}jt`
          : "2.4jt",
      note: "Rata-rata 481rb/campaign",
      growth: 38,
      iconBg: "#f7f3ff",
      iconColor: "#7c3aed",
      iconBorder: "rgba(124,58,237,.18)",
    },
    {
      icon: Shield,
      label: "Dana Escrow",
      value:
        kpisData?.escrowBalance !== undefined
          ? `Rp ${(kpisData.escrowBalance / 1_000_000).toFixed(1)}jt`
          : "Rp 8.5jt",
      note: "Terkunci untuk 3 campaign",
      growth: -4,
      iconBg: "#fffbeb",
      iconColor: "#d97706",
      iconBorder: "rgba(217,119,6,.18)",
    },
    {
      icon: CreditCard,
      label: "Total Pengeluaran",
      value:
        kpisData?.totalSpend !== undefined
          ? `Rp ${(kpisData.totalSpend / 1_000_000).toFixed(1)}jt`
          : "Rp 42jt",
      note: "Bulan ini: Rp 12.5jt",
      growth: 8,
      iconBg: "#fff7ed",
      iconColor: "#ea580c",
      iconBorder: "rgba(234,88,12,.18)",
    },
  ];

  return (
    <div>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              color: "#ea580c",
              fontSize: ".7rem",
              fontWeight: 900,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              marginBottom: 5,
            }}
          >
            <span style={{ display: "block", width: 16, height: 2, borderRadius: 999, background: "#f97316" }} />
            Metrik Utama
          </div>
          <h2
            style={{
              fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "clamp(1.15rem, 2vw, 1.5rem)",
              fontWeight: 700,
              letterSpacing: "-.05em",
              lineHeight: 1,
              color: "#182033",
              margin: 0,
            }}
          >
            Ringkasan KPI Bisnis
          </h2>
        </div>
      </div>

      {/*
       * Fixed grid: 2 cols mobile → 3 cols tablet → 6 cols desktop.
       * minmax(0, 1fr) on all tracks prevents overflow.
       */}
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} isLoading={isLoading} />
        ))}
      </div>

      <style jsx global>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        @media (min-width: 640px) {
          .kpi-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1280px) {
          .kpi-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
