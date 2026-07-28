"use client";

import { TrendingUp, Eye, Users, Star, ArrowUp, Download, BarChart2, ChevronDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";

const VIEWS_DATA = [
  { month: "Jan", views: 180000, kreator: 8  },
  { month: "Feb", views: 245000, kreator: 11 },
  { month: "Mar", views: 310000, kreator: 14 },
  { month: "Apr", views: 480000, kreator: 18 },
  { month: "Mei", views: 620000, kreator: 22 },
  { month: "Jun", views: 842000, kreator: 28 },
];

const TOP_CAMPAIGNS = [
  { name: "Brand Awareness — Bakso Pak Dedi",  views: "1.1jt", roi: "+182%", color: "#f97316" },
  { name: "Promo Lebaran 2026",                views: "1.8jt", roi: "+240%", color: "#16a34a" },
  { name: "Bakso Spesial Ramadan",             views: "842rb", roi: "+156%", color: "#2563eb" },
  { name: "Kolaborasi Food Blogger Jakarta",   views: "520rb", roi: "+98%",  color: "#7c3aed" },
];

const KPI_CARDS = [
  { icon: Eye,        label: "Total Views",   value: "2.4jt",  growth: "+38%",  sub: "vs. bulan lalu",  iconBg: "#f0f6ff", iconColor: "#2563eb", iconBorder: "rgba(37,99,235,.18)"  },
  { icon: Users,      label: "Total Kreator", value: "28",     growth: "+16%",  sub: "aktif bulan ini", iconBg: "#f1fbf5", iconColor: "#16a34a", iconBorder: "rgba(22,163,74,.18)"  },
  { icon: TrendingUp, label: "Rata-rata ROI", value: "+169%",  growth: "+22%",  sub: "semua campaign",  iconBg: "#fff7ed", iconColor: "#ea580c", iconBorder: "rgba(234,88,12,.18)"  },
  { icon: Star,       label: "Avg. Rating",   value: "4.8",    growth: "+0.2",  sub: "dari kreator",    iconBg: "#fffbeb", iconColor: "#d97706", iconBorder: "rgba(217,119,6,.18)"  },
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

const AXIS_TICK   = { fontSize: 12, fill: "#737f91", fontWeight: 700 } as const;
const Y_AXIS_TICK = { fontSize: 11, fill: "#737f91", fontWeight: 700 } as const;

export function AnalitikClient() {
  return (
    <UmkmDashboardChrome>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-[1280px] mx-auto space-y-6 pb-8">

          {/* ── Header ─────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 text-orange-600 text-[.74rem] font-[900] tracking-[.12em] uppercase mb-1.5">
                <span className="block w-[18px] h-0.5 rounded-full bg-orange-500 shrink-0" />
                Performa Bisnis
              </div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h2 className="font-display text-[clamp(1.5rem,2.8vw,2.1rem)] font-bold tracking-[-0.065em] text-ink-950 m-0 leading-none">
                  Analitik &amp; Insight
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 text-[.7rem] font-[800] tracking-tight uppercase">
                  Segera Hadir
                </span>
              </div>
              <p className="text-ink-500 text-[.88rem] m-0">
                Data di bawah masih ilustrasi. Analitik nyata akan aktif setelah pipeline data campaign siap.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
              {/* Period selector */}
              <div className="relative inline-flex items-center">
                <select
                  disabled
                  aria-disabled="true"
                  title="Segera hadir"
                  className="appearance-none min-h-[40px] pl-3.5 pr-9 rounded-xl border border-neutral-200/80 bg-neutral-50 text-ink-400 text-[.84rem] font-[700] shadow-3xs cursor-not-allowed opacity-70 focus:outline-none"
                >
                  <option>6 Bulan Terakhir</option>
                  <option>3 Bulan Terakhir</option>
                  <option>Tahun Ini</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 pointer-events-none text-neutral-300" />
              </div>

              {/* Export CTA — dinonaktifkan sampai analitik nyata siap */}
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Segera hadir"
                className="inline-flex items-center gap-2 min-h-[46px] px-[22px] rounded-xl border border-neutral-200/80 bg-neutral-100 text-ink-400 font-[800] text-[.9rem] tracking-[-0.012em] cursor-not-allowed opacity-70 whitespace-nowrap"
              >
                <Download size={17} />
                Export Laporan
              </button>
            </div>
          </div>

          {/* ── KPI Summary Cards ───────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {KPI_CARDS.map((k) => (
              <div
                key={k.label}
                className="p-3.5 sm:p-4.5 border border-neutral-200/80 rounded-2xl sm:rounded-[22px] bg-white shadow-3xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[14px] grid place-items-center mb-3 border shrink-0"
                  style={{ background: k.iconBg, borderColor: k.iconBorder, color: k.iconColor }}
                >
                  <k.icon size={17} />
                </div>
                <div className="text-[.74rem] sm:text-[.78rem] text-ink-500 font-[600] mb-1 tracking-tight">
                  {k.label}
                </div>
                <div className="font-display text-[1.35rem] sm:text-[1.6rem] font-black tracking-tight text-ink-950 leading-none mb-2">
                  {k.value}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-50 border border-green-200/60 text-green-700 text-[.72rem] font-[800]">
                    <ArrowUp size={10} /> {k.growth}
                  </span>
                  <span className="text-[.72rem] text-ink-400 font-[500]">{k.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Charts Grid ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

            {/* Views Area Chart */}
            <div className="border border-neutral-200/80 rounded-2xl sm:rounded-[22px] bg-white shadow-3xs p-5 sm:p-6">
              <div className="flex items-start justify-between gap-2 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-6 h-6 rounded-lg grid place-items-center bg-orange-50 border border-orange-200/40 text-orange-500 shrink-0">
                      <BarChart2 size={13} />
                    </div>
                    <h3 className="font-display text-[.95rem] font-black tracking-tight text-ink-950 m-0">
                      Total Views per Bulan
                    </h3>
                  </div>
                  <span className="text-[.74rem] text-ink-400 font-[500] ml-8">Januari – Juni 2026</span>
                </div>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200/40 text-orange-600 text-[.72rem] font-[800] shrink-0">
                  <ArrowUp size={10} /> 368%
                </span>
              </div>
              <div className="h-[200px] sm:h-[220px]">
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

            {/* Kreator Bar Chart */}
            <div className="border border-neutral-200/80 rounded-2xl sm:rounded-[22px] bg-white shadow-3xs p-5 sm:p-6">
              <div className="flex items-start justify-between gap-2 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-6 h-6 rounded-lg grid place-items-center bg-blue-50 border border-blue-200/40 text-blue-500 shrink-0">
                      <Users size={13} />
                    </div>
                    <h3 className="font-display text-[.95rem] font-black tracking-tight text-ink-950 m-0">
                      Kreator Bergabung
                    </h3>
                  </div>
                  <span className="text-[.74rem] text-ink-400 font-[500] ml-8">Akumulasi per bulan</span>
                </div>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/40 text-blue-600 text-[.72rem] font-[800] shrink-0">
                  <ArrowUp size={10} /> +20 kreator
                </span>
              </div>
              <div className="h-[200px] sm:h-[220px]">
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

          {/* ── Top Campaigns ───────────────────────────────────── */}
          <div className="border border-neutral-200/80 rounded-2xl sm:rounded-[22px] bg-white shadow-3xs p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[10px] grid place-items-center bg-amber-50 border border-amber-200/50 text-amber-500 shrink-0">
                  <Star size={14} />
                </div>
                <h3 className="font-display text-[.95rem] font-black tracking-tight text-ink-950 m-0">
                  Campaign Terbaik
                </h3>
              </div>
              <span className="text-[.74rem] text-ink-400 font-[500] shrink-0">6 Bulan Terakhir</span>
            </div>

            <div className="grid gap-2.5">
              {TOP_CAMPAIGNS.map((c, i) => (
                <div
                  key={c.name}
                  className="flex items-center gap-3 sm:gap-3.5 p-3 sm:p-3.5 rounded-2xl border hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  style={{
                    borderColor: `${c.color}22`,
                    background: `linear-gradient(to right, ${c.color}08, transparent)`,
                  }}
                >
                  <span
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] grid place-items-center text-[.78rem] font-[900] font-display shrink-0"
                    style={{ background: `${c.color}18`, color: c.color }}
                  >
                    {i + 1}
                  </span>
                  <strong className="text-[.84rem] sm:text-[.86rem] tracking-tight text-ink-900 truncate min-w-0 flex-1 font-[700]">
                    {c.name}
                  </strong>
                  <span className="text-[.8rem] font-[700] text-ink-400 whitespace-nowrap shrink-0">
                    {c.views} views
                  </span>
                  <span
                    className="inline-flex items-center gap-0.5 min-h-[24px] px-2 rounded-full text-[.72rem] font-[800] whitespace-nowrap shrink-0 border"
                    style={{
                      background: `${c.color}12`,
                      color: c.color,
                      borderColor: `${c.color}28`,
                    }}
                  >
                    <ArrowUp size={10} /> {c.roi}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </UmkmDashboardChrome>
  );
}
