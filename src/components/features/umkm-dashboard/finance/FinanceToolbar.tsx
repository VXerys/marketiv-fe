"use client";

import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  REFERENCE_TYPE_OPTIONS,
  SORT_OPTIONS,
} from "./finance.constants";

interface FinanceToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  refFilter: string;
  setRefFilter: (ref: string) => void;
  sortOrder: string;
  setSortOrder: (sort: string) => void;
  onClearAll: () => void;
  hasFilters: boolean;
}

export function FinanceToolbar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  refFilter,
  setRefFilter,
  sortOrder,
  setSortOrder,
  onClearAll,
  hasFilters,
}: FinanceToolbarProps) {
  return (
    <div className="shrink-0 bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-3xs flex flex-col gap-4">
      {/* Row 1: Search + dropdowns */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-grow min-w-[280px]">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari deskripsi transaksi atau ID..."
            className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-3xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters and buttons group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type select */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer shadow-3xs"
            >
              {TRANSACTION_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
          </div>

          {/* Reference select */}
          <div className="relative">
            <select
              value={refFilter}
              onChange={(e) => setRefFilter(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer shadow-3xs"
            >
              {REFERENCE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
          </div>

          {/* Sort select */}
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer shadow-3xs"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>Urut: {opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
          </div>

          {/* Active filter indicator */}
          {hasFilters && (
            <div className="inline-flex items-center gap-1 bg-primary-50 border border-primary-200/50 text-primary-600 text-xs font-extrabold px-2.5 py-1.5 rounded-xl shadow-3xs">
              <SlidersHorizontal size={12} />
              Filter aktif
            </div>
          )}

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-3xs"
            >
              <X size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Status pill tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-neutral-100 pt-3">
        <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mr-1.5 hidden sm:inline shrink-0">
          Status:
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {TRANSACTION_STATUS_OPTIONS.map((opt) => {
            const isActive = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-primary-50 border-primary-500/30 text-primary-600 font-extrabold shadow-3xs"
                    : "bg-white border-neutral-200/60 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-700"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
