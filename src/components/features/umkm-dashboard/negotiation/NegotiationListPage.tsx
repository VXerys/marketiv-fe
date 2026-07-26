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
import {
  getMyConversations,
  setConversationArchived,
  conversationPairKey,
  type ConversationFlag,
} from "@/services/shared/conversation.service";
import { toast } from "sonner";

export function NegotiationListPage() {
  const [negotiations, setNegotiations] = useState<NegotiationOrder[]>([]);
  const [conversations, setConversations] = useState<ConversationFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showArchived, setShowArchived] = useState(false);
  const [, startTransition] = useTransition();
  const { toolbarRef, isSticky: isToolbarSticky } = useStickyToolbar();

  const loadNegotiations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Percakapan dimuat berbarengan: daftar ini di-key orderId sedangkan
      // status arsip ada di `conversations`. Kegagalannya TIDAK menggagalkan
      // halaman — tanpa data arsip semua baris tampil, itu degradasi yang aman.
      const [res, convRes] = await Promise.all([getNegotiations(), getMyConversations()]);
      if (res.success && res.data) {
        setNegotiations(res.data);
      } else {
        setError(res.error || "Gagal memuat daftar negosiasi.");
      }
      if (convRes.success && convRes.data) {
        setConversations(convRes.data);
      }
    } catch {
      setError("Terjadi kesalahan sistem saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  /** Percakapan unik per pasangan umkm+creator — jembatan ke baris negosiasi. */
  const conversationByPair = new Map(
    conversations.map((c) => [conversationPairKey(c.umkmId, c.creatorId), c])
  );

  const findConversation = (order: NegotiationOrder) =>
    conversationByPair.get(conversationPairKey(order.umkmId, order.creatorId));

  const handleToggleArchive = async (order: NegotiationOrder) => {
    const conv = findConversation(order);
    if (!conv) {
      toast.error("Percakapan untuk negosiasi ini belum tersedia.");
      return;
    }
    const next = !conv.isArchived;
    const res = await setConversationArchived(conv.id, next);
    if (!res.success) {
      toast.error(res.error ?? "Gagal mengubah status arsip.");
      return;
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, isArchived: next } : c))
    );
    toast.success(next ? "Percakapan diarsipkan." : "Percakapan dikembalikan ke inbox.");
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

  // Hitungan status mengikuti tab arsip yang sedang aktif — badge yang
  // menghitung baris tak terlihat akan menyesatkan.
  const scopedNegotiations = negotiations.filter(
    (n) => (findConversation(n)?.isArchived ?? false) === showArchived
  );
  const archivedCount = negotiations.filter(
    (n) => findConversation(n)?.isArchived ?? false
  ).length;

  const statusCounts: Partial<Record<string, number>> = {
    all: scopedNegotiations.length,
    pending_payment: scopedNegotiations.filter((n) => n.status === "pending_payment").length,
    in_progress: scopedNegotiations.filter((n) => n.status === "in_progress").length,
    escrow: scopedNegotiations.filter((n) => n.status === "escrow").length,
    revision: scopedNegotiations.filter((n) => n.status === "revision").length,
    approved: scopedNegotiations.filter((n) => n.status === "approved").length,
    completed: scopedNegotiations.filter((n) => n.status === "completed").length,
    cancelled: scopedNegotiations.filter((n) => n.status === "cancelled").length,
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

      // Tanpa baris percakapan, anggap belum diarsipkan — baris tetap terlihat.
      const isArchived = findConversation(n)?.isArchived ?? false;

      return matchSearch && matchStatus && isArchived === showArchived;
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

      {/* Tab Inbox / Arsip */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer border ${
            showArchived
              ? "border-border-soft text-text-muted hover:bg-neutral-50"
              : "border-transparent bg-primary text-white"
          }`}
        >
          Inbox
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer border ${
            showArchived
              ? "border-transparent bg-primary text-white"
              : "border-border-soft text-text-muted hover:bg-neutral-50"
          }`}
        >
          Arsip{archivedCount > 0 ? ` (${archivedCount})` : ""}
        </button>
      </div>

      {/* List content */}
      {filteredNegotiations.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredNegotiations.map((order) => (
            <NegotiationRoomCard
              key={order.id}
              order={order}
              isArchived={findConversation(order)?.isArchived ?? false}
              onToggleArchive={() => handleToggleArchive(order)}
            />
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
