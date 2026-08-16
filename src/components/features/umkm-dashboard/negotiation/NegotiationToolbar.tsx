"use client";

import { SearchToolbar, type SearchToolbarFilter } from "@/components/features/dashboard/shared";
import { NEGOTIATION_SORT_OPTIONS, NEGOTIATION_STATUS_FILTERS } from "./negotiation.constants";

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
}: NegotiationToolbarProps) {
  const filters: SearchToolbarFilter[] = [
    {
      label: "Status",
      value: selectedStatus,
      onChange: onStatusChange,
      options: NEGOTIATION_STATUS_FILTERS.map((status) => ({
        value: status.id,
        label: status.label,
        count: statusCounts[status.id],
      })),
    },
    {
      label: "Urutan",
      value: sortBy,
      onChange: onSortByChange,
      options: NEGOTIATION_SORT_OPTIONS.map((option) => ({
        value: option.id,
        label: option.label,
      })),
      prefix: "Urut",
    },
  ];

  return (
    <SearchToolbar
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Cari nama kreator atau judul proyek..."
      filters={filters}
      onClearFilters={onClearFilters}
      hasActiveFilters={hasActiveFilters}
      theme="umkm"
    />
  );
}
