"use client";

import { useState, useEffect } from "react";
import { getNegotiationById, getMessagesByOrderId } from "@/services/umkm/umkm-dashboard.service";
import { NegotiationOrder, ChatMessage } from "@/types/umkm-dashboard.types";
import { formatCurrency } from "@/lib/formatters";
import { NegotiationRoomHeader } from "./NegotiationRoomHeader";
import { CollabPostWarningBanner } from "./CollabPostWarningBanner";
import { ChatTimeline } from "./ChatTimeline";
import { MessageComposer } from "./MessageComposer";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { EscrowStatusCard } from "./EscrowStatusCard";
import { CreatorMiniProfileCard } from "./CreatorMiniProfileCard";
import { DealChecklistCard } from "./DealChecklistCard";
import { NegotiationRoomSkeleton } from "./NegotiationRoomSkeleton";
import { NegotiationNotFoundState } from "./NegotiationNotFoundState";

// Modals
import { SendCustomOfferModal } from "../modals/SendCustomOfferModal";
import { PaymentSimulationModal } from "../modals/PaymentSimulationModal";
import { OrderSuccessModal } from "../modals/OrderSuccessModal";

interface NegotiationRoomPageProps {
  orderId: string;
}

export function NegotiationRoomPage({ orderId }: NegotiationRoomPageProps) {
  const [order, setOrder] = useState<NegotiationOrder | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal control states
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const loadData = async () => {
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
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }
  };

  useEffect(() => {
    // If orderId is "rc-offer-simulated", let's mock a freshly created negotiation state
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
        status: "negotiation",
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
          type: "custom_offer",
          content: "Penawaran Khusus: Review Sambal Bawang",
          offerData: {
            finalPrice: 1500000,
            scope: "1 video Reels/TikTok Collab Post, durasi minimal 30 hari tayang.",
            deadline: "2026-06-25T00:00:00.000Z",
            revisionCount: 2,
          },
          isRead: true,
          createdAt: new Date(Date.now() - 10000).toISOString(),
        }
      ];

      setOrder(mockOrder);
      setMessages(mockMsg);
      setTimeout(() => setLoading(false), 500);
    } else {
      loadData();
    }
  }, [orderId]);

  // Message composing handler (local state append simulation)
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

    // Update last message in order summary locally
    if (order) {
      setOrder({
        ...order,
        lastMessage: text,
        lastMessageAt: new Date().toISOString(),
      });
    }

    // Creator auto-reply mockup simulator after 1.5 seconds for interactive display
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
        setOrder((prev) => prev ? {
          ...prev,
          lastMessage: "Baik kak, pesan Anda diterima. Ada tambahan instruksi lainnya?",
          lastMessageAt: new Date().toISOString(),
        } : null);
      }
    }, 1500);
  };

  // Custom Offer draft handler
  const handleConfirmCustomOffer = (offer: { finalPrice: number; scope: string; deadline: string; revisionCount: number }) => {
    const offerMsg: ChatMessage = {
      id: `msg_offer_${Date.now()}`,
      orderId,
      senderId: "umkm_001",
      senderRole: "umkm",
      type: "custom_offer",
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

  // Payout Escrow confirm handler
  const handleConfirmPayment = () => {
    setIsPaymentModalOpen(false);
    
    // Simulate API webhook transaction verification delay
    setTimeout(() => {
      if (order) {
        setOrder({
          ...order,
          status: "escrow", // Update status to Escrow
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

  if (loading) {
    return <NegotiationRoomSkeleton />;
  }

  if (error || !order) {
    return <NegotiationNotFoundState />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <NegotiationRoomHeader
        order={order}
        onSendOffer={() => setIsOfferModalOpen(true)}
        onPay={() => setIsPaymentModalOpen(true)}
      />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side Chat Workspace (8 columns) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Collab Post alert banner */}
          <CollabPostWarningBanner />

          {/* Messages Feed Viewport */}
          <ChatTimeline
            messages={messages}
            onPayOffer={() => setIsPaymentModalOpen(true)}
            orderStatus={order.status}
          />

          {/* Composer */}
          <MessageComposer onSendMessage={handleSendMessage} />
        </div>

        {/* Right Side Sidebar (4 columns) */}
        <div className="space-y-6">
          {/* Order Summary details */}
          <OrderSummaryCard order={order} />

          {/* Escrow progression stages */}
          <EscrowStatusCard orderStatus={order.status} />

          {/* Creator Profile short summary */}
          <CreatorMiniProfileCard order={order} />

          {/* Deal deliverables checklists */}
          <DealChecklistCard orderStatus={order.status} />
        </div>

      </div>

      {/* Dialog Modals */}
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
