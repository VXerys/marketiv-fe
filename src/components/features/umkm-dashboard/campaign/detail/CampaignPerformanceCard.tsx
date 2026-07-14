"use client";

import { useState } from "react";
import { Campaign, CampaignSubmission } from "@/types/umkm-dashboard.types";
import { formatCurrency, formatCompactNumber } from "@/lib/formatters";
import { DashboardCard } from "../../shared/DashboardCard";

interface CampaignPerformanceCardProps {
  campaign: Campaign;
  submissions: CampaignSubmission[];
}

export function CampaignPerformanceCard({
  campaign,
  submissions,
}: CampaignPerformanceCardProps) {
  const [activeTab, setActiveTab] = useState<"views" | "budget">("views");

  const averageViews =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((sum, s) => sum + s.actualViews, 0) / submissions.length
        )
      : 0;

  // Find best performing submission
  const bestSubmission =
    submissions.length > 0
      ? [...submissions].sort((a, b) => b.actualViews - a.actualViews)[0]
      : null;

  // Generate mock view trends for days
  const viewsTrendData = [
    { day: "Senin", val: 12000, percent: 35 },
    { day: "Selasa", val: 18000, percent: 55 },
    { day: "Rabu", val: 24000, percent: 75 },
    { day: "Kamis", val: 32000, percent: 95 },
    { day: "Jumat", val: 28000, percent: 85 },
    { day: "Sabtu", val: 45000, percent: 100 },
    { day: "Minggu", val: 40000, percent: 90 },
  ];

  // Generate mock budget trends for days
  const budgetTrendData = [
    { day: "Senin", val: 150000, percent: 25 },
    { day: "Selasa", val: 300000, percent: 45 },
    { day: "Rabu", val: 450000, percent: 65 },
    { day: "Kamis", val: 600000, percent: 80 },
    { day: "Jumat", val: 750000, percent: 90 },
    { day: "Sabtu", val: 900000, percent: 100 },
    { day: "Minggu", val: 900000, percent: 100 },
  ];

  const trendData = activeTab === "views" ? viewsTrendData : budgetTrendData;

  return (
    <DashboardCard variant="default">
      <div className="p-6 border-b border-border-soft flex flex-row items-center justify-between">
        <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">
          Analitik Performa
        </h3>
        <div className="flex bg-neutral-50 p-0.5 rounded-full border border-border-soft shrink-0">
          <button
            onClick={() => setActiveTab("views")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === "views"
                ? "bg-white text-primary shadow-xs"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Views
          </button>
          <button
            onClick={() => setActiveTab("budget")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === "budget"
                ? "bg-white text-primary shadow-xs"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Budget
          </button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        
        {/* Visual mock chart utilizing CSS bars */}
        <div className="pt-2">
          <div className="h-28 flex items-end gap-3.5 px-2 relative border-b border-border-soft">
            {trendData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-primary/25 hover:bg-primary/45 rounded-t-sm transition-all duration-300 cursor-pointer"
                  style={{ height: `${data.percent}%` }}
                  title={`${data.val} ${activeTab === "views" ? "Views" : "Rupiah"}`}
                />
                <span className="text-[9px] text-text-muted font-semibold group-hover:text-text-secondary transition-colors mt-1 select-none">
                  {data.day.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-text-secondary">
          <div className="bg-neutral-50/50 p-3.5 rounded-xl border border-border-soft min-w-0">
            <span className="block text-[9px] text-text-muted uppercase tracking-wider mb-0.5 truncate">
              Rata-rata Views / Kreator
            </span>
            <span className="text-sm font-extrabold text-text-primary block truncate">
              {formatCompactNumber(averageViews)} Views
            </span>
          </div>

          <div className="bg-neutral-50/50 p-3.5 rounded-xl border border-border-soft min-w-0">
            <span className="block text-[9px] text-text-muted uppercase tracking-wider mb-0.5 truncate">
              Konten Performa Terbaik
            </span>
            <span className="text-sm font-extrabold text-primary truncate block">
              {bestSubmission ? bestSubmission.creatorName : "Belum ada"}
            </span>
            {bestSubmission && (
              <span className="text-[9px] text-text-muted block mt-0.5 font-medium truncate">
                {formatCompactNumber(bestSubmission.actualViews)} Views
              </span>
            )}
          </div>

          <div className="bg-neutral-50/50 p-3.5 rounded-xl border border-border-soft min-w-0">
            <span className="block text-[9px] text-text-muted uppercase tracking-wider mb-0.5 truncate">
              Sisa Budget Escrow
            </span>
            <span className="text-sm font-extrabold text-success block truncate">
              {formatCurrency(campaign.totalBudgetEscrow - campaign.usedBudget)}
            </span>
          </div>
        </div>

      </div>
    </DashboardCard>
  );
}
