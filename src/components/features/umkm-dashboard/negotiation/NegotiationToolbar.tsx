"use client";

import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { NEGOTIATION_STATUS_FILTERS, NEGOTIATION_SORT_OPTIONS } from "./negotiation.constants";

interface NegotiationToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  statusCounts?: Partial<Record<string, number>>;
  isSticky?: boolean;
}

export function NegotiationToolbar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortByChange,
  onClearFilters,
  hasActiveFilters,
  statusCounts = {},
  isSticky = false,
}: NegotiationToolbarProps) {
  const statuses = NEGOTIATION_STATUS_FILTERS;
  const sortOptions = NEGOTIATION_SORT_OPTIONS;

  return (
    <div
      className="shrink-0 flex flex-col gap-4"
      style={{
        padding: isSticky ? "10px 14px" : "16px",
        borderRadius: isSticky ? 18 : 16,
        border: "1px solid rgba(17,24,39,.09)",
        background: isSticky ? "rgba(255,255,255,.92)" : "white",
        backdropFilter: isSticky ? "blur(24px)" : "none",
        WebkitBackdropFilter: isSticky ? "blur(24px)" : "none",
        boxShadow: isSticky
          ? "0 8px 30px rgba(15,23,42,.08), 0 1px 0 rgba(255,255,255,.8) inset"
          : "0 2px 8px rgba(15,23,42,.04)",
        transition: "all .28s cubic-bezier(.2,.8,.2,1)",
      }}
    >
      {/* Row 1: Search + Sort + filter indicators */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-grow min-w-[240px]">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari nama kreator atau judul proyek..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-3xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort + filter indicators */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer shadow-3xs"
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
          </div>

          {hasActiveFilters && (
            <div className="inline-flex items-center gap-1 bg-primary-50 border border-primary-200/50 text-primary-600 text-xs font-extrabold px-2.5 py-1.5 rounded-xl shadow-3xs">
              <SlidersHorizontal size={12} />
              Filter aktif
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-3xs"
            >
              <X size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Status pill tabs — collapses when sticky */}
      <div
        style={{
          maxHeight: isSticky ? 0 : 200,
          opacity: isSticky ? 0 : 1,
          overflow: "hidden",
          transition: "max-height .28s cubic-bezier(.2,.8,.2,1), opacity .2s ease",
        }}
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-neutral-100 pt-3">
          <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mr-1.5 hidden sm:inline shrink-0">
            Status:
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {statuses.map((status) => {
              const isActive = selectedStatus === status.id;
              const count = statusCounts[status.id];
              return (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => onStatusChange(status.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                    isActive
                      ? "bg-primary-50 border-primary-500/30 text-primary-600 font-extrabold shadow-3xs"
                      : "bg-white border-neutral-200/60 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  {status.label}
                  {count !== undefined && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[9px] font-extrabold px-1",
                        isActive ? "bg-primary-100/50 text-primary-700" : "bg-neutral-100 text-neutral-500"
                      )}
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
    </div>
  );
}
