"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { getNegotiationById, getMessagesByOrderId } from "@/services/umkm/umkm-dashboard.service";
import { NegotiationOrder, ChatMessage } from "@/types/umkm-dashboard.types";
import { formatCurrency } from "@/lib/formatters";
import { CollabPostWarningBanner } from "./CollabPostWarningBanner";
import { ChatTimeline } from "./ChatTimeline";
import { MessageComposer } from "./MessageComposer";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { EscrowStatusCard } from "./EscrowStatusCard";
import { CreatorMiniProfileCard } from "./CreatorMiniProfileCard";
import { DealChecklistCard } from "./DealChecklistCard";
import { NegotiationRoomSkeleton } from "./NegotiationRoomSkeleton";
import { NegotiationNotFoundState } from "./NegotiationNotFoundState";
import { DashboardModal } from "@/components/features/dashboard/shared";

import { SendCustomOfferModal } from "../modals/SendCustomOfferModal";
import { PaymentSimulationModal } from "../modals/PaymentSimulationModal";
import { OrderSuccessModal } from "../modals/OrderSuccessModal";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending_payment: { label: "Menunggu Pembayaran", color: "#a15b0b", bg: "#fffbeb", border: "rgba(245,158,11,.24)"  },
  escrow:          { label: "Dalam Escrow",        color: "#177b42", bg: "#f1fbf5", border: "rgba(74,222,128,.25)"  },
  in_progress:     { label: "Sedang Dikerjakan",   color: "#2d5bd1", bg: "#f0f6ff", border: "rgba(96,165,250,.25)"  },
  revision:        { label: "Revisi",              color: "#b4232a", bg: "#fff3f3", border: "rgba(248,113,113,.24)" },
  approved:        { label: "Disetujui",           color: "#177b42", bg: "#f1fbf5", border: "rgba(74,222,128,.25)"  },
  completed:       { label: "Selesai",             color: "#177b42", bg: "#f1fbf5", border: "rgba(74,222,128,.25)"  },
  cancelled:       { label: "Dibatalkan",          color: "#687386", bg: "#f8fafc", border: "rgba(148,163,184,.28)" },
};
interface NegotiationRoomPageProps {
  orderId: string;
}

