"use client";

import Link from "next/link";
import { Users, Eye, Calendar, MoreHorizontal, Edit2, Copy, Archive } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Campaign, CampaignStatus } from "@/types/umkm-dashboard.types";
import { DashboardBadge } from "../shared/DashboardBadge";
import { DashboardActionMenu } from "../shared/DashboardActionMenu";

interface CampaignCardProps {
  campaign: Campaign;
  pendingCount?: number;
  validCount?: number;
  disputeCount?: number;
  onDuplicate: () => void;
  onCancel: () => void;
  onExport: () => void;
  onEdit: () => void;
}

const STATUS_CONFIG: Record<CampaignStatus, { label: string; bg: string; color: string; border: string }> = {
  active: { label: "Aktif", bg: "#f1fbf5", color: "#177b42", border: "rgba(22,163,74,.22)" },
  draft: { label: "Draft", bg: "#f8fafc", color: "#687386", border: "rgba(148,163,184,.28)" },
  full: { label: "Penuh", bg: "#fff7ed", color: "#bd4b0b", border: "rgba(251,146,60,.24)" },
  completed: { label: "Selesai", bg: "#f0f6ff", color: "#2d5bd1", border: "rgba(96,165,250,.25)" },
  cancelled: { label: "Dibatalkan", bg: "#fff3f3", color: "#b4232a", border: "rgba(248,113,113,.24)" },
};

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

export function CampaignCard({
  campaign,
  pendingCount = 0,
  validCount = 0,
  disputeCount = 0,
  onDuplicate,
  onCancel,
  onExport,
  onEdit,
}: CampaignCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const statusCfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.active;
  const progressPercent = campaign.creatorQuota > 0 ? Math.min(100, Math.round((campaign.usedQuota / campaign.creatorQuota) * 100)) : 0;

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

  const isCancelDisabled = campaign.status === "completed" || campaign.status === "cancelled";
  const isEditVisible = campaign.status === "draft";

  const actionItems = [
    {
      label: "Lihat Detail",
      onClick: () => window.location.href = `/dashboard/umkm/campaign/${campaign.id}`,
    },
    ...(isEditVisible ? [{
      label: "Edit Draft",
      onClick: onEdit,
    }] : []),
    {
      label: "Duplikasi Campaign",
      onClick: onDuplicate,
    },
    {
      label: "Unduh Laporan",
      onClick: onExport,
    },
    ...(!isCancelDisabled ? [{
      label: "Batalkan Campaign",
      onClick: onCancel,
      danger: true,
    }] : []),
  ];

  return (
    <div
      style={{
        borderRadius: 24,
        border: "1px solid rgba(17,24,39,.08)",
        background: "linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,255,255,.88))",
        overflow: "visible",
        boxShadow: "0 8px 24px rgba(15,23,42,.06)",
        transition: ".24s cubic-bezier(.2,.8,.2,1)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
      className="group"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 18px 46px rgba(15,23,42,.10)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(249,115,22,.18)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(15,23,42,.06)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,24,39,.08)";
      }}
    >
      {/* Action Menu (Top Right overlaying cover art) */}
      <div className="absolute top-3 right-3 z-50">
        <DashboardActionMenu items={actionItems} />
      </div>

      {/* Cover art */}
      <div
        style={{
          height: 118,
          position: "relative",
          overflow: "hidden",
          background: coverGradient,
          borderTopLeftRadius: 23,
          borderTopRightRadius: 23,
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
        {/* Category */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 42, // shifted slightly left to accommodate context menu
            padding: "5px 10px",
            borderRadius: 999,
            background: "rgba(12,23,43,.36)",
            border: "1px solid rgba(255,255,255,.18)",
            color: "white",
            fontSize: ".7rem",
            fontWeight: 800,
            backdropFilter: "blur(10px)",
            textTransform: "capitalize",
          }}
        >
          {campaign.niche}
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
          <p className="text-xs text-text-muted line-clamp-2 min-w-0" style={{ margin: 0 }}>
            {campaign.brief}
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#737f91", fontSize: ".78rem", fontWeight: 700 }}>
            <Users size={13} />
            {campaign.usedQuota}/{campaign.creatorQuota} kreator
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#737f91", fontSize: ".78rem", fontWeight: 700 }}>
            <Eye size={13} />
            {formatViews(campaign.totalViews)} views
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#737f91", fontSize: ".78rem", fontWeight: 700 }}>
            <Calendar size={13} />
            {new Date(campaign.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          </div>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#737f91", fontSize: ".74rem", fontWeight: 760 }}>
            <span>Progress Kuota</span>
            <span style={{ color: "#182033", fontWeight: 800 }}>{progressPercent}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "#eef2f7", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                borderRadius: "inherit",
                background: progressPercent >= 100
                  ? "linear-gradient(90deg, #16a34a, #84cc16)"
                  : "linear-gradient(90deg, #f97316, #fbbf24)",
                transition: "width .6s cubic-bezier(.2,.8,.2,1)",
              }}
            />
          </div>
        </div>

        {/* Submissions summary */}
        <div className="flex flex-wrap gap-2 text-[10px] text-text-secondary border-t border-border-soft pt-3 justify-between items-center min-w-0">
          <span className="font-bold uppercase tracking-wider text-[9px] text-text-muted truncate">Submissions</span>
          <div className="flex gap-1.5 shrink-0">
            <DashboardBadge tone="amber" className="h-4.5 px-2 text-[9px] font-bold">
              {pendingCount} Pending
            </DashboardBadge>
            <DashboardBadge tone="green" className="h-4.5 px-2 text-[9px] font-bold">
              {validCount} Valid
            </DashboardBadge>
            {disputeCount > 0 && (
              <DashboardBadge tone="red" className="h-4.5 px-2 text-[9px] font-bold">
                {disputeCount} Sengketa
              </DashboardBadge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: "auto", paddingTop: 8 }}>
          <Link
            href={`/dashboard/umkm/campaign/${campaign.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 36,
              width: "100%",
              border: "none",
              borderRadius: 11,
              background: campaign.status === "draft" ? "rgba(12,23,43,.06)" : "linear-gradient(180deg, #fb7a18 0%, #ea580c 100%)",
              color: campaign.status === "draft" ? "#182033" : "white",
              fontSize: ".82rem",
              fontWeight: 800,
              boxShadow: campaign.status === "draft" ? "none" : "0 8px 20px rgba(234,88,12,.2)",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            {campaign.status === "draft" ? "Lanjutkan Draft" : "Lihat Detail"}
          </Link>
        </div>
      </div>
    </div>
  );
}
