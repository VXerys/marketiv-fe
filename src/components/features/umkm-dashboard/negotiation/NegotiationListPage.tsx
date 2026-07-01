"use client";

import { useState, useEffect, useTransition } from "react";
import { getNegotiations } from "@/services/umkm/umkm-dashboard.service";
import { NegotiationOrder } from "@/types/umkm-dashboard.types";
import { NegotiationHeader } from "./NegotiationHeader";
import { NegotiationSummaryCards } from "./NegotiationSummaryCards";
import { NegotiationToolbar } from "./NegotiationToolbar";
import { NegotiationRoomCard } from "./NegotiationRoomCard";
import { NegotiationListSkeleton } from "./NegotiationListSkeleton";
import { NegotiationEmptyState } from "./NegotiationEmptyState";
import { NegotiationErrorState } from "./NegotiationErrorState";

export function NegotiationListPage() {
  const [negotiations, setNegotiations] = useState<NegotiationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [, startTransition] = useTransition();

  const loadNegotiations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNegotiations();
      if (res.success && res.data) {
        setNegotiations(res.data);
      } else {
        setError(res.error || "Gagal memuat daftar negosiasi.");
      }
    } catch {
      setError("Terjadi kesalahan sistem saat memuat data.");
    } finally {
      // Keep loading active for mock latency feedback
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }
  };

  useEffect(() => {
    loadNegotiations();
  }, []);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery.trim() !== "" || selectedStatus !== "all";

  // Filter & Sort operations
  const filteredNegotiations = negotiations
    .filter((n) => {
      const matchSearch =
        n.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        selectedStatus === "all" || n.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      }
      if (sortBy === "deadline") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "price_desc") {
        return b.finalPrice - a.finalPrice;
      }
      if (sortBy === "unread") {
        return b.unreadCount - a.unreadCount;
      }
      return 0;
    });

  if (loading) {
    return <NegotiationListSkeleton />;
  }

  if (error) {
    return <NegotiationErrorState message={error} onRetry={loadNegotiations} />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <NegotiationHeader />

      {/* Summary metric cards */}
      <NegotiationSummaryCards negotiations={negotiations} />

      {/* Toolbar filters */}
      <NegotiationToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => startTransition(() => setSearchQuery(q))}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => startTransition(() => setSelectedStatus(status))}
        sortBy={sortBy}
        onSortByChange={(s) => startTransition(() => setSortBy(s))}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* List content */}
      {filteredNegotiations.length > 0 ? (
        <div className="space-y-4">
          {filteredNegotiations.map((order) => (
            <NegotiationRoomCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <NegotiationEmptyState
          isFiltered={hasActiveFilters}
          onReset={handleClearFilters}
        />
      )}
    </div>
  );
}
