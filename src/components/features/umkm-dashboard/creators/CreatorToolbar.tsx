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
  isSticky?: boolean;
}

const CATEGORIES = [
  { id: "all",        label: "Semua Kategori" },
  { id: "kuliner",    label: "Kuliner"        },
  { id: "fashion",    label: "Fashion"        },
  { id: "pariwisata", label: "Pariwisata"     },
  { id: "edukasi",    label: "Edukasi"        },
  { id: "kecantikan", label: "Kecantikan"     },
  { id: "teknologi",  label: "Teknologi"      },
  { id: "lainnya",    label: "Lainnya"        },
];

const SORT_OPTIONS = [
  { id: "rating",    label: "Rating Tertinggi"   },
  { id: "followers", label: "Followers Terbanyak" },
  { id: "price_asc", label: "Harga Terendah"      },
  { id: "reviews",   label: "Review Terbanyak"    },
];

export function CreatorToolbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortByChange,
  isSticky = false,
}: CreatorToolbarProps) {
  const isSorted = sortBy !== "rating";

  return (
    <div
      className={cn(
        "grid gap-2.5 transition-all duration-300",
        isSticky ? "gap-2" : "gap-3"
      )}
      style={{
        padding: isSticky ? "10px 14px" : "14px",
        borderRadius: isSticky ? 18 : 22,
        border: "1px solid rgba(17,24,39,.08)",
        background: isSticky
          ? "rgba(255, 255, 255, 0.85)"
          : "linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,253,249,.85))",
        backdropFilter: isSticky ? "blur(24px)" : "none",
        WebkitBackdropFilter: isSticky ? "blur(24px)" : "none",
        boxShadow: isSticky
          ? "0 8px 30px rgba(15,23,42,.08), 0 1px 0 rgba(255,255,255,.8) inset"
          : "0 4px 14px rgba(15,23,42,.04)",
      }}
    >
      {/* Row 1: Search + Sort */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Search input */}
        <div
          className="flex items-center gap-2 flex-1 min-w-[180px] transition-all duration-200 focus-within:ring-1 focus-within:ring-orange-300/50"
          style={{
            height: isSticky ? 38 : 42,
            padding: "0 14px",
            borderRadius: 999,
            border: "1px solid rgba(17,24,39,.09)",
            background: "rgba(255,255,255,.9)",
            boxShadow: "0 2px 6px rgba(15,23,42,.04)",
          }}
        >
          <Search size={14} color="#9ca8b8" className="shrink-0" />
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
              className="text-ink-400 hover:text-ink-600 transition-colors cursor-pointer shrink-0"
              aria-label="Hapus pencarian"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Sort select */}
        <div className="relative inline-block shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className={cn(
              "appearance-none pl-3.5 pr-8 rounded-full text-[.8rem] font-[780] cursor-pointer outline-none transition-all duration-200 border",
              isSticky ? "h-[38px]" : "h-[42px]",
              isSorted
                ? "border-orange-300/60 bg-orange-50 text-orange-700"
                : "border-neutral-200/80 bg-white text-ink-600"
            )}
            style={{
              boxShadow: "0 2px 6px rgba(15,23,42,.04)",
            }}
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

      {/* Row 2: Category tabs */}
      <div
        className="flex gap-1.5 overflow-x-auto scrollbar-none"
        style={{
          padding: "5px",
          borderRadius: 14,
          background: "rgba(17,24,39,.04)",
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className="whitespace-nowrap cursor-pointer border-0 transition-all duration-200"
              style={{
                minHeight: isSticky ? 32 : 36,
                padding: "0 12px",
                borderRadius: 11,
                fontSize: ".78rem",
                fontWeight: isActive ? 820 : 680,
                color: isActive ? "#ea580c" : "#737f91",
                background: isActive
                  ? "white"
                  : "transparent",
                boxShadow: isActive ? "0 2px 8px rgba(15,23,42,.06)" : "none",
                transition: "all .2s cubic-bezier(.2,.8,.2,1)",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
