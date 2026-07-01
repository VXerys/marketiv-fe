"use client";

import { TrendingUp, Eye, Users, Star, ArrowUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";

const VIEWS_DATA = [
  { month: "Jan", views: 180000, kreator: 8 },
  { month: "Feb", views: 245000, kreator: 11 },
  { month: "Mar", views: 310000, kreator: 14 },
  { month: "Apr", views: 480000, kreator: 18 },
  { month: "Mei", views: 620000, kreator: 22 },
  { month: "Jun", views: 842000, kreator: 28 },
];

const TOP_CAMPAIGNS = [
  { name: "Brand Awareness — Bakso Pak Dedi", views: "1.1jt", roi: "+182%", color: "#f97316" },
  { name: "Promo Lebaran 2026", views: "1.8jt", roi: "+240%", color: "#16a34a" },
  { name: "Bakso Spesial Ramadan", views: "842rb", roi: "+156%", color: "#2563eb" },
  { name: "Kolaborasi Food Blogger Jakarta", views: "520rb", roi: "+98%", color: "#7c3aed" },
];

const formatViews = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${Math.round(v / 1000)}rb` : String(v);

interface AnalitikClientProps {
  businessName: string;
}

export function AnalitikClient({ businessName }: AnalitikClientProps) {
  return (
    <UmkmDashboardChrome businessName={businessName}>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#ea580c", fontSize: ".74rem", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>
            <span style={{ width: 18, height: 2, borderRadius: 999, background: "#f97316", display: "block" }} />
            Performa Bisnis
          </div>
          <h2 style={{ fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 700, letterSpacing: "-.06em", color: "#182033", margin: 0 }}>
            Analitik & Insight
          </h2>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
          {[
            { icon: Eye, label: "Total Views", value: "2.4jt", growth: "+38%", color: "#2563eb", bg: "#f0f6ff", border: "rgba(37,99,235,.18)" },
            { icon: Users, label: "Total Kreator", value: "28", growth: "+16%", color: "#16a34a", bg: "#f1fbf5", border: "rgba(22,163,74,.18)" },
            { icon: TrendingUp, label: "Rata-rata ROI", value: "+169%", growth: "+22%", color: "#ea580c", bg: "#fff7ed", border: "rgba(234,88,12,.18)" },
            { icon: Star, label: "Avg. Rating", value: "4.8", growth: "+0.2", color: "#d97706", bg: "#fffbeb", border: "rgba(217,119,6,.18)" },
          ].map((k) => (
            <div key={k.label} style={{ padding: "18px 20px", borderRadius: 22, background: `linear-gradient(180deg, ${k.bg}, #ffffff)`, border: `1px solid ${k.border}`, boxShadow: "0 6px 18px rgba(15,23,42,.05)", transition: ".22s cubic-bezier(.2,.8,.2,1)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 34px rgba(15,23,42,.09)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 18px rgba(15,23,42,.05)"; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 14, background: k.bg, border: `1px solid ${k.border}`, display: "grid", placeItems: "center", marginBottom: 14 }}>
                <k.icon size={17} color={k.color} />
              </div>
              <div style={{ color: "#737f91", fontSize: ".78rem", fontWeight: 760, marginBottom: 5 }}>{k.label}</div>
              <div style={{ fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-.06em", color: "#182033", marginBottom: 5 }}>{k.value}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#177b42", fontSize: ".74rem", fontWeight: 800, background: "#f1fbf5", border: "1px solid rgba(22,163,74,.20)", padding: "2px 8px", borderRadius: 999 }}>
                <ArrowUp size={11} /> {k.growth}
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="chart-grid">
          {/* Views chart */}
          <div style={{ padding: "22px", borderRadius: 24, background: "rgba(255,255,255,.92)", border: "1px solid rgba(17,24,39,.08)", boxShadow: "0 8px 24px rgba(15,23,42,.06)" }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-.04em", color: "#182033", margin: "0 0 4px" }}>Total Views per Bulan</h3>
              <span style={{ color: "#737f91", fontSize: ".78rem" }}>Januari – Juni 2026</span>
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={VIEWS_DATA} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#737f91", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatViews} tick={{ fontSize: 11, fill: "#737f91", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: unknown) => [formatViews(Number(v)), "Views"]} contentStyle={{ borderRadius: 16, border: "1px solid rgba(17,24,39,.10)", boxShadow: "0 12px 28px rgba(15,23,42,.10)", fontFamily: "var(--font-plus-jakarta-sans), sans-serif", fontSize: ".82rem" }} />
                  <Area type="monotone" dataKey="views" stroke="#f97316" strokeWidth={2.5} fill="url(#viewsGrad)" dot={{ fill: "#f97316", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Kreator chart */}
          <div style={{ padding: "22px", borderRadius: 24, background: "rgba(255,255,255,.92)", border: "1px solid rgba(17,24,39,.08)", boxShadow: "0 8px 24px rgba(15,23,42,.06)" }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-.04em", color: "#182033", margin: "0 0 4px" }}>Kreator Bergabung</h3>
              <span style={{ color: "#737f91", fontSize: ".78rem" }}>Akumulasi per bulan</span>
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={VIEWS_DATA} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#737f91", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#737f91", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(17,24,39,.10)", boxShadow: "0 12px 28px rgba(15,23,42,.10)", fontFamily: "var(--font-plus-jakarta-sans), sans-serif", fontSize: ".82rem" }} />
                  <Bar dataKey="kreator" fill="#1e3a5f" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top campaigns */}
        <div style={{ padding: "22px", borderRadius: 24, background: "rgba(255,255,255,.92)", border: "1px solid rgba(17,24,39,.08)", boxShadow: "0 8px 24px rgba(15,23,42,.06)" }}>
          <h3 style={{ fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-.04em", color: "#182033", margin: "0 0 18px" }}>Campaign Terbaik</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {TOP_CAMPAIGNS.map((c, i) => (
              <div key={c.name} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto auto", gap: 14, alignItems: "center", padding: "13px 16px", borderRadius: 16, background: "#f8fafc", border: "1px solid rgba(17,24,39,.06)" }}>
                <span style={{ width: 28, height: 28, borderRadius: 10, display: "grid", placeItems: "center", background: `${c.color}18`, color: c.color, fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: ".8rem", fontWeight: 800 }}>{i + 1}</span>
                <strong style={{ fontSize: ".86rem", letterSpacing: "-.018em", color: "#182033" }}>{c.name}</strong>
                <span style={{ color: "#737f91", fontSize: ".82rem", fontWeight: 700, whiteSpace: "nowrap" }}>{c.views} views</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, minHeight: 24, padding: "0 9px", borderRadius: 999, background: "#f1fbf5", border: "1px solid rgba(22,163,74,.20)", color: "#177b42", fontSize: ".74rem", fontWeight: 800, whiteSpace: "nowrap" }}>
                  <ArrowUp size={10} /> {c.roi}
                </span>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @media (min-width: 900px) {
            .chart-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>
      </div>
    </UmkmDashboardChrome>
  );
}
