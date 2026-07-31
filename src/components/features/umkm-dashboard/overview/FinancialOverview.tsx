"use client";

import { Shield, Clock, TrendingUp, ChevronRight } from "lucide-react";

interface FinancialOverviewProps {
  isLoading?: boolean;
  escrowBalance?: number;
  totalSpend?: number;
  pendingValidation?: number;
  onViewFinanceClick?: () => void;
}

function fmt(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function FinancialOverview({
  isLoading = false,
  escrowBalance,
  totalSpend,
  pendingValidation,
  onViewFinanceClick,
}: FinancialOverviewProps) {
  const items = [
    {
      icon: Shield,
      label: "Saldo Escrow",
      value: escrowBalance !== undefined ? fmt(escrowBalance) : "—",
      note: "Dana aman",
      color: "#d97706",
      bg: "radial-gradient(circle at 100% 0%, rgba(217,119,6,.10), transparent 8rem), linear-gradient(180deg, #ffffff, #fffbeb)",
      iconBg: "#fffbeb",
      border: "rgba(217,119,6,.15)",
      highlight: true,
    },
    {
      icon: Clock,
      label: "Pending Verifikasi",
      value: pendingValidation !== undefined ? String(pendingValidation) : "—",
      note: "submission",
      color: "#2563eb",
      bg: "radial-gradient(circle at 100% 0%, rgba(37,99,235,.08), transparent 8rem), linear-gradient(180deg, #ffffff, #f0f6ff)",
      iconBg: "#f0f6ff",
      border: "rgba(37,99,235,.10)",
      highlight: false,
    },
    {
      icon: TrendingUp,
      label: "Total Pengeluaran",
      value: totalSpend !== undefined ? fmt(totalSpend) : "—",
      note: "Sejak bergabung",
      color: "#ea580c",
      bg: "radial-gradient(circle at 100% 0%, rgba(234,88,12,.08), transparent 8rem), linear-gradient(180deg, #ffffff, #fff7ed)",
      iconBg: "#fff7ed",
      border: "rgba(234,88,12,.10)",
      highlight: false,
    },
  ];

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: 24,
        border: "1px solid rgba(17,24,39,.08)",
        background:
          "radial-gradient(circle at 100% 0%, rgba(249,115,22,.05), transparent 14rem), linear-gradient(180deg, #ffffff 0%, #fffdf9 100%)",
        boxShadow: "0 6px 20px rgba(15,23,42,.05), 0 1px 0 rgba(255,255,255,.9) inset",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              color: "#ea580c",
              fontSize: ".72rem",
              fontWeight: 900,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              marginBottom: 5,
            }}
          >
            <span style={{ display: "block", width: 14, height: 2, borderRadius: 999, background: "#f97316" }} />
            Keuangan
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
            Ringkasan Keuangan
          </h3>
        </div>

        <button
          onClick={onViewFinanceClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            height: 32,
            padding: "0 12px",
            borderRadius: 10,
            border: "1px solid rgba(17,24,39,.09)",
            background: "rgba(255,255,255,.75)",
            color: "#556174",
            fontSize: ".74rem",
            fontWeight: 760,
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(15,23,42,.04)",
            flexShrink: 0,
          }}
        >
          Lihat Semua
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Finance grid */}
      {isLoading ? (
        <div style={{ display: "grid", gap: 9 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                padding: "11px 13px",
                borderRadius: 14,
                background: "#f8fafc",
                display: "grid",
                gap: 6,
              }}
            >
              <div style={{ width: "40%", height: 10, borderRadius: 5, background: "#eef2f7", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
              </div>
              <div style={{ width: "60%", height: 16, borderRadius: 5, background: "#eef2f7", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="hover-card-animate"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: item.highlight ? "12px 13px" : "10px 13px",
                  borderRadius: 14,
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  boxShadow: item.highlight ? "0 4px 12px rgba(15,23,42,.03)" : "0 2px 6px rgba(15,23,42,.015)",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 11,
                    display: "grid",
                    placeItems: "center",
                    background: item.iconBg,
                    border: `1px solid ${item.border}`,
                    flexShrink: 0,
                    boxShadow: item.highlight ? "0 3px 8px rgba(0,0,0,.03)" : "none",
                  }}
                >
                  <Icon size={15} color={item.color} />
                </div>

                {/* Label + value */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: "#9ca8b8",
                      fontSize: ".7rem",
                      fontWeight: 700,
                      marginBottom: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
                      fontSize: item.highlight ? "1.05rem" : ".95rem",
                      fontWeight: item.highlight ? 800 : 700,
                      color: item.highlight ? item.color : "#182033",
                      letterSpacing: "-.025em",
                      wordBreak: "break-word",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.value}
                  </div>
                </div>

                {/* Note chip */}
                <div
                  style={{
                    flexShrink: 0,
                    padding: "3px 8px",
                    borderRadius: 7,
                    background: item.highlight ? "rgba(255,255,255,.65)" : "#f3f6f9",
                    border: item.highlight ? `1px solid ${item.border}` : "1px solid rgba(17,24,39,.05)",
                    fontSize: ".65rem",
                    fontWeight: 780,
                    color: item.highlight ? item.color : "#737f91",
                  }}
                >
                  {item.note}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
