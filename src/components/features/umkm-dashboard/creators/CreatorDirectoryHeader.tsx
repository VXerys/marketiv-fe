"use client";

import Link from "next/link";
import { MessageCircle, ChevronRight } from "lucide-react";

export function CreatorDirectoryHeader() {
  return (
    <div>
      {/* Orange accent kicker */}
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
          marginBottom: 8,
        }}
      >
        <span style={{ display: "block", width: 14, height: 2, borderRadius: 999, background: "#f97316" }} />
        Direktori Kreator
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight: 700,
              letterSpacing: "-.07em",
              lineHeight: 1,
              color: "#182033",
              margin: "0 0 8px",
            }}
          >
            Temukan Kreator Terbaik
          </h1>
          <p
            style={{
              margin: 0,
              color: "#737f91",
              fontSize: ".9rem",
              fontWeight: 500,
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            Kreator mikro yang siap mempromosikan bisnis UMKM Anda ke audiens yang tepat.
          </p>
        </div>

        <Link
          href="/dashboard/umkm/negosiasi"
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            minHeight: 38,
            padding: "0 14px",
            borderRadius: 12,
            border: "1px solid rgba(17,24,39,.09)",
            background: "rgba(255,255,255,.82)",
            color: "#556174",
            fontSize: ".8rem",
            fontWeight: 760,
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(15,23,42,.05)",
            whiteSpace: "nowrap",
            transition: "transform .2s ease, box-shadow .2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 16px rgba(15,23,42,.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(15,23,42,.05)";
          }}
        >
          <MessageCircle size={14} color="#ea580c" />
          <span>Lihat Negosiasi Aktif</span>
          <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}
