"use client";

import Link from "next/link";
import { Star, Users, TrendingUp, MapPin, MessageCircle } from "lucide-react";
import type { Creator } from "@/types/campaign";

interface CreatorCardProps {
  creator: Creator;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  // Map niches to gradients for avatars
  const avatarGradients: Record<string, string> = {
    kuliner: "linear-gradient(135deg, #fed7aa, #fb923c)",
    fesyen: "linear-gradient(135deg, #a78bfa, #6d28d9)",
    pariwisata: "linear-gradient(135deg, #93c5fd, #1e3a5f)",
    edukasi: "linear-gradient(135deg, #a3e635, #16a34a)",
    kecantikan: "linear-gradient(135deg, #f9a8d4, #be185d)",
    lainnya: "linear-gradient(135deg, #818cf8, #4f46e5)",
  };

  const categoryLower = creator.category.toLowerCase();
  const avatarGradient = avatarGradients[categoryLower] || avatarGradients.kuliner;

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: 24,
        border: "1px solid rgba(17,24,39,.08)",
        background: "linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,253,248,.88))",
        boxShadow: "0 8px 24px rgba(15,23,42,.06)",
        display: "grid",
        gap: 16,
        transition: ".24s cubic-bezier(.2,.8,.2,1)",
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
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 20,
            flexShrink: 0,
            background: avatarGradient,
            boxShadow: "0 10px 24px rgba(249,115,22,.14)",
            backgroundImage: creator.imageUrl ? `url(${creator.imageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div style={{ minWidth: 0 }}>
          <strong style={{ display: "block", fontSize: ".94rem", letterSpacing: "-.025em", color: "#182033" }}>
            {creator.name}
          </strong>
          <span style={{ display: "block", color: "#737f91", fontSize: ".78rem", fontWeight: 650, marginTop: 2 }}>
            @{creator.name.toLowerCase().replace(/\s+/g, "")}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                minHeight: 22,
                padding: "0 8px",
                borderRadius: 999,
                background: "#fff7ed",
                border: "1px solid rgba(249,115,22,.18)",
                color: "#ea580c",
                fontSize: ".68rem",
                fontWeight: 800,
                textTransform: "capitalize",
              }}
            >
              {creator.category}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#d97706", fontSize: ".76rem", fontWeight: 800 }}>
              <Star size={11} fill="#d97706" strokeWidth={0} /> {creator.rating}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9 }}>
        {[
          { icon: Users, label: "Followers", val: creator.followers },
          { icon: TrendingUp, label: "Engagement", val: "6.2%" }, // Simulated engagement
          { icon: MapPin, label: "Lokasi", val: "Jakarta" }, // Simulated location
        ].map(({ icon: Icon, label, val }) => (
          <div key={label} style={{ padding: "10px", borderRadius: 14, background: "#f8fafc", border: "1px solid rgba(17,24,39,.06)" }}>
            <Icon size={12} color="#737f91" />
            <div style={{ marginTop: 5, fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: ".86rem", fontWeight: 700, letterSpacing: "-.025em", color: "#182033" }}>{val}</div>
            <div style={{ color: "#a0aaba", fontSize: ".68rem", fontWeight: 700, marginTop: 1 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
        <Link
          href={`/dashboard/umkm/kreator/${creator.id}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 40,
            borderRadius: 13,
            border: "1px solid rgba(194,65,12,.22)",
            background: "linear-gradient(180deg, #fb7a18, #ea580c)",
            color: "white",
            fontWeight: 790,
            fontSize: ".84rem",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(234,88,12,.20)",
            textDecoration: "none",
          }}
        >
          Lihat Profil
        </Link>
        <button
          onClick={() => window.location.href = `/dashboard/umkm/negosiasi`}
          style={{
            width: 40,
            height: 40,
            borderRadius: 13,
            border: "1px solid rgba(17,24,39,.09)",
            background: "white",
            color: "#556174",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <MessageCircle size={16} />
        </button>
      </div>
    </div>
  );
}
