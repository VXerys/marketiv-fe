"use client";

import { CAMPAIGN_STATUS_OPTIONS, CREATOR_NICHE_OPTIONS } from "@/constants/umkm-dashboard.constants";
import { DashboardCard, DashboardButton } from "../shared";

interface CampaignToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedNiche: string;
  onNicheChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  viewMode: "card" | "table";
  onViewModeChange: (mode: "card" | "table") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function CampaignToolbar({
  search,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedNiche,
  onNicheChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onClearFilters,
  hasActiveFilters,
}: CampaignToolbarProps) {
  return (
    <DashboardCard variant="default" className="p-4 mb-6 sticky top-0 z-30 flex flex-col gap-4 lg:flex-row lg:items-center justify-between shrink-0">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-text-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 bg-neutral-50/50 text-xs text-text-primary border border-border-strong rounded-full focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted"
            placeholder="Cari campaign..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full sm:w-40 relative">
          <select
            className="w-full appearance-none pl-3 pr-8 py-2 bg-neutral-50/50 text-xs font-semibold text-text-secondary border border-border-strong rounded-full focus:outline-none focus:border-primary cursor-pointer transition-colors"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">Semua Status</option>
            {CAMPAIGN_STATUS_OPTIONS.filter(o => o.value !== "all").map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

        {/* Niche Dropdown */}
        <div className="w-full sm:w-40 relative">
          <select
            className="w-full appearance-none pl-3 pr-8 py-2 bg-neutral-50/50 text-xs font-semibold text-text-secondary border border-border-strong rounded-full focus:outline-none focus:border-primary cursor-pointer transition-colors"
            value={selectedNiche}
            onChange={(e) => onNicheChange(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {CREATOR_NICHE_OPTIONS.filter(o => o.value !== "all").map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Sorting & Toggles */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        {/* Sort select */}
        <div className="w-40 relative">
          <select
            className="w-full appearance-none pl-3 pr-8 py-2 bg-neutral-50/50 text-xs font-semibold text-text-secondary border border-border-strong rounded-full focus:outline-none focus:border-primary cursor-pointer transition-colors"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="latest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="budget_desc">Budget Terbesar</option>
            <option value="views_desc">Views Tertinggi</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

        {/* Card/Table toggle buttons */}
        <div className="flex items-center bg-neutral-50 p-0.5 rounded-full border border-border-soft">
          <button
            onClick={() => onViewModeChange("card")}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === "card"
                ? "bg-white text-primary shadow-xs"
                : "text-text-muted hover:text-text-secondary"
            }`}
            aria-label="Tampilan Kartu"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange("table")}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-primary shadow-xs"
                : "text-text-muted hover:text-text-secondary"
            }`}
            aria-label="Tampilan Tabel"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <DashboardButton
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="h-[34px] px-4 shrink-0 text-xs"
          >
            Reset
          </DashboardButton>
        )}
      </div>
    </DashboardCard>
  );
}
