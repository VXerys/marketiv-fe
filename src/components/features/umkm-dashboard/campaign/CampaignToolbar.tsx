"use client";

import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { CREATOR_NICHE_OPTIONS } from "@/constants/umkm-dashboard.constants";

// Status tabs using pill style from prototype
const STATUS_TABS = [
  { value: "all", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "draft", label: "Draft" },
  { value: "full", label: "Penuh" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
] as const;

const SORT_OPTIONS = [
  { value: "latest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "budget_desc", label: "Budget Tertinggi" },
  { value: "views_desc", label: "Views Terbanyak" },
] as const;

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
  statusCounts?: Partial<Record<string, number>>;
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
  statusCounts = {},
}: CampaignToolbarProps) {
  return (
    <div className="shrink-0 bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-3xs flex flex-col gap-4">
      {/* Row 1: search + selects + view toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-grow min-w-[280px]">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari nama campaign atau produk..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-3xs"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters and buttons group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category select */}
          <div className="relative">
            <select
              value={selectedNiche}
              onChange={(e) => onNicheChange(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer shadow-3xs"
            >
              <option value="all">Semua Kategori</option>
              {CREATOR_NICHE_OPTIONS.filter((o) => o.value !== "all").map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
          </div>

          {/* Sort select */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer shadow-3xs"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
          </div>

          {/* Active filter indicator */}
          {hasActiveFilters && (
            <div className="inline-flex items-center gap-1 bg-primary-50 border border-primary-200/50 text-primary-600 text-xs font-extrabold px-2.5 py-1.5 rounded-xl shadow-3xs">
              <SlidersHorizontal size={12} />
              Filter aktif
            </div>
          )}

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-3xs"
            >
              <X size={12} /> Reset
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 rounded-xl gap-0.5 bg-neutral-100 border border-neutral-200 md:ml-auto self-start md:self-auto">
          <button
            onClick={() => onViewModeChange("card")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === "card" ? "bg-white shadow-3xs text-primary-600" : "text-neutral-400 hover:text-neutral-600"
            }`}
            aria-label="Tampilan Kartu"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange("table")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === "table" ? "bg-white shadow-3xs text-primary-600" : "text-neutral-400 hover:text-neutral-600"
            }`}
            aria-label="Tampilan Tabel"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Row 2: status pill tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-neutral-100 pt-3">
        <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mr-1.5 hidden sm:inline shrink-0">
          Status:
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedStatus === tab.value;
            const count = statusCounts[tab.value];
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusChange(tab.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-primary-50 border-primary-500/30 text-primary-600 font-extrabold shadow-3xs"
                    : "bg-white border-neutral-200/60 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {tab.label}
                {count !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[18px] h-4.5 rounded-full text-[9px] font-extrabold px-1 ${
                      isActive ? "bg-primary-100/50 text-primary-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
