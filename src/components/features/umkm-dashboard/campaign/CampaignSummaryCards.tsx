import { Megaphone, TrendingUp, CheckCircle, Eye, Clock, Shield } from "lucide-react";
import type { UmkmDashboardSummary } from "@/types/umkm-dashboard.types";

interface SummaryCardProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  note: string;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
}

function SummaryCard({ icon: Icon, label, value, note, iconBg, iconColor, iconBorder }: SummaryCardProps) {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRadius: 22,
        border: "1px solid rgba(17,24,39,.08)",
        background:
          "radial-gradient(circle at 100% 0%, rgba(249,115,22,.06), transparent 10rem), linear-gradient(180deg, #ffffff, #fffdf9)",
        boxShadow: "0 6px 22px rgba(15,23,42,.06)",
        transition: ".22s cubic-bezier(.2,.8,.2,1)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 36px rgba(15,23,42,.10)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(249,115,22,.16)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 22px rgba(15,23,42,.06)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,24,39,.08)";
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 17,
            display: "grid",
            placeItems: "center",
            background: iconBg,
            border: `1px solid ${iconBorder}`,
            boxShadow: "0 6px 16px rgba(15,23,42,.06)",
          }}
        >
          <Icon size={20} color={iconColor} />
        </div>
      </div>
      <div style={{ color: "#737f91", fontSize: ".8rem", fontWeight: 760, marginBottom: 6 }}>{label}</div>
      <div
        style={{
          fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
          fontSize: "1.9rem",
          fontWeight: 700,
          lineHeight: 0.95,
          letterSpacing: "-.075em",
          color: "#182033",
          marginBottom: 7,
        }}
      >
        {value}
      </div>
      <div style={{ color: "#a0aaba", fontSize: ".76rem", fontWeight: 700 }}>{note}</div>
    </div>
  );
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return String(n);
}

interface CampaignSummaryCardsProps {
  summary: UmkmDashboardSummary;
}

export function CampaignSummaryCards({ summary }: CampaignSummaryCardsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 14,
        marginBottom: 28,
      }}
    >
      <SummaryCard
        icon={Megaphone}
        label="Total Campaign"
        value={String(summary.activeCampaigns + summary.completedCampaigns + (summary.pendingPayments ?? 0))}
        note="Semua status"
        iconBg="#fff7ed"
        iconColor="#ea580c"
        iconBorder="rgba(234,88,12,.18)"
      />
      <SummaryCard
        icon={TrendingUp}
        label="Campaign Aktif"
        value={String(summary.activeCampaigns)}
        note="Sedang berjalan"
        iconBg="#f1fbf5"
        iconColor="#16a34a"
        iconBorder="rgba(22,163,74,.18)"
      />
      <SummaryCard
        icon={CheckCircle}
        label="Campaign Selesai"
        value={String(summary.completedCampaigns)}
        note="Berhasil diselesaikan"
        iconBg="#f0f6ff"
        iconColor="#2563eb"
        iconBorder="rgba(37,99,235,.18)"
      />
      <SummaryCard
        icon={Eye}
        label="Total Views"
        value={formatViews(summary.totalViews)}
        note="Dari semua campaign"
        iconBg="#f7f3ff"
        iconColor="#7c3aed"
        iconBorder="rgba(124,58,237,.18)"
      />
      <SummaryCard
        icon={Clock}
        label="Submission Pending"
        value={String(summary.pendingSubmissions)}
        note="Perlu validasi"
        iconBg="#fffbeb"
        iconColor="#d97706"
        iconBorder="rgba(217,119,6,.18)"
      />
      <SummaryCard
        icon={Shield}
        label="Budget Escrow"
        value={`Rp ${(summary.escrowBalance / 1_000_000).toFixed(1)}jt`}
        note="Dana terjamin"
        iconBg="#f1fbf5"
        iconColor="#16a34a"
        iconBorder="rgba(22,163,74,.18)"
      />
    </div>
  );
}
