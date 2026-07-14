"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, MapPin, Users, Package, MessageCircle, CheckCircle2 } from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";
import type { Creator } from "@/types/campaign";

interface CreatorCardProps {
  creator: Creator;
}

const CATEGORY_COVER: Record<string, { from: string; to: string; mid: string }> = {
  kuliner:    { from: "#fb923c", mid: "#ea580c", to: "#c2410c" },
  fashion:    { from: "#a78bfa", mid: "#7c3aed", to: "#5b21b6" },
  pariwisata: { from: "#60a5fa", mid: "#2563eb", to: "#1e3a5f" },
  edukasi:    { from: "#4ade80", mid: "#16a34a", to: "#15803d" },
  kecantikan: { from: "#f9a8d4", mid: "#db2777", to: "#be185d" },
  teknologi:  { from: "#7dd3fc", mid: "#0284c7", to: "#075985" },
  kosmetik:   { from: "#f9a8d4", mid: "#db2777", to: "#be185d" },
  lainnya:    { from: "#818cf8", mid: "#4f46e5", to: "#3730a3" },
};

const AVATAR_GRADIENTS: Record<string, string> = {
  kuliner:    "linear-gradient(135deg,#fed7aa,#fb923c)",
  fashion:    "linear-gradient(135deg,#c4b5fd,#7c3aed)",
  pariwisata: "linear-gradient(135deg,#93c5fd,#1e3a5f)",
  edukasi:    "linear-gradient(135deg,#a3e635,#16a34a)",
  kecantikan: "linear-gradient(135deg,#fda4af,#be185d)",
  teknologi:  "linear-gradient(135deg,#7dd3fc,#0284c7)",
  kosmetik:   "linear-gradient(135deg,#fda4af,#be185d)",
  lainnya:    "linear-gradient(135deg,#a5b4fc,#4f46e5)",
};

