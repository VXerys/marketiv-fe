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
  { name: "Promo Lebaran 2026",               views: "1.8jt", roi: "+240%", color: "#16a34a" },
  { name: "Bakso Spesial Ramadan",             views: "842rb", roi: "+156%", color: "#2563eb" },
  { name: "Kolaborasi Food Blogger Jakarta",   views: "520rb", roi: "+98%",  color: "#7c3aed" },
];

const KPI_CARDS = [
  { icon: Eye,       label: "Total Views",  value: "2.4jt",  growth: "+38%",  iconBg: "#f0f6ff", iconColor: "#2563eb", iconBorder: "rgba(37,99,235,.18)"  },
  { icon: Users,     label: "Total Kreator", value: "28",     growth: "+16%",  iconBg: "#f1fbf5", iconColor: "#16a34a", iconBorder: "rgba(22,163,74,.18)"  },
  { icon: TrendingUp, label: "Rata-rata ROI", value: "+169%", growth: "+22%", iconBg: "#fff7ed", iconColor: "#ea580c", iconBorder: "rgba(234,88,12,.18)"  },
  { icon: Star,      label: "Avg. Rating",  value: "4.8",    growth: "+0.2",  iconBg: "#fffbeb", iconColor: "#d97706", iconBorder: "rgba(217,119,6,.18)"  },
];

const formatViews = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt` : v >= 1_000 ? `${Math.round(v / 1_000)}rb` : String(v);

const TOOLTIP_STYLE = {
  borderRadius: 16,
  border: "1px solid rgba(17,24,39,.10)",
  boxShadow: "0 12px 28px rgba(15,23,42,.10)",
  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
  fontSize: ".82rem",
};

const AXIS_TICK = { fontSize: 12, fill: "#737f91", fontWeight: 700 } as const;
const Y_AXIS_TICK = { fontSize: 11, fill: "#737f91", fontWeight: 700 } as const;

interface AnalitikClientProps {
  businessName: string;
}

export function AnalitikClient({ businessName }: AnalitikClientProps) {
  return (
    <UmkmDashboardChrome businessName={businessName}>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 text-orange-600 text-[.74rem] font-[900] tracking-[.12em] uppercase mb-1.5">
            <span className="w-[18px] h-0.5 rounded-full bg-orange-500 block shrink-0" />
            Performa Bisnis
          </div>
          <h2 className="text-[clamp(1.4rem,2.5vw,2rem)] font-[700] tracking-[-0.06em] text-ink-900 m-0 font-display">
            Analitik &amp; Insight
          </h2>
        </div>

        {/* KPI row — .metric-card handles hover via CSS */}
        <div className="dashboard-rule-grid">
          {KPI_CARDS.map((k) => (
            <div key={k.label} className="metric-card">
              <div className="metric-top">
                <div
                  className="metric-icon"
                  style={{ background: k.iconBg, borderColor: k.iconBorder, color: k.iconColor }}
                >
                  <k.icon size={17} />
                </div>
              </div>
              <div className="metric-label">{k.label}</div>
              <div className="metric-value">{k.value}</div>
              <div className="metric-note">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200/60 text-green-700 text-[.74rem] font-[800]">
                  <ArrowUp size={11} /> {k.growth}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts — .chart-grid handles 1→2 col at lg */}
        <div className="chart-grid">
          {/* Views AreaChart */}
          <div className="chart-card-container">
            <div className="mb-5">
              <h3 className="text-[1.05rem] font-[700] tracking-[-0.04em] text-ink-900 m-0 mb-1 font-display">
                Total Views per Bulan
              </h3>
              <span className="text-[.78rem] text-ink-500">Januari – Juni 2026</span>
            </div>
            <div className="chart-inner">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={VIEWS_DATA} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f97316" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,.06)" />
                  <XAxis dataKey="month" tick={AXIS_TICK}   axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatViews} tick={Y_AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: unknown) => [formatViews(Number(v)), "Views"]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fill="url(#viewsGrad)"
                    dot={{ fill: "#f97316", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Kreator BarChart */}
          <div className="chart-card-container">
            <div className="mb-5">
              <h3 className="text-[1.05rem] font-[700] tracking-[-0.04em] text-ink-900 m-0 mb-1 font-display">
                Kreator Bergabung
              </h3>
              <span className="text-[.78rem] text-ink-500">Akumulasi per bulan</span>
            </div>
            <div className="chart-inner">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={VIEWS_DATA} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,.06)" />
                  <XAxis dataKey="month" tick={AXIS_TICK}   axisLine={false} tickLine={false} />
                  <YAxis                 tick={Y_AXIS_TICK}  axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="kreator" fill="#1e3a5f" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top campaigns */}
        <div className="chart-card-container">
          <h3 className="text-[1.05rem] font-[700] tracking-[-0.04em] text-ink-900 mb-4 font-display">
            Campaign Terbaik
          </h3>
          <div className="grid gap-2.5">
            {TOP_CAMPAIGNS.map((c, i) => (
              <div
                key={c.name}
                className="grid items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-ink-100/60 border border-ink-900/[.06]"
                style={{ gridTemplateColumns: "28px 1fr auto auto" }}
              >
                <span
                  className="w-7 h-7 rounded-[10px] grid place-items-center text-[.8rem] font-[800] font-display shrink-0"
                  style={{ background: `${c.color}18`, color: c.color }}
                >
                  {i + 1}
                </span>
                <strong className="text-[.86rem] tracking-tight text-ink-900 truncate min-w-0">
                  {c.name}
                </strong>
                <span className="text-[.82rem] font-[700] text-ink-500 whitespace-nowrap">{c.views} views</span>
                <span className="inline-flex items-center gap-1 min-h-[24px] px-2 rounded-full bg-green-50 border border-green-200/60 text-green-700 text-[.74rem] font-[800] whitespace-nowrap">
                  <ArrowUp size={10} /> {c.roi}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </UmkmDashboardChrome>
  );
}
