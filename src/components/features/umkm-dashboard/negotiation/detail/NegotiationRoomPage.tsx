"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  getNegotiationById,
  getMessagesByConversationId,
  sendMessage,
  createOffer,
  getCreatorRateCards,
  createOrderPayment,
  cancelOrder,
  deleteOffer,
} from "@/services/umkm/umkm-dashboard.service";
import {
  getDeliverables,
  approveDeliverable,
  requestRevision,
} from "@/services/shared/deliverable.service";
import { markConversationRead } from "@/services/shared/conversation.service";
import type { Deliverable } from "@/types/umkm-dashboard.types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { toast } from "sonner";
import { NegotiationOrder, ChatMessage, RateCardPackage } from "@/types/umkm-dashboard.types";
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
import { NegotiationErrorState } from "../NegotiationErrorState";
import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { realtimeClient, tableChannels } from "@/lib/appwrite/realtime";
import {
  buildPaymentReturnUrl,
  isPaymentConfirmedStage,
} from "@/lib/negotiation/room-sync";
import { canStartNewDeal } from "@/lib/negotiation/deal-stage";
import { useNegotiationRoomSync } from "@/lib/negotiation/use-negotiation-room-sync";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedPackageId = searchParams.get("packageId");
  const [order, setOrder] = useState<NegotiationOrder | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [paying, setPaying] = useState(false);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [paymentVerification, setPaymentVerification] = useState<"idle" | "verifying" | "unresolved">("idle");
  const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);

  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [packagePrefill, setPackagePrefill] = useState<RateCardPackage | null>(null);
  const [packageContextWarning, setPackageContextWarning] = useState<string | null>(null);
  const loadInFlightRef = useRef(false);

  const loadData = useCallback(async (initial = false) => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    if (initial) {
      setLoading(true);
      setError(null);
    }
    try {
      const [roomRes, msgRes] = await Promise.all([
        getNegotiationById(conversationId),
        getMessagesByConversationId(conversationId),
      ]);
      if (roomRes.success && roomRes.data) {
        setOrder(roomRes.data);
      } else {
        if (initial) setError(roomRes.error || "Gagal memuat detail negosiasi.");
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
      if (initial) setError("Kesalahan memuat data Negosiasi.");
    } finally {
      loadInFlightRef.current = false;
      if (initial) setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void (async () => {
      await loadData(true);
      // Membuka ruang = pesannya terbaca. Tanpa ini `messages.read_at` tetap
      // kosong selamanya dan badge belum-dibaca tidak pernah turun. Kegagalannya
      // tidak boleh menahan chat, jadi hasilnya sengaja diabaikan.
      void markConversationRead(conversationId);
    })();
  }, [loadData, conversationId]);

  const reloadAuthoritativeRoom = useCallback(async () => {
    await loadData(false);
  }, [loadData]);

  const handlePaymentVerificationTimeout = useCallback(() => {
    setPaymentVerification("unresolved");
  }, []);

  useNegotiationRoomSync({
    stage: order?.stage,
    enabled: !DATA_SOURCE_CONFIG.useMockData,
    paymentVerification: paymentVerification === "verifying",
    reload: reloadAuthoritativeRoom,
    onPaymentVerificationTimeout: handlePaymentVerificationTimeout,
  });

  useEffect(() => {
    if (DATA_SOURCE_CONFIG.useMockData) return;
    const channels = tableChannels("messages");
    if (channels.length === 0) return;

    return realtimeClient.subscribe(channels, (event) => {
      const payload = event.payload as { conversation_id?: string };
      if (payload.conversation_id === conversationId) void reloadAuthoritativeRoom();
    });
  }, [conversationId, reloadAuthoritativeRoom]);

  useEffect(() => {
    if (searchParams.get("payment_return") !== "1") return;
    setPaymentVerification("verifying");
    void reloadAuthoritativeRoom();
  }, [reloadAuthoritativeRoom, searchParams]);

  useEffect(() => {
    // URL packageId menjadi kandidat offer baru hanya saat tidak ada deal aktif.
    // Provenance deal aktif/lama tetap datang dari snapshot DTO immutable.
    if (!selectedPackageId || !order?.creatorId || !canStartNewDeal(order.stage)) {
      setPackagePrefill(null);
      setPackageContextWarning(null);
      return;
    }
    let active = true;
    void (async () => {
      const result = await getCreatorRateCards(order.creatorId);
      if (!active) return;
      const selected = result.data?.find((pkg) => pkg.id === selectedPackageId) ?? null;
      setPackagePrefill(selected);
      setPackageContextWarning(selected ? null : "Paket acuan tidak tersedia atau tidak lagi dipublikasikan. Kamu tetap dapat membuat penawaran tanpa paket.");
    })();
    return () => { active = false; };
  }, [order?.creatorId, order?.stage, selectedPackageId]);

  useEffect(() => {
    if (paymentVerification !== "verifying" || !isPaymentConfirmedStage(order?.stage)) return;
    setPaymentVerification("idle");
    setIsSuccessModalOpen(true);
    router.replace(pathname, { scroll: false });
  }, [order?.stage, pathname, paymentVerification, router]);

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
    packageId?: string;
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
      ...(offer.packageId ? { packageId: offer.packageId } : {}),
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
    const res = await createOrderPayment({
      orderId: order.orderId,
      amount: order.finalPrice,
      finishUrl: typeof window !== "undefined" ? buildPaymentReturnUrl(window.location.href) : undefined,
    });
    setPaying(false);
    if (!res.success || !res.data) {
      if (res.reason === "payment_preparing" || res.reason === "payment_already_paid") {
        setIsPaymentModalOpen(false);
        setPaymentVerification("verifying");
        await reloadAuthoritativeRoom();
      }
      toast.error(res.error ?? "Gagal membuat pembayaran.");
      return;
    }
    setIsPaymentModalOpen(false);

    if (res.data.redirectUrl) {
      window.location.href = res.data.redirectUrl;
      return;
    }
    setPaymentVerification("verifying");
    toast.error("Pembayaran masih disiapkan. Jangan buat pembayaran baru; periksa lagi sebentar.");
    await reloadAuthoritativeRoom();
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

  /** UMKM baru dapat menyetujui setelah validasi manual Admin bernilai valid. */
  const handleApproveDeliverable = async () => {
    const latest = deliverables[deliverables.length - 1];
    if (!order?.orderId || !latest || reviewing) return;
    if (order.deliverableValidation?.status !== "valid") {
      toast.error("Menunggu validasi manual Admin Marketiv sebelum persetujuan UMKM.");
      return;
    }

    setReviewing(true);
    const res = await approveDeliverable(order.orderId, latest.id);
    setReviewing(false);

    if (!res.success) {
      toast.error(res.error ?? "Gagal menyetujui deliverable.");
      throw new Error(res.error ?? "Gagal menyetujui deliverable.");
    }
    setIsApproveOpen(false);
    toast.success("Deliverable disetujui. Sistem sedang memeriksa syarat pelepasan escrow.");
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
  if (error) return <div className="p-4 sm:p-6 lg:p-8"><NegotiationErrorState message={error} onRetry={loadData} /></div>;
  if (!order) return <div className="p-4 sm:p-6 lg:p-8"><NegotiationNotFoundState /></div>;

  const statusCfg = STATUS_CFG[order.stage] ?? STATUS_CFG.chatting;
  const hasNewDealPackageCandidate = Boolean(
    selectedPackageId && canStartNewDeal(order.stage)
  );

  const renderHeaderCTA = () => {
    const cls =
      "px-3 py-1.5 rounded-[10px] text-white text-[10px] font-extrabold transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0 leading-none";
    // Custom Offer dikirim lewat composer chat (tombol +); begitu offer diterima,
    // order lahir dengan status pending_payment dan CTA-nya menjadi "Bayar".
    if (order.stage === "pending_payment" && paymentVerification === "idle") {
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
          Bayar dengan Midtrans
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
      <div className={`flex-1 min-h-0 flex flex-col gap-3 w-full mx-auto ${isChatFullscreen ? "max-w-none" : "max-w-7xl"}`}>
      {/* Back link */}
      {!isChatFullscreen && (
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
      )}

      {!isChatFullscreen && (
        packagePrefill ||
        (!hasNewDealPackageCandidate && order.packageContext) ||
        packageContextWarning
      ) && (
        <div className="rounded-[18px] border border-orange-200 bg-orange-50 px-4 py-3 text-xs">
          {packageContextWarning ? (
            <p className="font-semibold text-orange-800">{packageContextWarning}</p>
          ) : packagePrefill ? (
            <><p className="font-extrabold text-orange-950">Paket Acuan: {packagePrefill.name}</p><p className="text-orange-800 mt-1">Harga paket {formatCurrency(packagePrefill.price)}. Rincian masih dapat dinegosiasikan sebelum penawaran dikirim.</p></>
          ) : order.packageContext ? (
            <><p className="font-extrabold text-orange-950">Kesepakatan Final</p><p className="text-orange-800 mt-1">Berawal dari paket {order.packageContext.name} ({formatCurrency(order.packageContext.basePrice)}). Harga final tetap {formatCurrency(order.finalPrice)}.</p></>
          ) : null}
        </div>
      )}

      {order.stage === "pending_payment" && !isChatFullscreen && (
        <div className="rounded-[18px] border border-orange-200 bg-orange-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-orange-900">Pembayaran diperlukan untuk memulai pekerjaan</p>
            <p className="text-[11px] font-semibold text-orange-700 mt-0.5">
              {paymentVerification === "verifying"
                ? "Pembayaran sedang diperiksa/disiapkan. Jangan membuat pembayaran baru."
                : paymentVerification === "unresolved"
                  ? "Belum ada konfirmasi server dari Midtrans. Periksa lagi sebelum mencoba tindakan lain."
                  : `Bayar ${formatCurrency(order.finalPrice)} melalui Midtrans.`}
            </p>
          </div>
          {paymentVerification === "unresolved" ? (
            <button type="button" onClick={() => { setPaymentVerification("verifying"); void reloadAuthoritativeRoom(); }} className="px-4 py-2 rounded-xl bg-white border border-orange-300 text-orange-800 text-xs font-extrabold cursor-pointer">
              Periksa lagi
            </button>
          ) : paymentVerification === "idle" ? (
            <button type="button" onClick={() => setIsPaymentModalOpen(true)} className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-extrabold cursor-pointer">
              Bayar dengan Midtrans
            </button>
          ) : null}
        </div>
      )}

      {/* Main grid: chat left, sidebar right */}
      <div className={`grid grid-cols-1 gap-4 flex-1 min-h-0 items-stretch ${isChatFullscreen ? "" : "lg:grid-cols-[1fr_360px]"}`}>

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
                <div className="w-10 h-10 rounded-[12px] overflow-hidden bg-neutral-100 border border-neutral-200/40 flex items-center justify-center font-black text-neutral-300 text-base">
                  {order.creatorAvatarUrl ? (
                    <Image
                      src={order.creatorAvatarUrl}
                      alt={order.creatorName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <span>{order.creatorName.charAt(0)}</span>
                  )}
                </div>
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
              <button
                type="button"
                onClick={() => setIsChatFullscreen((v) => !v)}
                aria-label={isChatFullscreen ? "Keluar dari fullscreen chat" : "Fullscreen chat"}
                title={isChatFullscreen ? "Keluar fullscreen" : "Fullscreen chat"}
                className="w-9 h-9 rounded-[12px] border border-neutral-200/70 bg-white text-[#737f91] hover:text-[#f97316] hover:border-orange-200 hover:bg-orange-50/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                {isChatFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collab post warning banner */}
          <CollabPostWarningBanner compact />

          {/* Messages feed — fills remaining space */}
          <ChatTimeline
            messages={messages}
            onPayOffer={() => paymentVerification === "idle" && setIsPaymentModalOpen(true)}
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
            onPay={() => paymentVerification === "idle" && setIsPaymentModalOpen(true)}
          />
        </div>

        {/* RIGHT: Sidebar cards */}
        {!isChatFullscreen && (
          <div
            className="flex flex-col gap-3 overflow-y-auto scrollbar-thin min-h-0"
          >
            <OrderSummaryCard order={order} onCancelOrder={() => setIsCancelOrderOpen(true)} />
            <DeliverableReviewCard
              deliverables={deliverables}
              canReview={(order.stage === "in_progress" || order.stage === "revision") && order.deliverableValidation?.status === "valid"}
              validationStatus={order.deliverableValidation?.status}
              validationNotes={order.deliverableValidation?.reviewNotes}
              busy={reviewing}
              onApprove={() => setIsApproveOpen(true)}
              onRequestRevision={() => setIsRevisionOpen(true)}
            />
            <EscrowStatusCard orderStatus={order.stage} />
            <CreatorMiniProfileCard order={order} />
            <DealChecklistCard stage={order.stage} />
          </div>
        )}
      </div>
      </div>

      {isOfferModalOpen && (
        <SendCustomOfferModal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          onConfirm={handleConfirmCustomOffer}
          creatorName={order.creatorName}
          packageContext={packagePrefill ? {
            id: packagePrefill.id,
            name: packagePrefill.name,
            price: packagePrefill.price,
            description: packagePrefill.description,
            revisionLimit: packagePrefill.revisionLimit,
            deliveryDays: packagePrefill.estimatedDays,
          } : undefined}
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
        <ResponsiveModal open={isRevisionOpen} onOpenChange={(open) => !open && setIsRevisionOpen(false)}>
          <ResponsiveModalContent className="max-w-md w-full rounded-[24px] border border-neutral-200/50 p-6">
            <ResponsiveModalHeader className="sr-only">
              <ResponsiveModalTitle>Minta Revisi</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Kirim permintaan revisi hasil kerja kreator.
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>
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
          </ResponsiveModalContent>
        </ResponsiveModal>
      )}
    </div>
  );
}
