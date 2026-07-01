"use client";

import { Shield, ArrowDownLeft, Clock, TrendingUp, ChevronRight } from "lucide-react";

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
  escrowBalance = 3_250_000,
  totalSpend = 4_800_000,
  pendingValidation = 2,
  onViewFinanceClick,
}: FinancialOverviewProps) {
  const items = [
    {
      icon: Shield,
      label: "Saldo Escrow Aktif",
      value: fmt(escrowBalance),
      note: "Dana aman terjamin",
      color: "#d97706",
      bg: "#fffbeb",
      border: "rgba(217,119,6,.16)",
    },
    {
      icon: ArrowDownLeft,
      label: "Dana Cair Bulan Ini",
      value: fmt(totalSpend * 0.4),
      note: "Rilis otomatis",
      color: "#16a34a",
      bg: "#f1fbf5",
      border: "rgba(22,163,74,.16)",
    },
    {
      icon: Clock,
      label: "Menunggu Verifikasi",
      value: String(pendingValidation),
      note: "Submission pending",
      color: "#2563eb",
      bg: "#f0f6ff",
      border: "rgba(37,99,235,.16)",
    },
    {
      icon: TrendingUp,
      label: "Total Pengeluaran",
      value: fmt(totalSpend),
      note: "Sejak bergabung",
      color: "#ea580c",
      bg: "#fff7ed",
      border: "rgba(234,88,12,.16)",
    },
  ];

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: 24,
        border: "1px solid rgba(17,24,39,.08)",
        background:
          "radial-gradient(circle at 100% 0%, rgba(249,115,22,.07), transparent 14rem), linear-gradient(180deg, #ffffff, #fffdf9)",
        boxShadow: "0 8px 24px rgba(15,23,42,.06)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
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
            <span style={{ display: "block", width: 12, height: 2, borderRadius: 999, background: "#f97316" }} />
            Keuangan
          </div>
          <h3
            style={{
              fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "1.05rem",
              fontWeight: 700,
              letterSpacing: "-.04em",
              color: "#182033",
              margin: 0,
            }}
          >
            Ringkasan Keuangan
          </h3>
        </div>

        <button
          onClick={onViewFinanceClick}
          className="inline-flex items-center gap-1 h-8 px-3 rounded-xl text-[.76rem] font-[760] text-[#556174] cursor-pointer transition-all hover:bg-[rgba(17,24,39,0.05)]"
          style={{
            border: "1px solid rgba(17,24,39,.09)",
            background: "rgba(255,255,255,.7)",
            boxShadow: "0 4px 12px rgba(15,23,42,.04)",
            whiteSpace: "nowrap",
          }}
        >
          Lihat Semua
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Finance rows */}
      {isLoading ? (
        <div style={{ display: "grid", gap: 10 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ padding: 13, borderRadius: 16, background: "#f3f5f8", display: "grid", gap: 7 }}>
              <div style={{ width: "45%", height: 11, borderRadius: 6, background: "#edf1f5", position: "relative", overflow: "hidden" }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
              </div>
              <div style={{ width: "65%", height: 18, borderRadius: 6, background: "#edf1f5", position: "relative", overflow: "hidden" }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", animation: "shimmer 1.45s infinite" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 9 }}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 13px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,.55)",
                  border: "1px solid rgba(17,24,39,.05)",
                  transition: ".18s ease",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    background: item.bg,
                    border: `1px solid ${item.border}`,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} color={item.color} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#737f91", fontSize: ".72rem", fontWeight: 760, marginBottom: 2 }} className="truncate">
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#182033",
                      letterSpacing: "-.022em",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.value}
                  </div>
                </div>

                <div
                  style={{
                    flexShrink: 0,
                    padding: "3px 8px",
                    borderRadius: 7,
                    background: "#f8fafc",
                    border: "1px solid rgba(17,24,39,.06)",
                    fontSize: ".66rem",
                    fontWeight: 700,
                    color: "#737f91",
                    whiteSpace: "nowrap",
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
