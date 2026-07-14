import { CreatorNiche } from "@/types/creator-dashboard";
import { cn } from "@/lib/utils";

interface CreatorFilterToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedNiche?: string;
  onNicheChange?: (val: string) => void;
  selectedStatus?: string;
  onStatusChange?: (val: string) => void;
  statusOptions?: Array<{ label: string; value: string }>;
  sortBy?: string;
  onSortChange?: (val: string) => void;
  sortOptions?: Array<{ label: string; value: string }>;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function CreatorFilterToolbar({
  search,
  onSearchChange,
  selectedNiche,
  onNicheChange,
  selectedStatus,
  onStatusChange,
  statusOptions,
  sortBy,
  onSortChange,
  sortOptions,
  onClearFilters,
  hasActiveFilters,
}: CreatorFilterToolbarProps) {
  const niches: Array<{ label: string; value: string }> = [
    { label: "Semua Kategori", value: "all" },
    { label: "Kuliner", value: "kuliner" },
    { label: "Fesyen", value: "fesyen" },
    { label: "Kecantikan", value: "kecantikan" },
    { label: "Edukasi", value: "edukasi" },
    { label: "Pariwisata", value: "pariwisata" },
    { label: "Lainnya", value: "lainnya" },
  ];

  return (
    <div className="bg-white/80 border border-neutral-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.01)] rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
      <div className="flex-1 flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kata kunci..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-neutral-800 placeholder-neutral-400"
          />
        </div>

        {/* Niche Filter */}
        {onNicheChange && selectedNiche !== undefined && (
          <div className="relative shrink-0">
            <select
              value={selectedNiche}
              onChange={(e) => onNicheChange(e.target.value)}
              className="w-full sm:w-44 px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-sm font-bold text-neutral-700 focus:outline-none cursor-pointer appearance-none pr-8"
            >
              {niches.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        )}

        {/* Status Filter */}
        {onStatusChange && selectedStatus !== undefined && statusOptions && (
          <div className="relative shrink-0">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full sm:w-44 px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-sm font-bold text-neutral-700 focus:outline-none cursor-pointer appearance-none pr-8"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* Sort options & clear actions */}
      <div className="flex items-center gap-3 shrink-0">
        {onSortChange && sortBy !== undefined && sortOptions && (
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full sm:w-44 px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-xs font-bold text-neutral-700 focus:outline-none cursor-pointer appearance-none pr-8"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2.5 hover:bg-neutral-100 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1.5 border border-transparent cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
