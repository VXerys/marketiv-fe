"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getNegotiationById,
  getMessagesByConversationId,
  sendMessage,
  createOffer,
  createOrderPayment,
  cancelOrder,
  deleteOffer,
} from "@/services/umkm/umkm-dashboard.service";
import {
  getDeliverables,
  approveDeliverable,
  requestRevision,
} from "@/services/shared/deliverable.service";
import type { Deliverable } from "@/types/umkm-dashboard.types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { NegotiationOrder, ChatMessage } from "@/types/umkm-dashboard.types";
import { formatCurrency } from "@/lib/formatters";
import { CollabPostWarningBanner } from "./CollabPostWarningBanner";
import { ChatTimeline } from "./ChatTimeline";
import { MessageComposer } from "./MessageComposer";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { EscrowStatusCard } from "./EscrowStatusCard";
import { CreatorMiniProfileCard } from "./CreatorMiniProfileCard";
import { DealChecklistCard } from "./DealChecklistCard";
import { DeliverableReviewCard } from "./DeliverableReviewCard";
import { NegotiationRoomSkeleton } from "./NegotiationRoomSkeleton";
import { NegotiationNotFoundState } from "./NegotiationNotFoundState";

import { SendCustomOfferModal } from "../modals/SendCustomOfferModal";
import { PaymentSimulationModal } from "../modals/PaymentSimulationModal";
import { OrderSuccessModal } from "../modals/OrderSuccessModal";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  // Tiga tahap sebelum order ada — di Alur B order lahir paling akhir, jadi
  // sebagian besar hidup ruang ini justru berada di sini.
  chatting:        { label: "Negosiasi",           color: "#687386", bg: "#f8fafc", border: "rgba(148,163,184,.28)" },
  offer_pending:   { label: "Menunggu Kreator",    color: "#a15b0b", bg: "#fffbeb", border: "rgba(245,158,11,.24)"  },
  offer_rejected:  { label: "Penawaran Ditolak",   color: "#b4232a", bg: "#fff3f3", border: "rgba(248,113,113,.24)" },
  awaiting_order:  { label: "Menyiapkan Pesanan",  color: "#2d5bd1", bg: "#f0f6ff", border: "rgba(96,165,250,.25)"  },
  pending_payment: { label: "Menunggu Pembayaran", color: "#a15b0b", bg: "#fffbeb", border: "rgba(245,158,11,.24)"  },
  escrow:          { label: "Dalam Escrow",        color: "#177b42", bg: "#f1fbf5", border: "rgba(74,222,128,.25)"  },
  in_progress:     { label: "Sedang Dikerjakan",   color: "#2d5bd1", bg: "#f0f6ff", border: "rgba(96,165,250,.25)"  },
  revision:        { label: "Revisi",              color: "#b4232a", bg: "#fff3f3", border: "rgba(248,113,113,.24)" },
  approved:        { label: "Disetujui",           color: "#177b42", bg: "#f1fbf5", border: "rgba(74,222,128,.25)"  },
  completed:       { label: "Selesai",             color: "#177b42", bg: "#f1fbf5", border: "rgba(74,222,128,.25)"  },
  cancelled:       { label: "Dibatalkan",          color: "#687386", bg: "#f8fafc", border: "rgba(148,163,184,.28)" },
};
interface NegotiationRoomPageProps {
  /**
   * conversationId, bukan orderId. Ruang negosiasi hidup sejak percakapan
   * dimulai; order baru lahir setelah kreator menerima Custom Offer.
   */
  conversationId: string;
}

