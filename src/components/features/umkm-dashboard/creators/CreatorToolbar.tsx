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

export function CreatorToolbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortByChange,
}: CreatorToolbarProps) {
  const categories = [
    { id: "all", label: "Semua Kategori" },
    { id: "kuliner", label: "Kuliner" },
    { id: "fashion", label: "Fashion" },
    { id: "kosmetik", label: "Kosmetik" },
    { id: "handmade", label: "Handmade" },
  ];

  const sortOptions = [
    { id: "rating", label: "Rating Tertinggi" },
    { id: "followers", label: "Followers Terbanyak" },
    { id: "price_asc", label: "Harga Terendah" },
    { id: "reviews", label: "Review Terbanyak" },
  ];

  const isSorted = sortBy !== "rating";

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
      {/* Row 1: Search and Sort */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Search */}
        <div
          className="flex items-center gap-2 flex-1 min-w-[180px] h-[42px] px-[14px] bg-white rounded-full transition-all"
          style={{ border: "1px solid rgba(17,24,39,.09)", boxShadow: "0 4px 14px rgba(15,23,42,.04)" }}
        >
          <Search size={14} color="#737f91" className="shrink-0" />
          <input
            type="text"
            placeholder="Cari nama kreator atau keahlian..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 border-none outline-none bg-transparent text-[.84rem] text-[#182033] placeholder:text-[#a0aaba]"
            style={{ fontFamily: "inherit" }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="text-[#a0aaba] hover:text-[#556174] transition-colors cursor-pointer"
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
            className="appearance-none h-[42px] min-h-[42px] pl-4 pr-8 rounded-full text-[.82rem] font-[780] cursor-pointer outline-none transition-all duration-200"
            style={{
              border: isSorted ? "1px solid rgba(249,115,22,.26)" : "1px solid rgba(17,24,39,.09)",
              background: isSorted ? "#fff7ed" : "white",
              color: isSorted ? "#ea580c" : "#556174",
              boxShadow: "0 4px 12px rgba(15,23,42,.04)",
              fontFamily: "inherit",
            }}
          >
            {sortOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            color={isSorted ? "#ea580c" : "#737f91"}
          />
        </div>
      </div>

      {/* Row 2: Category Tabs in grey pill bar wrapper */}
      <div
        className="flex gap-1.5 flex-wrap p-1.5 rounded-[18px] overflow-x-auto scrollbar-none"
        style={{ background: "#eef2f7" }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className="inline-flex items-center justify-center min-h-9 px-[14px] rounded-[13px] text-[.8rem] cursor-pointer transition-all whitespace-nowrap font-display"
              style={{
                border: "none",
                background: isActive ? "white" : "transparent",
                color: isActive ? "#ea580c" : "#737f91",
                fontWeight: isActive ? 820 : 720,
                boxShadow: isActive ? "0 4px 14px rgba(15,23,42,.08)" : "none",
                fontFamily: "inherit",
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
