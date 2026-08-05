"use client";

import type { ReactNode } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchToolbarOption {
  value: string;
  label: string;
  count?: number;
}

export interface SearchToolbarFilter {
  value: string;
  onChange: (value: string) => void;
  options: readonly SearchToolbarOption[];
  label: string;
  ariaLabel?: string;
  prefix?: string;
}

interface SearchToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filters?: SearchToolbarFilter[];
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  extraActions?: ReactNode;
  className?: string;
}

export function SearchToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  onClearFilters,
  hasActiveFilters = false,
  extraActions,
  className,
}: SearchToolbarProps) {
  const hasFilterControls = filters.length > 0 || Boolean(extraActions);

  return (
    <div
      className={cn(
        "shrink-0 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,.04)]",
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-9 text-xs font-medium text-neutral-900 shadow-3xs transition-all placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600"
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {hasFilterControls && (
          <details className="group md:contents">
            <summary
              className={cn(
                "flex h-10 cursor-pointer list-none items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all md:hidden",
                hasActiveFilters
                  ? "border-primary-200 bg-primary-50 text-primary-600"
                  : "border-neutral-200 bg-white text-neutral-600",
              )}
            >
              <SlidersHorizontal size={14} />
              Filter
              {hasActiveFilters && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />}
            </summary>

            <div className="mt-3 flex flex-wrap items-center gap-2 group-open:flex md:mt-0 md:flex md:flex-nowrap">
              {filters.map((filter) => (
                <label key={filter.label} className="relative min-w-[150px] flex-1 md:flex-none">
                  <span className="sr-only">{filter.ariaLabel ?? filter.label}</span>
                  <select
                    value={filter.value}
                    onChange={(event) => filter.onChange(event.target.value)}
                    aria-label={filter.ariaLabel ?? filter.label}
                    className="h-10 w-full appearance-none rounded-xl border border-neutral-200 bg-white py-2 pl-3 pr-8 text-xs font-bold text-neutral-700 shadow-3xs transition-all hover:bg-neutral-50 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 md:w-auto"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {filter.prefix ? `${filter.prefix}: ` : ""}
                        {option.label}
                        {option.count !== undefined ? ` (${option.count})` : ""}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </label>
              ))}

              {extraActions}

              {hasActiveFilters && onClearFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="inline-flex h-10 cursor-pointer items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 shadow-3xs transition-all hover:bg-red-100/80"
                >
                  <X size={12} />
                  Reset
                </button>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
