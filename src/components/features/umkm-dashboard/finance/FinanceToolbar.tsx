"use client";

import { SearchToolbar, type SearchToolbarFilter } from "@/components/features/dashboard/shared";
import {
  REFERENCE_TYPE_OPTIONS,
  SORT_OPTIONS,
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
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
  const filters: SearchToolbarFilter[] = [
    {
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: TRANSACTION_STATUS_OPTIONS,
    },
    {
      label: "Jenis",
      value: typeFilter,
      onChange: setTypeFilter,
      options: TRANSACTION_TYPE_OPTIONS,
    },
    {
      label: "Referensi",
      value: refFilter,
      onChange: setRefFilter,
      options: REFERENCE_TYPE_OPTIONS,
    },
    {
      label: "Urutan",
      value: sortOrder,
      onChange: setSortOrder,
      options: SORT_OPTIONS,
      prefix: "Urut",
    },
  ];

  return (
    <SearchToolbar
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Cari deskripsi transaksi atau ID..."
      filters={filters}
      onClearFilters={onClearAll}
      hasActiveFilters={hasFilters}
      theme="umkm"
    />
  );
}
