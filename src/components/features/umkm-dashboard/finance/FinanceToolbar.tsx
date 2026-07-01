"use client";

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
    <div className="bg-white/40 border border-neutral-200/40 rounded-2xl p-4.5 space-y-4 backdrop-blur-xs">
      <div className="flex flex-col lg:flex-row gap-3.5">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari deskripsi transaksi atau ID..."
            className="w-full bg-white border border-neutral-200/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted font-medium focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        {/* Dropdowns Group */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0">
          {/* Type Dropdown */}
          <div className="w-full sm:w-36">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-white border border-neutral-200/60 rounded-xl px-3 py-2.5 text-xs text-text-secondary font-bold focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
            >
              {TRANSACTION_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reference Fitur Dropdown */}
          <div className="w-full sm:w-36">
            <select
              value={refFilter}
              onChange={(e) => setRefFilter(e.target.value)}
              className="w-full bg-white border border-neutral-200/60 rounded-xl px-3 py-2.5 text-xs text-text-secondary font-bold focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
            >
              {REFERENCE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-36">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-white border border-neutral-200/60 rounded-xl px-3 py-2.5 text-xs text-text-secondary font-bold focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Urut: {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mr-1.5 hidden sm:inline">
            Status:
          </span>
          {TRANSACTION_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full border text-[11px] font-extrabold transition-all cursor-pointer ${
                statusFilter === opt.value
                  ? "bg-brand-coral/5 border-primary/30 text-primary font-black shadow-2xs"
                  : "bg-white/50 border-neutral-200/60 hover:bg-neutral-50 text-text-muted hover:text-text-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Clear Filters CTA */}
        {hasFilters && (
          <button
            onClick={onClearAll}
            className="text-[11px] font-bold text-primary hover:text-primary-700 underline underline-offset-4 cursor-pointer flex items-center gap-1 self-end sm:self-center transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
}
