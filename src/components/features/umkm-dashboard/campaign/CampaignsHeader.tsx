import Link from "next/link";
import { Plus, Download } from "lucide-react";

interface CampaignsHeaderProps {
  onCreateCampaignClick: () => void;
  onExportReportClick: () => void;
}

export function CampaignsHeader({
  onCreateCampaignClick,
  onExportReportClick,
}: CampaignsHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      {/* Title */}
      <div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#ea580c",
            fontSize: ".74rem",
            fontWeight: 900,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            marginBottom: 7,
          }}
        >
          <span style={{ width: 18, height: 2, borderRadius: 999, background: "#f97316", display: "block" }} />
          Manajemen Campaign
        </div>
        <h2
          style={{
            fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
            fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)",
            fontWeight: 700,
            letterSpacing: "-.065em",
            color: "#182033",
            margin: "0 0 6px",
            lineHeight: 1,
          }}
        >
          Campaign Saya
        </h2>
        <p style={{ color: "#737f91", fontSize: ".88rem", margin: 0 }}>
          Kelola seluruh campaign UMKM Anda dari satu tempat.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
        <button
          onClick={onExportReportClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            minHeight: 42,
            padding: "0 16px",
            borderRadius: 12,
            border: "1px solid rgba(17,24,39,.09)",
            background: "rgba(255,255,255,.82)",
            color: "#556174",
            fontSize: ".84rem",
            fontWeight: 760,
            boxShadow: "0 6px 18px rgba(15,23,42,.05)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <Download size={15} />
          Export Laporan
        </button>
        <Link
          href="/dashboard/umkm/campaign/buat"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            minHeight: 46,
            padding: "0 22px",
            borderRadius: 12,
            border: "1px solid rgba(194,65,12,.22)",
            background: "linear-gradient(180deg, #fb7a18 0%, #ea580c 100%)",
            color: "white",
            fontWeight: 800,
            fontSize: ".9rem",
            letterSpacing: "-.012em",
            boxShadow: "0 14px 34px rgba(234,88,12,.22), inset 0 1px 0 rgba(255,255,255,.22)",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
            textDecoration: "none",
          }}
          onClick={onCreateCampaignClick}
        >
          <Plus size={17} />
          Buat Campaign Baru
        </Link>
      </div>
    </div>
  );
}