export function NegotiationRoomPage({ orderId }: NegotiationRoomPageProps) {
  const [order, setOrder] = useState<NegotiationOrder | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const orderRes = await getNegotiationById(orderId);
      const msgRes = await getMessagesByOrderId(orderId);
      if (orderRes.success && orderRes.data) {
        setOrder(orderRes.data);
      } else {
        setError(orderRes.error || "Gagal memuat detail negosiasi.");
      }
      if (msgRes.success && msgRes.data) {
        setMessages(msgRes.data);
      }
    } catch {
      setError("Kesalahan memuat data Negosiasi.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId === "rc-offer-simulated") {
      const mockOrder: NegotiationOrder = {
        id: "rc-offer-simulated",
        umkmId: "umkm_001",
        creatorId: "creator_001",
        creatorName: "Ahmad Fauzi",
        creatorAvatarUrl: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=300&fit=crop",
        projectTitle: "Custom Offer: Review Sambal Bawang",
        scope: "1 video Reels/TikTok Collab Post, durasi minimal 30 hari tayang.",
        finalPrice: 1500000,
        deadline: "2026-06-25T00:00:00.000Z",
        status: "pending_payment",
        lastMessage: "Penawaran kolaborasi kustom berhasil dibuat. Menunggu persetujuan.",
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
      };
      const mockMsg: ChatMessage[] = [
        {
          id: "m_sim_1",
          orderId: "rc-offer-simulated",
          senderId: "umkm_001",
          senderRole: "umkm",
          type: "text",
          content: "Halo Ahmad, saya kirim rincian kustom offer negosiasi kita sesuai paket ya. Silakan disetujui kak.",
          isRead: true,
          createdAt: new Date(Date.now() - 30000).toISOString(),
        },
        {
          id: "m_sim_2",
          orderId: "rc-offer-simulated",
          senderId: "creator_001",
          senderRole: "creator",
          type: "offer",
          content: "Penawaran Khusus: Review Sambal Bawang",
          offerData: {
            finalPrice: 1500000,
            scope: "1 video Reels/TikTok Collab Post, durasi minimal 30 hari tayang.",
            deadline: "2026-06-25T00:00:00.000Z",
            revisionCount: 2,
          },
          isRead: true,
          createdAt: new Date(Date.now() - 10000).toISOString(),
        },
      ];
      setOrder(mockOrder);
      setMessages(mockMsg);
      setTimeout(() => setLoading(false), 500);
    } else {
      loadData();
    }
  }, [orderId, loadData]);

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `msg_local_${Date.now()}`,
      orderId,
      senderId: "umkm_001",
      senderRole: "umkm",
      type: "text",
      content: text,
      isRead: true,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    if (order) setOrder({ ...order, lastMessage: text, lastMessageAt: new Date().toISOString() });

    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `msg_reply_${Date.now()}`,
        orderId,
        senderId: order?.creatorId || "creator_001",
        senderRole: "creator",
        type: "text",
        content: "Baik kak, pesan Anda diterima. Ada tambahan instruksi lainnya?",
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, replyMsg]);
      if (order) {
        setOrder((prev) =>
          prev ? { ...prev, lastMessage: replyMsg.content, lastMessageAt: new Date().toISOString() } : null
        );
      }
    }, 1500);
  };

  const handleConfirmCustomOffer = (offer: {
    finalPrice: number;
    scope: string;
    deadline: string;
    revisionCount: number;
  }) => {
    const offerMsg: ChatMessage = {
      id: `msg_offer_${Date.now()}`,
      orderId,
      senderId: "umkm_001",
      senderRole: "umkm",
      type: "offer",
      content: `Penawaran Khusus: ${order?.projectTitle || "Kustom Offer"}`,
      offerData: offer,
      isRead: true,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, offerMsg]);
    if (order) {
      setOrder({
        ...order,
        finalPrice: offer.finalPrice,
        scope: offer.scope,
        deadline: offer.deadline,
        lastMessage: `Penawaran Khusus: ${formatCurrency(offer.finalPrice)} diajukan.`,
        lastMessageAt: new Date().toISOString(),
      });
    }
  };

  const handleConfirmPayment = () => {
    setIsPaymentModalOpen(false);
    setTimeout(() => {
      if (order) {
        setOrder({
          ...order,
          status: "escrow",
          lastMessage: "Dana pembayaran sudah diamankan di escrow. Kreator sedang mengerjakan konten.",
          lastMessageAt: new Date().toISOString(),
        });
        const systemMsg: ChatMessage = {
          id: `msg_system_${Date.now()}`,
          orderId,
          senderId: "system",
          senderRole: "system",
          type: "system",
          content: "UMKM Nadia Putri menyetujui Custom Offer dan berhasil mengamankan dana di escrow.",
          isRead: true,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, systemMsg]);
      }
      setIsSuccessModalOpen(true);
    }, 400);
  };

  if (loading) return <div className="p-4 sm:p-6 lg:p-8"><NegotiationRoomSkeleton /></div>;
  if (error || !order) return <div className="p-4 sm:p-6 lg:p-8"><NegotiationNotFoundState /></div>;

  const statusCfg = STATUS_CFG[order.status] ?? STATUS_CFG.pending_payment;

  const renderHeaderCTA = () => {
    const cls =
      "px-3 py-1.5 rounded-[10px] text-white text-[10px] font-extrabold transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0 leading-none";
    // Custom Offer dikirim lewat composer chat (tombol +); begitu offer diterima,
    // order lahir dengan status pending_payment dan CTA-nya menjadi "Bayar".
    if (order.status === "pending_payment") {
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
    if (order.status === "approved") {
      return (
        <button
          type="button"
          onClick={() => setIsVerificationModalOpen(true)}
          className={cls}
          style={{
            background: "linear-gradient(180deg,#22c55e,#16a34a)",
            boxShadow: "0 3px 8px rgba(34,197,94,.22)",
          }}
        >
          Verifikasi
        </button>
      );
    }
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
            orderStatus={order.status}
          />

          {/* Composer with quick-action (+) button */}
          <MessageComposer
            onSendMessage={handleSendMessage}
            orderStatus={order.status}
            onSendOffer={() => setIsOfferModalOpen(true)}
            onPay={() => setIsPaymentModalOpen(true)}
            onVerify={() => setIsVerificationModalOpen(true)}
          />
        </div>

        {/* RIGHT: Sidebar cards */}
        <div
          className="flex flex-col gap-3 overflow-y-auto scrollbar-thin min-h-0"
        >
          <OrderSummaryCard order={order} />
          <EscrowStatusCard orderStatus={order.status} />
          <CreatorMiniProfileCard order={order} />
          <DealChecklistCard orderStatus={order.status} />
        </div>
      </div>
      </div>

      {/* Verification modal */}
      <DashboardModal
        isOpen={isVerificationModalOpen}
        title="Verifikasi Collab Post"
        description="Memvalidasi postingan Collab Post. Tautan postingan akan dianggap valid untuk simulasi dashboard ini."
        confirmLabel="Verifikasi"
        cancelLabel="Batal"
        onClose={() => setIsVerificationModalOpen(false)}
        onConfirm={() => {
          setIsVerificationModalOpen(false);
          window.location.reload();
        }}
      />

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
    </div>
  );
}