export function CreatorCard({ creator }: CreatorCardProps) {
  const router = useRouter();

  const key = creator.category.toLowerCase();
  const cover = CATEGORY_COVER[key] ?? CATEGORY_COVER.lainnya;
  const avatarGradient = AVATAR_GRADIENTS[key] ?? AVATAR_GRADIENTS.lainnya;
  const handle = `@${creator.name.toLowerCase().replace(/\s+/g, "")}`;

  return (
    <article
      className="hover-card-animate group select-none flex flex-col min-w-0"
      style={{
        borderRadius: 24,
        border: "1px solid rgba(17,24,39,.08)",
        background: "white",
        boxShadow: "0 4px 16px rgba(15,23,42,.06)",
        overflow: "hidden",
      }}
    >
      {/* ── Cover strip ── */}
      <div
        aria-hidden="true"
        style={{
          position: "relative",
          height: 125,
          background: `linear-gradient(135deg,${cover.from} 0%,${cover.mid} 55%,${cover.to} 100%)`,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Gloss overlay */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 20%, rgba(255,255,255,.18), transparent 70%)" }} />

        {/* Category badge — TOP LEFT (above avatar overlap zone) */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "4px 9px",
            borderRadius: 8,
            background: "rgba(255,255,255,.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,.30)",
            fontSize: ".65rem",
            fontWeight: 870,
            color: "white",
            textTransform: "uppercase",
            letterSpacing: ".1em",
            lineHeight: 1,
          }}
        >
          {creator.category}
        </div>

        {/* Rating pill — TOP RIGHT */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 9px",
            borderRadius: 8,
            background: "rgba(255,255,255,.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,.30)",
            fontSize: ".75rem",
            fontWeight: 870,
            color: "white",
            lineHeight: 1,
          }}
        >
          <Star size={11} fill="white" color="white" />
          {creator.rating.toFixed(1)}
        </div>
      </div>

      {/* ── Avatar row — overlaps cover by 38px ── */}
      <div
        style={{
          position: "relative",
          marginTop: -38,
          padding: "0 14px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        {/* Avatar with optional verified dot */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Avatar.Root
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 76,
              height: 76,
              borderRadius: 22,
              border: "4px solid white",
              boxShadow: "0 6px 18px rgba(15,23,42,.15)",
              overflow: "hidden",
              background: "#f3f4f6",
            }}
          >
            <Avatar.Image
              src={creator.imageUrl}
              alt={creator.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <Avatar.Fallback
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.05rem",
                color: "white",
                background: avatarGradient,
              }}
            >
              {creator.name.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>

          {/* Verified check — overlaid on avatar bottom-right */}
          {creator.isVerified && (
            <div
              title="Kreator Terverifikasi"
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "2px solid white",
                background: "#2563eb",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              <CheckCircle2 size={13} color="white" fill="#2563eb" strokeWidth={0} />
            </div>
          )}
        </div>

        {/* Review count chip */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 10px",
            borderRadius: 10,
            background: "#fffbeb",
            border: "1px solid rgba(217,119,6,.16)",
            fontSize: ".7rem",
            fontWeight: 800,
            color: "#92400e",
            marginBottom: 2,
            lineHeight: 1,
          }}
        >
          <Star size={10} color="#d97706" fill="#d97706" />
          {creator.totalReviews} ulasan
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1" style={{ padding: "0 14px 14px", gap: 11 }}>

        {/* Name + handle + location */}
        <div>
          <h3
            style={{
              margin: "0 0 4px",
              fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
              fontSize: "1.05rem",
              fontWeight: 800,
              letterSpacing: "-.045em",
              color: "#182033",
              lineHeight: 1.15,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {creator.name}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: ".76rem", fontWeight: 650, color: "#9ca8b8", letterSpacing: "-.01em" }}>
              {handle}
            </span>
            {creator.location && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: ".72rem",
                  fontWeight: 640,
                  color: "#9ca8b8",
                }}
              >
                <MapPin size={10} />
                {creator.location}
              </span>
            )}
          </div>
        </div>

        {/* Stats row — followers + packages */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {[
            { label: "Followers", value: creator.followers, Icon: Users, color: "#ea580c", border: "rgba(234,88,12,.08)", iconBg: "rgba(234,88,12,.08)" },
            { label: "Paket Jasa", value: String(creator.rateCardCount ?? 1), Icon: Package, color: "#2563eb", border: "rgba(37,99,235,.08)", iconBg: "rgba(37,99,235,.08)" },
          ].map(({ label, value, Icon, color, border, iconBg }) => (
            <div
              key={label}
              style={{
                padding: "12px 14px",
                borderRadius: 16,
                background: label === "Followers"
                  ? "linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)"
                  : "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)",
                border: `1px solid ${border}`,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.01)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: iconBg,
                  }}
                >
                  <Icon size={11} color={color} />
                </div>
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    color,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {label}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-sora), sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 850,
                  color: "#0f172a",
                  letterSpacing: "-.02em",
                  lineHeight: 1.1,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Offer box — pushed to bottom */}
        <div
          style={{
            marginTop: "auto",
            padding: "14px 16px",
            borderRadius: 18,
            border: "1px solid rgba(234, 88, 12, 0.12)",
            background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)",
            boxShadow: "0 4px 14px rgba(234, 88, 12, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div>
            <span
              style={{
                display: "block",
                fontSize: "0.62rem",
                fontWeight: 800,
                color: "#f97316",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 2,
              }}
            >
              Estimasi Biaya Jasa
            </span>
            <strong
              style={{
                display: "block",
                fontFamily: "var(--font-sora), sans-serif",
                fontSize: "1.28rem",
                fontWeight: 900,
                color: "#ea580c",
                letterSpacing: "-.03em",
                lineHeight: 1,
              }}
            >
              {creator.estimatedSalary}
            </strong>
          </div>
          <span
            style={{
              display: "-webkit-box",
              fontSize: ".75rem",
              fontWeight: 550,
              color: "#475569",
              lineHeight: 1.45,
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {creator.description}
          </span>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={`/dashboard/umkm/kreator/${creator.id}`}
            className="transition-all duration-150 hover:-translate-y-px hover:shadow-2xs active:scale-[0.98] active:translate-y-0 hover:bg-ink-900/[.07] cursor-pointer"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 44,
              borderRadius: 14,
              border: "1px solid rgba(17,24,39,.1)",
              background: "rgba(17,24,39,.042)",
              color: "#182033",
              fontSize: ".83rem",
              fontWeight: 820,
              textDecoration: "none",
              letterSpacing: "-.02em",
            }}
          >
            Lihat Profil
          </Link>
          <button
            type="button"
            aria-label="Mulai negosiasi"
            onClick={() => router.push("/dashboard/umkm/negosiasi")}
            className="transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(234,88,12,.32)] active:scale-[0.96] active:translate-y-0 cursor-pointer"
            style={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 14,
              border: "1px solid rgba(194,65,12,.2)",
              background: "linear-gradient(180deg,#fb7a18,#ea580c)",
              color: "white",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 4px 14px rgba(234,88,12,.22)",
            }}
          >
            <MessageCircle size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