export function NegotiationRoomPage({ conversationId }: NegotiationRoomPageProps) {
  const [order, setOrder] = useState<NegotiationOrder | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [paying, setPaying] = useState(false);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);

  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [roomRes, msgRes] = await Promise.all([
        getNegotiationById(conversationId),
        getMessagesByConversationId(conversationId),
      ]);
      if (roomRes.success && roomRes.data) {
        setOrder(roomRes.data);
      } else {
        setError(roomRes.error || "Gagal memuat detail negosiasi.");
      }
      if (msgRes.success && msgRes.data) setMessages(msgRes.data);

      // Deliverable hanya ada setelah order terbentuk — sebelum itu tidak ada
      // orderId untuk di-query, dan memanggilnya cuma menghasilkan 404.
      const orderId = roomRes.success ? roomRes.data?.orderId : undefined;
      if (orderId) {
        const dlvRes = await getDeliverables(orderId);
        setDeliverables(dlvRes.success && dlvRes.data ? dlvRes.data : []);
      } else {
        setDeliverables([]);
      }
    } catch {
      setError("Kesalahan memuat data Negosiasi.");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Kirim pesan lalu muat ulang riwayatnya.
   *
   * Tidak ada balasan otomatis. Versi sebelumnya memunculkan jawaban kreator
   * palsu setelah 1,5 detik — UMKM mengira pesannya sudah dibaca orang.
   */
  const handleSendMessage = async (text: string) => {
    if (sending) return;
    setSending(true);
    const res = await sendMessage(conversationId, text);
    setSending(false);
    if (!res.success) {
      toast.error(res.error ?? "Gagal mengirim pesan.");
      return;
    }
    await loadData();
  };

  /**
   * Kirim Custom Offer. UMKM-only — kreator hanya menerima atau menolak
   * (docs/02_Modules/Offers/30_Business_Rules.md:13).
   */
  const handleConfirmCustomOffer = async (offer: {
    finalPrice: number;
    scope: string;
    deadline: string;
    revisionCount: number;
  }) => {
    if (!order) return;
    const res = await createOffer({
      conversationId,
      creatorId: order.creatorId,
      title: offer.scope.slice(0, 255) || `Kolaborasi dengan ${order.creatorName}`,
      description: offer.scope,
      price: offer.finalPrice,
      deadline: offer.deadline,
      revisionLimit: offer.revisionCount,
    });
    if (!res.success) {
      toast.error(res.error ?? "Gagal mengirim penawaran.");
      throw new Error(res.error ?? "Gagal mengirim penawaran.");
    }
    setIsOfferModalOpen(false);
    toast.success("Penawaran terkirim. Menunggu jawaban kreator.");
    await loadData();
  };

  /**
   * Bayar order → Snap Midtrans.
   *
   * Escrow TIDAK di-set di sini. Rantainya asinkron: webhook Midtrans menandai
   * payment `paid`, event itu memicu `create-escrow`, dan barulah order pindah
   * ke `in_progress`. Versi sebelumnya menyetel status "escrow" secara lokal
   * setelah 400ms tanpa uang berpindah sama sekali.
   */
  const handleConfirmPayment = async () => {
    if (!order?.orderId || paying) return;
    setPaying(true);
    const res = await createOrderPayment({ orderId: order.orderId, amount: order.finalPrice });
    setPaying(false);
    if (!res.success || !res.data) {
      toast.error(res.error ?? "Gagal membuat pembayaran.");
      return;
    }
    setIsPaymentModalOpen(false);

    if (res.data.redirectUrl) {
      window.location.href = res.data.redirectUrl;
      return;
    }
    setIsSuccessModalOpen(true);
    await loadData();
  };

  /**
   * Tarik kembali penawaran yang belum dijawab kreator (s35-ui-offer).
   *
   * Dulu ditunda karena `ChatMessage.offerData` tidak membawa `offerId`.
   * Sekarang membawanya — kartu offer di chat di-join ke baris `offers`.
   */
  const handleDeleteOffer = async (offerId: string) => {
    const res = await deleteOffer(offerId);
    if (!res.success) {
      toast.error(res.error ?? "Gagal menarik penawaran.");
      return;
    }
    toast.success("Penawaran ditarik.");
    await loadData();
  };

  /**
   * Setujui hasil kerja.
   *
   * ⚠️ INI YANG MENCAIRKAN DANA. Tulisan `status: "approved"` memicu
   * `release-escrow`, yang memindahkan escrow ke wallet kreator dikurangi fee
   * 2% dan menandai order `completed` — semuanya ASINKRON lewat event database.
   * Karena itu hasilnya dimuat ulang, bukan diasumsikan.
   */
  const handleApproveDeliverable = async () => {
    const latest = deliverables[deliverables.length - 1];
    if (!order?.orderId || !latest || reviewing) return;

    setReviewing(true);
    const res = await approveDeliverable(order.orderId, latest.id);
    setReviewing(false);

    if (!res.success) {
      toast.error(res.error ?? "Gagal menyetujui deliverable.");
      throw new Error(res.error ?? "Gagal menyetujui deliverable.");
    }
    setIsApproveOpen(false);
    toast.success("Deliverable disetujui. Dana escrow sedang dilepaskan ke kreator.");
    await loadData();
  };

  /** Minta revisi. Jumlahnya dibatasi `revisionLimit` dari offer. */
  const handleRequestRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order?.orderId || reviewing) return;

    const message = revisionMessage.trim();
    if (!message) {
      toast.error("Jelaskan dulu apa yang perlu diperbaiki.");
      return;
    }

    setReviewing(true);
    const res = await requestRevision({ orderId: order.orderId, message });
    setReviewing(false);

    if (!res.success) {
      toast.error(res.error ?? "Gagal meminta revisi.");
      return;
    }
    setIsRevisionOpen(false);
    setRevisionMessage("");
    toast.success("Permintaan revisi terkirim ke kreator.");
    await loadData();
  };

  /**
   * Batalkan pesanan yang belum dibayar. Muat ulang, bukan set status lokal —
   * `cancelOrder` bisa ditolak backend dan status lokal akan berbohong.
   * Lempar ulang saat gagal supaya ConfirmDialog tetap terbuka.
   */
  const handleCancelOrder = async () => {
    if (!order?.orderId) return;
    const res = await cancelOrder(order.orderId);
    if (!res.success) {
      toast.error(res.error ?? "Gagal membatalkan pesanan.");
      throw new Error(res.error ?? "Gagal membatalkan pesanan.");
    }
    toast.success("Pesanan dibatalkan.");
    await loadData();
  };

  if (loading) return <div className="p-4 sm:p-6 lg:p-8"><NegotiationRoomSkeleton /></div>;
  if (error || !order) return <div className="p-4 sm:p-6 lg:p-8"><NegotiationNotFoundState /></div>;

  const statusCfg = STATUS_CFG[order.stage] ?? STATUS_CFG.chatting;

  const renderHeaderCTA = () => {
    const cls =
      "px-3 py-1.5 rounded-[10px] text-white text-[10px] font-extrabold transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0 leading-none";
    // Custom Offer dikirim lewat composer chat (tombol +); begitu offer diterima,
    // order lahir dengan status pending_payment dan CTA-nya menjadi "Bayar".
    if (order.stage === "pending_payment") {
      return (
        <button
          type="button"
          onClick={() => setIsPaymentModalOpen(true)}
          className={cls}
          style={{
            background: "linear-gradient(180deg,#f97316,#ea580c)",
            boxShadow: "0 3px 8px rgba(249,115,22,.28)",
          }}
        >
          Bayar
        </button>
      );
    }
    // CTA "Verifikasi" dibuang bersama modalnya: yang lama hanya memanggil
    // window.location.reload() dan menyebut dirinya "simulasi dashboard ini".
    // Approve deliverable yang sebenarnya masuk s4-rc-approve.
    return null;
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-5 sm:pb-5 lg:pb-5 h-[calc(100svh-80px)] flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col gap-3 max-w-7xl w-full mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/umkm/negosiasi"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#737f91] hover:text-[#f97316] transition-colors w-fit group shrink-0"
      >
        <svg
          className="w-4 h-4 shrink-0 group-hover:-translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Negosiasi
      </Link>

      {/* Main grid: chat left, sidebar right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 flex-1 min-h-0 items-stretch">

        {/* LEFT: Chat pane */}
        <div
          className="flex flex-col overflow-hidden min-h-0"
          style={{
            borderRadius: 22,
            border: "1px solid rgba(17,24,39,.08)",
            background:
              "radial-gradient(circle at 100% 0%, rgba(30,58,95,.04), transparent 16rem), #f8fafc",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,.8), 0 8px 28px rgba(15,23,42,.06)",
          }}
        >
          {/* Chat header — creator identity + status */}
          <div
            className="shrink-0 px-4 py-3 border-b flex items-center justify-between gap-3 bg-white"
            style={{ borderColor: "rgba(17,24,39,.07)" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-[12px] overflow-hidden bg-neutral-100 border border-neutral-200/40">
                  <Image
                    src={order.creatorAvatarUrl}
                    alt={order.creatorName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-[#182033] leading-tight truncate">
                  {order.creatorName}
                </h4>
                <p className="text-[10px] font-bold text-[#737f91] mt-0.5 truncate max-w-[180px] sm:max-w-none">
                  {order.projectTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider hidden sm:inline"
                style={{
                  color: statusCfg.color,
                  background: statusCfg.bg,
                  border: `1px solid ${statusCfg.border}`,
                }}
              >
                {statusCfg.label}
              </span>
              {renderHeaderCTA()}
            </div>
          </div>

          {/* Collab post warning banner */}
          <CollabPostWarningBanner compact />

          {/* Messages feed — fills remaining space */}
          <ChatTimeline
            messages={messages}
            onPayOffer={() => setIsPaymentModalOpen(true)}
            onDeleteOffer={handleDeleteOffer}
            stage={order.stage}
            activeOfferId={order.offerId}
          />

          {/* Composer with quick-action (+) button */}
          <MessageComposer
            onSendMessage={handleSendMessage}
            stage={order.stage}
            sending={sending}
            onSendOffer={() => setIsOfferModalOpen(true)}
            onPay={() => setIsPaymentModalOpen(true)}
          />
        </div>

        {/* RIGHT: Sidebar cards */}
        <div
          className="flex flex-col gap-3 overflow-y-auto scrollbar-thin min-h-0"
        >
          <OrderSummaryCard order={order} onCancelOrder={() => setIsCancelOrderOpen(true)} />
          <DeliverableReviewCard
            deliverables={deliverables}
            canReview={order.stage === "in_progress" || order.stage === "revision"}
            busy={reviewing}
            onApprove={() => setIsApproveOpen(true)}
            onRequestRevision={() => setIsRevisionOpen(true)}
          />
          <EscrowStatusCard orderStatus={order.stage} />
          <CreatorMiniProfileCard order={order} />
          <DealChecklistCard orderStatus={order.stage} />
        </div>
      </div>
      </div>

      {isOfferModalOpen && (
        <SendCustomOfferModal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          onConfirm={handleConfirmCustomOffer}
          creatorName={order.creatorName}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentSimulationModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={handleConfirmPayment}
          finalPrice={order.finalPrice}
        />
      )}

      {isSuccessModalOpen && (
        <OrderSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          onConfirm={() => setIsSuccessModalOpen(false)}
        />
      )}

      {isCancelOrderOpen && (
        <ConfirmDialog
          open={isCancelOrderOpen}
          onClose={() => setIsCancelOrderOpen(false)}
          title="Batalkan Pesanan Ini?"
          description={
            <>
              Pesanan{" "}
              <span className="font-semibold text-text-primary">
                &quot;{order.projectTitle}&quot;
              </span>{" "}
              dengan {order.creatorName} akan ditandai dibatalkan.
            </>
          }
          note="Pesanan belum dibayar, jadi tidak ada dana yang tertahan. Riwayatnya tetap tersimpan — pesanan tidak dihapus. Untuk bekerja sama lagi, kirim penawaran baru."
          confirmLabel="Batalkan Pesanan"
          tone="warning"
          onConfirm={handleCancelOrder}
        />
      )}

      {isApproveOpen && (
        <ConfirmDialog
          open={isApproveOpen}
          onClose={() => setIsApproveOpen(false)}
          title="Setujui Hasil Kerja Ini?"
          description={
            <>
              Versi {deliverables[deliverables.length - 1]?.version} dari{" "}
              <span className="font-semibold text-text-primary">{order.creatorName}</span> akan
              ditandai disetujui.
            </>
          }
          note={`Dana escrow ${formatCurrency(order.finalPrice)} akan dilepaskan ke kreator dan pesanan ditandai selesai. Langkah ini TIDAK bisa dibatalkan — setelah dana pindah, pengembaliannya hanya lewat sengketa.`}
          acknowledgement="Saya sudah memeriksa hasil kerjanya dan setuju dana dilepaskan."
          confirmLabel="Setujui & Lepaskan Dana"
          tone="warning"
          onConfirm={handleApproveDeliverable}
        />
      )}

      {isRevisionOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-neutral-200/50 shadow-[0_32px_80px_rgba(15,23,42,.20)] p-6 max-w-md w-full">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-base font-black text-[#182033]">Minta Revisi</h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                  {order.projectTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRevisionOpen(false)}
                className="p-1.5 rounded-[10px] text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRequestRevision} className="space-y-4">
              <div>
                <label htmlFor="revision-message" className="block text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">
                  Apa yang perlu diperbaiki?
                </label>
                <textarea
                  id="revision-message"
                  rows={4}
                  required
                  placeholder="Contoh: Logo brand belum terlihat jelas di bagian akhir video. Mohon diperbesar."
                  value={revisionMessage}
                  onChange={(e) => setRevisionMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-[14px] text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all font-semibold text-neutral-800 placeholder-neutral-400 resize-none leading-relaxed"
                />
                <p className="text-[9px] text-neutral-400 font-bold mt-1.5 leading-relaxed">
                  Sespesifik mungkin — jumlah revisi dibatasi kesepakatan awal
                  {order.revisionCount ? ` (maksimal ${order.revisionCount}×)` : ""}.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRevisionOpen(false)}
                  disabled={reviewing}
                  className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-extrabold text-xs rounded-full transition-all cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="flex-1 py-3 text-white font-extrabold text-xs rounded-full transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(180deg,#f97316,#ea580c)", boxShadow: "0 4px 14px rgba(249,115,22,.28)" }}
                >
                  {reviewing ? "Mengirim…" : "Kirim Permintaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
