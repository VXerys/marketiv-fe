"use client";

import Link from "next/link";
import { Users, Eye, Calendar, ChevronRight, Plus } from "lucide-react";
import type { Campaign, CampaignStatus } from "@/types/umkm-dashboard.types";
import { formatCurrency } from "@/lib/formatters";

interface CampaignSectionProps {
  campaigns?: Campaign[];
  isLoading?: boolean;
  onCreateClick?: () => void;
  onViewAllClick?: () => void;
}

const STATUS_CONFIG: Record<CampaignStatus, { label: string; bg: string; color: string; border: string }> = {
  active: { label: "Aktif", bg: "#f1fbf5", color: "#177b42", border: "rgba(22,163,74,.22)" },
  draft: { label: "Draft", bg: "#f8fafc", color: "#687386", border: "rgba(148,163,184,.28)" },
  full: { label: "Penuh", bg: "#fff7ed", color: "#bd4b0b", border: "rgba(251,146,60,.24)" },
  completed: { label: "Selesai", bg: "#f0f6ff", color: "#2d5bd1", border: "rgba(96,165,250,.25)" },
  cancelled: { label: "Dibatalkan", bg: "#fff3f3", color: "#b4232a", border: "rgba(248,113,113,.24)" },
};

function CampaignSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden bg-white border border-neutral-200/80 rounded-[28px] shadow-[0_12px_36px_-12px_rgba(0,0,0,0.05)]">
      {/* Cover placeholder */}
      <div className="h-[160px] bg-[#edf1f5] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent" style={{ animation: "shimmer 1.45s infinite" }} />
      </div>
      {/* Body placeholder */}
      <div className="p-5 flex flex-col gap-3">
        {[80, 60, 100, 70].map((w, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-lg bg-[#edf1f5]"
            style={{ width: `${w}%`, height: i === 2 ? 8 : 14 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent" style={{ animation: "shimmer 1.45s infinite" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatViews(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
  return String(num);
}

function formatBudget(num: number): string {
  if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)}jt`;
  if (num >= 1000) return `Rp ${(num / 1000).toFixed(0)}rb`;
  return `Rp ${num}`;
}

const NICHE_COLOR_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  kuliner:    { bg: "rgba(249,115,22,.05)",  text: "#ea580c", border: "rgba(249,115,22,.10)" },
  fesyen:     { bg: "rgba(22,163,74,.05)",   text: "#16a34a", border: "rgba(22,163,74,.10)" },
  pariwisata: { bg: "rgba(37,99,235,.05)",   text: "#2563eb", border: "rgba(37,99,235,.10)" },
  edukasi:    { bg: "rgba(124,58,237,.05)",  text: "#7c3aed", border: "rgba(124,58,237,.10)" },
  kecantikan: { bg: "rgba(244,114,182,.05)", text: "#db2777", border: "rgba(244,114,182,.10)" },
  lainnya:    { bg: "rgba(107,114,128,.05)", text: "#4b5563", border: "rgba(107,114,128,.10)" },
};

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const statusCfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.active;
  const progressPercent = campaign.totalBudgetEscrow > 0 ? Math.min(100, Math.round((campaign.usedBudget / campaign.totalBudgetEscrow) * 100)) : 0;
  
  // Custom cover gradients based on niche
  const coverGradients: Record<string, string> = {
    kuliner: "linear-gradient(135deg, #fb923c, #c2410c)",
    fesyen: "linear-gradient(135deg, #16a34a, #84cc16)",
    pariwisata: "linear-gradient(135deg, #1e3a5f, #93c5fd)",
    edukasi: "linear-gradient(135deg, #a78bfa, #6d28d9)",
    kecantikan: "linear-gradient(135deg, #f472b6, #be185d)",
    lainnya: "linear-gradient(135deg, #6b7280, #374151)",
  };

  const coverGradient = coverGradients[campaign.niche] || coverGradients.kuliner;
  const nicheCfg = NICHE_COLOR_CONFIG[campaign.niche] || NICHE_COLOR_CONFIG.lainnya;

  return (
    <Link
      href={`/dashboard/umkm/campaign/${campaign.id}`}
      className="flex flex-col overflow-hidden bg-white border border-neutral-200/80 rounded-[28px] shadow-[0_12px_36px_-12px_rgba(0,0,0,0.05)] cursor-pointer hover-card-animate"
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          height: 160,
          position: "relative",
          overflow: "hidden",
          background: coverGradient,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 24%, rgba(255,255,255,.82) 0 10%, transparent 11%), radial-gradient(circle at 82% 22%, rgba(255,255,255,.38) 0 8%, transparent 9%), linear-gradient(180deg, transparent 34%, rgba(12,23,43,.32))",
          }}
        />
        {/* Status badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            minHeight: 28,
            padding: "0 10px",
            borderRadius: 999,
            background: "rgba(255,255,255,.88)",
            border: `1px solid ${statusCfg.border}`,
            color: statusCfg.color,
            fontSize: ".72rem",
            fontWeight: 800,
            backdropFilter: "blur(10px)",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusCfg.color }} />
          {statusCfg.label}
        </div>
        {/* Budget chip bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            padding: "8px 12px",
            borderRadius: 14,
            background: "rgba(255,255,255,.88)",
            border: "1px solid rgba(255,255,255,.32)",
            boxShadow: "0 12px 28px rgba(15,23,42,.10)",
            fontWeight: 850,
            fontSize: ".82rem",
            color: "#182033",
            letterSpacing: "-.02em",
            backdropFilter: "blur(10px)",
          }}
        >
          {formatBudget(campaign.totalBudgetEscrow)}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px", display: "grid", gap: 12, flex: 1 }}>
        <div>
          <span style={{
            display: "inline-block",
            fontSize: "9px",
            fontWeight: 900,
            color: nicheCfg.text,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: "6px",
            background: nicheCfg.bg,
            padding: "2px 8px",
            borderRadius: "6px",
            border: `1px solid ${nicheCfg.border}`,
            userSelect: "none"
          }}>
            {campaign.niche}
          </span>
          <h3
            style={{
              margin: "0 0 4px",
              fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif",
              fontSize: "1.05rem",
              lineHeight: 1.2,
              letterSpacing: "-.04em",
              color: "#182033",
            }}
          >
            {campaign.title}
          </h3>
        </div>

        {/* CPM / Reward Rate Info */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 10,
          background: "rgba(249,115,22,.05)",
          border: "1px solid rgba(249,115,22,.10)",
          fontSize: ".7rem",
          fontWeight: 800,
          color: "#ea580c",
          width: "fit-content",
        }}>
          Komisi: {formatCurrency(campaign.pricePerThousandViews)} / 1.000 views
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#737f91", fontSize: ".78rem", fontWeight: 700 }}>
            <Users size={13} />
            {campaign.usedQuota}/{campaign.creatorQuota} Kreator
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#737f91", fontSize: ".78rem", fontWeight: 700 }}>
            <Eye size={13} />
            {formatViews(campaign.totalViews)} views
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#737f91", fontSize: ".78rem", fontWeight: 700 }}>
            <Calendar size={13} />
            {new Date(campaign.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#737f91" }}>
              Anggaran Terpakai
            </span>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center" }}>
              {formatBudget(campaign.usedBudget)}{" "}
              <span style={{ color: "#94a3b8", fontWeight: 500, margin: "0 4px" }}>/</span>{" "}
              {formatBudget(campaign.totalBudgetEscrow)}{" "}
              <span
                style={{
                  marginLeft: 6,
                  fontSize: "11px",
                  padding: "2px 6px",
                  borderRadius: 6,
                  fontWeight: 700,
                  border: progressPercent >= 100 ? "1px solid #bbf7d0" : "1px solid #ffedd5",
                  background: progressPercent >= 100 ? "#f0fdf4" : "#fff7ed",
                  color: progressPercent >= 100 ? "#16a34a" : "#ea580c",
                }}
              >
                {progressPercent}%
              </span>
            </span>
          </div>
          <div
            style={{
              position: "relative",
              height: 10,
              borderRadius: 999,
              background: "#f1f5f9",
              overflow: "hidden",
              boxShadow: "inset 0 1.5px 3px rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                borderRadius: "inherit",
                background: progressPercent >= 100
                  ? "linear-gradient(90deg, #10b981, #14b8a6, #34d399)"
                  : "linear-gradient(90deg, #ea580c, #f97316, #fbbf24)",
                transition: "width .8s cubic-bezier(.2,.8,.2,1)",
                position: "relative",
              }}
            >
              {/* Glossy top highlight */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: "35%",
                  background: "rgba(255, 255, 255, 0.25)",
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CampaignSection({ campaigns = [], isLoading = false, onCreateClick, onViewAllClick }: CampaignSectionProps) {
  const visibleCampaigns = campaigns.slice(0, 2);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
        <div>
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
            Campaign
          </div>
          <h2
            style={{
              fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif",
              fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
              fontWeight: 700,
              letterSpacing: "-.055em",
              lineHeight: 1,
              color: "#182033",
              margin: 0,
            }}
          >
            Campaign Terbaru Anda
          </h2>
        </div>

        {!isLoading && campaigns.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onViewAllClick}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 34,
                padding: "0 12px",
                border: "1px solid rgba(17,24,39,.09)",
                borderRadius: 11,
                background: "rgba(255,255,255,.82)",
                color: "#556174",
                fontSize: ".78rem",
                fontWeight: 790,
                boxShadow: "0 6px 18px rgba(15,23,42,.05)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Lihat Semua
              <ChevronRight size={13} />
            </button>
            <button
              onClick={onCreateClick}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 34,
                padding: "0 12px",
                border: "none",
                borderRadius: 11,
                background: "linear-gradient(180deg, #fb7a18 0%, #ea580c 100%)",
                color: "white",
                fontSize: ".78rem",
                fontWeight: 800,
                boxShadow: "0 8px 20px rgba(234,88,12,.2)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <Plus size={14} />
              Buat Baru
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <CampaignSkeleton key={i} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div
          style={{
            padding: "48px 20px",
            borderRadius: 24,
            border: "1px solid rgba(17,24,39,.08)",
            background: "white",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(15,23,42,.04)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>📢</div>
          <h3 style={{ margin: "0 0 6px", fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#182033" }}>
            Belum Ada Campaign
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: ".82rem", color: "#737f91", maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
            Mulai promosikan bisnis Anda dengan membuat brief campaign pertama.
          </p>
          <button
            onClick={onCreateClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              minHeight: 36,
              padding: "0 16px",
              border: "none",
              borderRadius: 11,
              background: "linear-gradient(180deg, #fb7a18 0%, #ea580c 100%)",
              color: "white",
              fontSize: ".82rem",
              fontWeight: 800,
              boxShadow: "0 8px 20px rgba(234,88,12,.2)",
              cursor: "pointer",
            }}
          >
            <Plus size={14} />
            Buat Campaign Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleCampaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} />
          ))}
        </div>
      )}
    </div>
  );
}
