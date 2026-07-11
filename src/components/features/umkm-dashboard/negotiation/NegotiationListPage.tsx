"use client";

import { useState, useEffect, useTransition } from "react";
import { getNegotiations } from "@/services/umkm/umkm-dashboard.service";
import { useStickyToolbar } from "@/hooks/useStickyToolbar";
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
  const { toolbarRef, isSticky: isToolbarSticky } = useStickyToolbar();

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

  // Status counts for toolbar badge indicators
  const statusCounts: Partial<Record<string, number>> = {
    all: negotiations.length,
    negotiation: negotiations.filter((n) => n.status === "negotiation").length,
    waiting_payment: negotiations.filter((n) => n.status === "waiting_payment").length,
    escrow: negotiations.filter((n) => n.status === "escrow").length,
    revision: negotiations.filter((n) => n.status === "revision").length,
    waiting_verification: negotiations.filter((n) => n.status === "waiting_verification").length,
    completed: negotiations.filter((n) => n.status === "completed").length,
    dispute: negotiations.filter((n) => n.status === "dispute").length,
  };

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
    <div className="space-y-6 max-w-[1280px] mx-auto pb-8 px-1">
      {/* Header */}
      <NegotiationHeader />

      {/* Summary metric cards */}
      <NegotiationSummaryCards negotiations={negotiations} />

      {/* Toolbar filters — sticky direct child of space-y-6 container */}
      <div ref={toolbarRef} style={{ position: "sticky", top: 0, zIndex: 30 }}>
        <NegotiationToolbar
          searchQuery={searchQuery}
          onSearchChange={(q) => startTransition(() => setSearchQuery(q))}
          selectedStatus={selectedStatus}
          onStatusChange={(status) => startTransition(() => setSelectedStatus(status))}
          sortBy={sortBy}
          onSortByChange={(s) => startTransition(() => setSortBy(s))}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          statusCounts={statusCounts}
          isSticky={isToolbarSticky}
        />
      </div>

      {/* List content */}
      {filteredNegotiations.length > 0 ? (
        <div className="flex flex-col gap-3">
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
