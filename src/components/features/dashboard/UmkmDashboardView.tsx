"use client";

import { useState } from "react";
import { ActiveCampaignCard } from "./ActiveCampaignCard";
import { EscrowSummaryCard } from "./EscrowSummaryCard";
import { ReviewSubmissionCard } from "./ReviewSubmissionCard";
import { UmkmDashboardChrome } from "./UmkmDashboardChrome";
import { UmkmViewsChartCard } from "./UmkmViewsChartCard";
import type { UmkmDashboardData } from "@/types/umkmDashboard";
import { cn } from "@/lib/utils";
import {
  DashboardCard,
  DashboardMetricCard,
  DashboardBadge,
  DashboardButton,
  DashboardStateCard,
} from "@/components/features/dashboard/shared";

interface UmkmDashboardViewProps {
  data: UmkmDashboardData;
}

type DashboardState = "normal" | "loading" | "empty" | "error";

export function UmkmDashboardView({ data }: UmkmDashboardViewProps) {
  const [simulatedState, setSimulatedState] = useState<DashboardState>("normal");

  const { campaign, escrow, submissions, chartData, kpis, insights, activities } = data;

  const handleCreateCampaign = () => {
    window.location.href = "/dashboard/umkm/campaign/buat";
  };

  const handleSearchCreator = () => {
    window.location.href = "/dashboard/umkm/kreator";
  };

  const handleViewCampaigns = () => {
    window.location.href = "/dashboard/umkm/campaign";
  };



  return (
    <UmkmDashboardChrome businessName={data.businessName}>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-8">
        
        {/* Simulator controls for Slicing Quality Check */}
        <div className="bg-bg-section/80 border border-border-soft p-3 rounded-2xl flex flex-wrap gap-2 items-center justify-between shadow-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-2 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            Demo State Simulator:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(["normal", "loading", "empty", "error"] as DashboardState[]).map((state) => (
              <button
                key={state}
                onClick={() => setSimulatedState(state)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all border cursor-pointer select-none ${
                  simulatedState === state
                    ? "bg-primary text-white border-primary shadow-[0_4px_12px_rgba(249,115,22,0.25)] animate-none"
                    : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* 1. LOADING SHIMMER STATE */}
        {simulatedState === "loading" && (
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-3">
              <div className="h-10 w-80 skeleton rounded-2xl" />
              <div className="h-5 w-64 skeleton rounded-xl" />
            </div>

            {/* KPI grid skeleton */}
            <div className="dashboard-rule-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 skeleton rounded-[28px]" />
              ))}
            </div>

            {/* Bento Grid Skeleton */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-7 h-96 skeleton rounded-[28px]" />
              <div className="col-span-12 lg:col-span-5 h-96 skeleton rounded-[28px]" />
              <div className="col-span-12 lg:col-span-5 h-96 skeleton rounded-[28px]" />
              <div className="col-span-12 lg:col-span-7 h-96 skeleton rounded-[28px]" />
            </div>

            {/* Insights and activity skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 skeleton rounded-[28px]" />
              <div className="h-64 skeleton rounded-[28px]" />
            </div>
          </div>
        )}

        {/* 2. ERROR STATE */}
        {simulatedState === "error" && (
          <div className="py-12">
            <DashboardStateCard
              kind="error"
              title="Gagal Memuat Dashboard UMKM"
              description="Sistem mengalami kendala saat melakukan sinkronisasi dengan data P2MW terbaru. Silakan coba beberapa saat lagi."
              actionLabel="Segarkan Data"
              onAction={() => setSimulatedState("normal")}
            />
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {simulatedState === "empty" && (
          <div className="space-y-8">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-neutral-900 tracking-tight leading-tight">
                    {data.greeting}
                  </h2>
                  <DashboardBadge tone="amber" size="sm" className="font-extrabold">
                    Belum Aktif
                  </DashboardBadge>
                </div>
                <p className="text-neutral-500 font-semibold">{data.subtitle}</p>
              </div>
            </div>

            {/* Premium Empty State Panel */}
            <div className="state-card py-16 px-6 sm:px-12 flex flex-col items-center text-center max-w-4xl mx-auto">
              <div className="state-icon mb-6">
                {/* Custom MegaPhone Illustration */}
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-extrabold text-neutral-950 mb-3 tracking-tight">
                Belum Ada Campaign Terdaftar
              </h3>
              <p className="text-neutral-500 max-w-lg text-sm leading-relaxed mb-8 font-medium">
                Mulai pasarkan produk bisnis UMKM Anda dengan meluncurkan brief campaign pertamamu. Undang mikro-kreator berbakat dan bayar hanya berdasarkan performa views nyata.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <DashboardButton variant="primary" onClick={handleCreateCampaign} fullWidthOnMobile>
                  Buat Campaign Pertama
                </DashboardButton>
                <DashboardButton variant="outline" onClick={handleSearchCreator} fullWidthOnMobile>
                  Cari Kreator Mikro
                </DashboardButton>
              </div>
            </div>
          </div>
        )}

        {/* 4. NORMAL STATE (MAIN DASHBOARD REDESIGN) */}
        {simulatedState === "normal" && (
          <>
            {/* Header & Quick Action Surface */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-neutral-900 tracking-tight leading-tight">
                    {data.greeting}
                  </h2>
                  <DashboardBadge tone="green" size="sm" className="font-extrabold border-green-200 bg-green-50 text-green-700 shadow-xs">
                    Mitra P2MW Verified
                  </DashboardBadge>
                </div>
                <p className="text-neutral-500 font-semibold">{data.subtitle}</p>
              </div>

              {/* Quick Actions Panel */}
              <div className="flex flex-col sm:flex-row gap-2.5 w-full xl:w-auto">
                <DashboardButton
                  variant="primary"
                  onClick={handleCreateCampaign}
                  leftIcon={
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  }
                  fullWidthOnMobile
                >
                  Buat Campaign Baru
                </DashboardButton>
                
                <DashboardButton
                  variant="secondary"
                  onClick={handleSearchCreator}
                  leftIcon={
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                  fullWidthOnMobile
                >
                  Cari Kreator
                </DashboardButton>

                <DashboardButton
                  variant="outline"
                  onClick={handleViewCampaigns}
                  leftIcon={
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  }
                  fullWidthOnMobile
                >
                  Lihat Semua Campaign
                </DashboardButton>
              </div>
            </div>

            {/* 6-Grid KPI Metrics Row (Dashboard 2-3-6 Grid) */}
            {kpis && (
              <div className="dashboard-rule-grid">
                <DashboardMetricCard
                  label="Campaign Tangible"
                  value={kpis.campaignActive}
                  helper="Sedang Berjalan"
                  tone="orange"
                  badgeText="Active"
                  badgeTone="green"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  }
                />
                
                <DashboardMetricCard
                  label="Total Pengeluaran"
                  value={kpis.totalSpend}
                  helper="Bulan Ini"
                  tone="navy"
                  currency="compact"
                  badgeText="P2MW"
                  badgeTone="navy"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  }
                />

                <DashboardMetricCard
                  label="Dana Escrow"
                  value={kpis.escrowBalance}
                  helper="Ditahan Aman"
                  tone="green"
                  currency="compact"
                  badgeText="Escrow"
                  badgeTone="orange"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  }
                />

                <DashboardMetricCard
                  label="Kreator Tergabung"
                  value={kpis.creatorJoined}
                  helper="Orang Terdaftar"
                  tone="default"
                  badgeText="Joined"
                  badgeTone="purple"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  }
                />

                <DashboardMetricCard
                  label="Views Valid"
                  value={kpis.viewsValid}
                  helper="Total Terakumulasi"
                  tone="blue"
                  badgeText="Valid"
                  badgeTone="blue"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                />

                <DashboardMetricCard
                  label="Review Bukti"
                  value={kpis.pendingSubmissions}
                  helper="Menunggu Validasi"
                  tone="red"
                  badgeText="Risk"
                  badgeTone="red"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                />
              </div>
            )}

            {/* Bento Grid */}
            <div className="bento-grid">
              <ActiveCampaignCard campaign={campaign} />
              <EscrowSummaryCard escrow={escrow} />
              <ReviewSubmissionCard submissions={submissions} />
              <UmkmViewsChartCard chartData={chartData} />
            </div>

            {/* Additional Sections: Insights and Activity Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Insight Section */}
              {insights && (
                <div className="col-span-12 lg:col-span-6 flex flex-col space-y-4">
                  <h3 className="text-xl font-display font-extrabold text-neutral-900 tracking-tight pl-1">
                    Rekomendasi & Insight Bisnis
                  </h3>
                  
                  <div className="panel flex-1 bg-white flex flex-col justify-start space-y-3">
                    {insights.map((ins) => {
                      const alertType = ins.type === "success" ? "success" : ins.type === "purple" ? "success" : "warning";
                      const icon = alertType === "success" ? "✓" : "!";
                      return (
                        <div
                          key={ins.id}
                          className={cn("alert hover:-translate-y-0.5 transition-all duration-200", alertType)}
                        >
                          <div className="alert-icon">{icon}</div>
                          <div>
                            <strong>Insight Bisnis</strong>
                            <p className="text-xs font-bold leading-relaxed">{ins.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activity Section */}
              {activities && (
                <div className="col-span-12 lg:col-span-6 flex flex-col space-y-4">
                  <h3 className="text-xl font-display font-extrabold text-neutral-900 tracking-tight pl-1">
                    Aktivitas Terbaru
                  </h3>
                  
                  <div className="panel flex-1 bg-white">
                    <div className="timeline">
                      {activities.map((act, index) => (
                        <div key={act.id} className="timeline-item">
                          <div className="timeline-dot">
                            {index + 1}
                          </div>
                          <div className="timeline-content hover:border-orange-200/60 hover:-translate-y-0.5 transition-all duration-200">
                            <strong className="text-sm font-bold text-neutral-900 leading-tight block mb-1">
                              {act.title}
                            </strong>
                            <span className="text-xs text-neutral-500 font-semibold block leading-relaxed mb-2">
                              {act.description}
                            </span>
                            <div className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider block">
                              {act.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </UmkmDashboardChrome>
  );
}
