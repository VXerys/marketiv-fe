"use client";

import { TrendingUp, Users, Eye, Wallet } from "lucide-react";

interface HeroOverviewProps {
  businessName?: string;
  campaignAktif?: number;
  totalViews?: string;
  totalKreator?: number;
  danaBerjalan?: string;
  isLoading?: boolean;
}

function SkeletonBlock({ width = "100%", height = 16 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 10,
        background: "rgba(255,255,255,.22)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent)",
          animation: "shimmer 1.45s infinite",
        }}
      />
    </div>
  );
}

export function HeroOverview({
  businessName = "Dapur Sehat",
  campaignAktif = 5,
  totalViews = "2.4jt",
  totalKreator = 28,
  danaBerjalan = "Rp 12.5jt",
  isLoading = false,
}: HeroOverviewProps) {
  const stats = [
    { icon: TrendingUp, label: "Campaign Aktif", value: String(campaignAktif), color: "#fff7ed", iconColor: "#ea580c" },
    { icon: Eye, label: "Total Views", value: totalViews, color: "#f0f6ff", iconColor: "#2563eb" },
    { icon: Users, label: "Total Kreator", value: String(totalKreator), color: "#f1fbf5", iconColor: "#16a34a" },
    { icon: Wallet, label: "Dana Berjalan", value: danaBerjalan, color: "#f7f3ff", iconColor: "#7c3aed" },
  ];

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 28,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 8% 12%, rgba(249,115,22,.24), transparent 26rem), radial-gradient(circle at 92% 86%, rgba(30,58,95,.16), transparent 22rem), linear-gradient(135deg, #0c172b 0%, #1e3a5f 46%, #182033 100%)",
        boxShadow: "0 32px 90px rgba(15,23,42,.22), 0 0 0 1px rgba(255,255,255,.06)",
      }}
    >
      {/* Grid overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.032) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)",
          pointerEvents: "none",
        }}
      />

      {/* Orange glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -60,
          left: -30,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(249,115,22,.16)",
          filter: "blur(72px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "clamp(20px, 3vw, 32px)",
        }}
      >
        {/* Top row: greeting + status badge */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            {isLoading ? (
              <div style={{ display: "grid", gap: 10 }}>
                <SkeletonBlock width={150} height={13} />
                <SkeletonBlock width={260} height={34} />
                <SkeletonBlock width={190} height={13} />
              </div>
            ) : (
              <>
                {/* Active pill */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    height: 28,
                    padding: "0 11px",
                    border: "1px solid rgba(249,115,22,.28)",
                    borderRadius: 999,
                    background: "rgba(249,115,22,.13)",
                    color: "#fdba74",
                    fontSize: ".72rem",
                    fontWeight: 800,
                    letterSpacing: ".04em",
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#f97316",
                      boxShadow: "0 0 0 3px rgba(249,115,22,.22)",
                      animation: "pulse 1.6s infinite",
                    }}
                  />
                  Dashboard Aktif
                </div>

                {/* Heading */}
                <h1
                  style={{
                    fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
                    fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: "-.06em",
                    color: "white",
                    margin: "0 0 8px",
                  }}
                >
                  Selamat datang,{" "}
                  <span style={{ color: "#fdba74" }}>{businessName}</span>
                </h1>

                <p style={{ margin: 0, color: "rgba(255,255,255,.55)", fontSize: ".85rem", fontWeight: 500 }}>
                  Ringkasan bisnis Anda hari ini — semua dalam satu tampilan.
                </p>
              </>
            )}
          </div>

          {/* Verified badge — hidden on very small screens */}
          <div
            className="hidden sm:block"
            style={{
              flexShrink: 0,
              padding: "10px 14px",
              borderRadius: 18,
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.11)",
              backdropFilter: "blur(12px)",
              textAlign: "right",
            }}
          >
            <div style={{ color: "rgba(255,255,255,.50)", fontSize: ".66rem", fontWeight: 750, marginBottom: 4 }}>
              Akun Status
            </div>
            <div style={{ color: "#4ade80", fontSize: ".8rem", fontWeight: 800 }}>● Terverifikasi</div>
          </div>
        </div>

        {/* Stats grid — auto-fit ensures responsiveness */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 10,
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: "14px",
                borderRadius: 18,
                background: "rgba(255,255,255,.07)",
                border: "1px solid rgba(255,255,255,.09)",
                backdropFilter: "blur(10px)",
                transition: ".2s cubic-bezier(.2,.8,.2,1)",
              }}
            >
              {isLoading ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <SkeletonBlock width={32} height={32} />
                  <SkeletonBlock width="65%" height={22} />
                  <SkeletonBlock width="50%" height={11} />
                </div>
              ) : (
                <>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 11,
                      background: stat.color,
                      display: "grid",
                      placeItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <stat.icon size={16} color={stat.iconColor} />
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sora), var(--font-plus-jakarta-sans), sans-serif",
                      fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: "-.055em",
                      color: "white",
                      marginBottom: 4,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ color: "rgba(255,255,255,.52)", fontSize: ".72rem", fontWeight: 700 }}>
                    {stat.label}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
