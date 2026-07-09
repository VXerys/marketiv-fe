"use client";

import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatorToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
}

const CATEGORIES = [
  { id: "all",        label: "Semua Kategori" },
  { id: "kuliner",    label: "Kuliner"        },
  { id: "fashion",    label: "Fashion"        },
  { id: "pariwisata",  label: "Pariwisata"     },
  { id: "edukasi",    label: "Edukasi"        },
  { id: "kecantikan", label: "Kecantikan"     },
  { id: "teknologi",  label: "Teknologi"      },
  { id: "lainnya",    label: "Lainnya"        },
];

const SORT_OPTIONS = [
  { id: "rating",    label: "Rating Tertinggi"  },
  { id: "followers", label: "Followers Terbanyak" },
  { id: "price_asc", label: "Harga Terendah"     },
  { id: "reviews",   label: "Review Terbanyak"   },
];

export function CreatorToolbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortByChange,
}: CreatorToolbarProps) {
  const isSorted = sortBy !== "rating";

  return (
    <div className="shrink-0 p-3.5 rounded-[22px] bg-white/80 border border-border shadow-sm grid gap-3">
      {/* Row 1: Search and Sort */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[180px] h-[42px] px-3.5 bg-white rounded-full border border-border shadow-xs transition-all focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-200">
          <Search size={14} className="text-ink-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari nama kreator atau keahlian..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 border-none outline-none bg-transparent text-[.84rem] text-ink-900 placeholder:text-ink-400"
            aria-label="Cari kreator"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="text-ink-400 hover:text-ink-600 transition-colors cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Sort Pill */}
        <div className="relative inline-block">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className={cn(
              "appearance-none h-[42px] min-h-[42px] pl-4 pr-8 rounded-full text-[.82rem] font-[780] cursor-pointer outline-none transition-all duration-200 border shadow-xs",
              isSorted
                ? "border-orange-300/60 bg-orange-50 text-orange-600"
                : "border-border bg-white text-ink-600"
            )}
            aria-label="Urutkan kreator"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className={cn(
              "absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none",
              isSorted ? "text-orange-600" : "text-ink-500"
            )}
          />
        </div>
      </div>

      {/* Row 2: Category Tabs */}
      <div className="flex gap-1.5 flex-wrap p-1.5 rounded-[18px] overflow-x-auto scrollbar-none bg-ink-100/50">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "inline-flex items-center justify-center min-h-9 px-3.5 rounded-[13px] text-[.8rem] cursor-pointer transition-all duration-200 whitespace-nowrap font-display border-0",
                isActive
                  ? "bg-white text-orange-600 font-[820] shadow-sm"
                  : "bg-transparent text-ink-500 font-[720] hover:text-ink-700"
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
