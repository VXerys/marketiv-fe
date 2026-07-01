"use client";

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
    { id: "all", label: "Semua" },
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

  return (
    <div className="space-y-4 mb-6">
      {/* Search & Sort Panel */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari nama kreator atau keahlian..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-subtle rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-text-muted/65 shadow-2xs"
          />
        </div>

        {/* Sort */}
        <div className="relative w-full sm:w-48 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-border-subtle rounded-xl text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-2xs appearance-none cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-text-muted">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border duration-250 cursor-pointer",
                isActive
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-white text-text-secondary border-border-subtle hover:border-neutral-300 hover:text-text-primary"
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
