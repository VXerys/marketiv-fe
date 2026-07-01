import Image from "next/image";
import { DashboardCard } from "./DashboardCard";
import { MetricBlock } from "./MetricBlock";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import type { CampaignSummary } from "@/types/umkmDashboard";

const CAMPAIGN_THUMBNAIL_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAyf1KY8klccty8IMDWFK-BlEo9nmtsXVTGH2L8AHPvyZwlK2Tt5p1E63SRAwkJttok9Z5sBdY4QQrDVSgjDXWrV3PbzUfs8qnLx3PSp_vaXqA-sHNfkdpVfAJCFzJbfyscn_582cxG3ERa1oXj2LctbNbA_Ym2VnFMbbGjCzdHwMf71p0nA6cns9agJd-9AWNyhBw5GGMHA5EZuwJVFvVFifp9rmT0TjD__tLgDygzBUL7HgFmAG-6M7Mmk1IITUYY4CVJ-7wSG8wk";

interface ActiveCampaignCardProps {
  campaign: CampaignSummary;
}

export function ActiveCampaignCard({ campaign }: ActiveCampaignCardProps) {
  return (
    <DashboardCard className="col-span-12 lg:col-span-7 relative overflow-hidden group">
      {/* Blur accent glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/15 transition-colors duration-500 pointer-events-none"></div>

      <div className="flex justify-between items-start mb-6 z-10 relative">
        <div className="flex gap-3 sm:gap-4 items-start">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] overflow-hidden shadow-md border border-border-subtle shrink-0">
            <Image
              alt="Sambal Matah"
              className="w-full h-full object-cover"
              src={CAMPAIGN_THUMBNAIL_IMAGE_URL}
              width={64}
              height={64}
              sizes="(max-width: 640px) 56px, 64px"
              quality={75}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg sm:text-xl text-neutral-900 font-extrabold tracking-tight leading-tight">{campaign.title}</h3>
              <StatusBadge variant="active" withDot>
                {campaign.status}
              </StatusBadge>
            </div>
            <p className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider leading-relaxed">{campaign.description}</p>
          </div>
        </div>

        {/* Visual Icon Menu */}
        <button className="text-neutral-400 hover:text-primary transition-colors w-8 h-8 rounded-full hover:bg-neutral-50 flex items-center justify-center shadow-sm border border-neutral-100 bg-white">
          {/* Three Dots Icon SVG */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Glass Sub-card for Metrics */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 mb-8 mt-2 z-10 relative shadow-sm border border-white/60">
        <MetricBlock
          label="Total Views"
          className="relative border-b sm:border-b-0 border-neutral-200/60 pb-4 sm:pb-0 sm:after:content-[''] sm:after:absolute sm:after:right-0 sm:after:top-1/2 sm:after:-translate-y-1/2 sm:after:h-12 sm:after:w-px sm:after:bg-neutral-200/80"
        >
          <p className="text-2xl font-extrabold text-neutral-900 tracking-tight leading-none">{campaign.totalViews.toLocaleString("id-ID")}</p>
          <p className="text-[10px] text-green-600 font-bold mt-1.5 flex items-center gap-0.5 uppercase tracking-wider">
            {/* Trending Up SVG */}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8L13 14l-4-4-6 6" />
            </svg>
            {campaign.viewsTrend}
          </p>
        </MetricBlock>

        <MetricBlock
          label="Budget Terpakai"
          className="relative border-b sm:border-b-0 border-neutral-200/60 pb-4 sm:pb-0 sm:after:content-[''] sm:after:absolute sm:after:right-0 sm:after:top-1/2 sm:after:-translate-y-1/2 sm:after:h-12 sm:after:w-px sm:after:bg-neutral-200/80"
        >
          <p className="text-2xl font-extrabold text-neutral-900 tracking-tight leading-none">Rp {(campaign.budgetUsed / 1000000).toFixed(1)}Jt</p>
          <p className="text-[10px] text-neutral-400 font-bold mt-1.5 uppercase tracking-wider">Dari Rp {(campaign.budgetTotal / 1000000).toFixed(1)}Jt</p>
        </MetricBlock>

        <MetricBlock label="Kreator Aktif" className="relative pt-2 sm:pt-0">
          <div className="flex items-baseline gap-0.5 leading-none">
            <p className="text-2xl font-extrabold text-neutral-900 tracking-tight">{campaign.activeCreatorsCount}</p>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">/ {campaign.targetCreatorsCount}</p>
          </div>
          {/* Avatar stack */}
          <div className="flex -space-x-2.5 mt-2.5">
            <div className="w-6 h-6 rounded-full bg-primary border-2 border-white shadow-sm"></div>
            <div className="w-6 h-6 rounded-full bg-secondary border-2 border-white shadow-sm"></div>
            <div className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white shadow-sm"></div>
            <div className="w-6 h-6 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-[9px] font-bold text-neutral-500 shadow-sm">+5</div>
          </div>
        </MetricBlock>
      </div>

      {/* Progress Tracker */}
      <div className="mt-auto z-10 relative">
        <div className="flex justify-between text-xs mb-3 font-bold">
          <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Progress Budget</span>
          <span className="text-primary bg-primary-50 border border-primary-100/50 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">{campaign.progressPercent}%</span>
        </div>
        <ProgressBar value={campaign.progressPercent} />
      </div>
    </DashboardCard>
  );
}
