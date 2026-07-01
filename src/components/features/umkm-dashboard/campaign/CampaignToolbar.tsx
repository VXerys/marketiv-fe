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

function SelectPill({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const isFiltered = value !== "all" && value !== "latest";
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none min-h-[38px] pl-3 pr-7 rounded-full text-[.82rem] font-[780] cursor-pointer outline-none transition-all"
        style={{
          border: isFiltered ? "1px solid rgba(249,115,22,.26)" : "1px solid rgba(17,24,39,.09)",
          background: isFiltered ? "#fff7ed" : "white",
          color: isFiltered ? "#ea580c" : "#556174",
          boxShadow: "0 4px 12px rgba(15,23,42,.04)",
          fontFamily: "inherit",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        color={isFiltered ? "#ea580c" : "#737f91"}
      />
    </div>
  );
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
    <div
      className="mb-6 shrink-0"
      style={{
        padding: "14px 16px",
        borderRadius: 22,
        background: "rgba(255,255,255,.80)",
        border: "1px solid rgba(17,24,39,.08)",
        boxShadow: "0 6px 22px rgba(15,23,42,.05)",
        display: "grid",
        gap: 12,
      }}
    >
      {/* Row 1: search + selects + view toggle */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Search */}
        <div
          className="flex items-center gap-2 flex-1 min-w-[180px] h-[42px] px-[14px] bg-white rounded-full"
          style={{ border: "1px solid rgba(17,24,39,.09)", boxShadow: "0 4px 14px rgba(15,23,42,.04)" }}
        >
          <Search size={14} color="#737f91" className="shrink-0" />
          <input
            placeholder="Cari nama campaign atau produk..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 border-none outline-none bg-transparent text-[.84rem] text-[#182033] placeholder:text-[#a0aaba]"
            style={{ fontFamily: "inherit" }}
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="text-[#a0aaba] hover:text-[#556174] transition-colors cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category select */}
        <SelectPill
          value={selectedNiche}
          options={[
            { value: "all", label: "Semua Kategori" },
            ...CREATOR_NICHE_OPTIONS.filter((o) => o.value !== "all"),
          ]}
          onChange={onNicheChange}
        />

        {/* Sort select */}
        <SelectPill value={sortBy} options={SORT_OPTIONS} onChange={onSortChange} />

        {/* Active filter indicator */}
        {hasActiveFilters && (
          <div
            className="inline-flex items-center gap-1.5 min-h-[28px] px-2.5 rounded-full text-[.72rem] font-[850]"
            style={{
              background: "#fff7ed",
              border: "1px solid rgba(249,115,22,.22)",
              color: "#ea580c",
            }}
          >
            <SlidersHorizontal size={11} />
            Filter aktif
          </div>
        )}

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-full text-[.78rem] font-[800] cursor-pointer transition-all hover:opacity-90"
            style={{
              border: "1px solid rgba(220,38,38,.18)",
              background: "#fff5f5",
              color: "#b4232a",
              fontFamily: "inherit",
            }}
          >
            <X size={12} /> Reset
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Card/Table toggle */}
        <div
          className="flex items-center p-1.5 rounded-2xl gap-1"
          style={{ background: "#eef2f7" }}
        >
          <button
            onClick={() => onViewModeChange("card")}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              viewMode === "card" ? "bg-white shadow-sm text-primary" : "text-[#737f91] hover:text-[#556174]"
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
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              viewMode === "table" ? "bg-white shadow-sm text-primary" : "text-[#737f91] hover:text-[#556174]"
            }`}
            aria-label="Tampilan Tabel"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Row 2: status pill tabs */}
      <div
        className="flex gap-1.5 flex-wrap p-1.5 rounded-[18px]"
        style={{ background: "#eef2f7" }}
      >
        {STATUS_TABS.map((tab) => {
          const isActive = selectedStatus === tab.value;
          const count = statusCounts[tab.value];
          return (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className="inline-flex items-center gap-1.5 min-h-9 px-[13px] rounded-[13px] text-[.8rem] cursor-pointer transition-all whitespace-nowrap"
              style={{
                border: "none",
                background: isActive ? "white" : "transparent",
                color: isActive ? "#ea580c" : "#737f91",
                fontWeight: isActive ? 820 : 720,
                boxShadow: isActive ? "0 4px 14px rgba(15,23,42,.08)" : "none",
                fontFamily: "inherit",
              }}
            >
              {tab.label}
              {count !== undefined && (
                <span
                  className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-[.66rem] font-[900] px-[5px]"
                  style={{
                    background: isActive ? "#fff7ed" : "rgba(17,24,39,.09)",
                    color: isActive ? "#ea580c" : "#737f91",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
