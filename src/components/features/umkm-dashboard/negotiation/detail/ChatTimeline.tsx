"use client";

import { useEffect, useRef } from "react";
import { ChatMessage, NegotiationStage } from "@/types/umkm-dashboard.types";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { SystemMessageCard } from "./SystemMessageCard";
import { CustomOfferCard } from "./CustomOfferCard";

interface ChatTimelineProps {
  messages: ChatMessage[];
  onPayOffer: () => void;
  onDeleteOffer?: (offerId: string) => void;
  stage: NegotiationStage;
  /** offerId yang sedang berlaku — kartu offer lama tidak dapat aksi. */
  activeOfferId?: string;
}

export function ChatTimeline({
  messages,
  onPayOffer,
  onDeleteOffer,
  stage,
  activeOfferId,
}: ChatTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-4">
      {messages.length > 0 ? (
        <div className="space-y-1">
          {/* Date divider label - pinned at top */}
          <div className="flex items-center gap-2 my-3 select-none">
            <div className="flex-1 h-px bg-border-soft/60" />
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider px-2 py-1 rounded-full bg-neutral-100/80">
              Percakapan Negosiasi
            </span>
            <div className="flex-1 h-px bg-border-soft/60" />
          </div>

          {messages.map((msg) => {
            if (msg.type === "system") {
              return <SystemMessageCard key={msg.id} message={msg} />;
            }
            if (msg.type === "offer") {
              return (
                <CustomOfferCard
                  key={msg.id}
                  message={msg}
                  onPay={onPayOffer}
                  onDeleteOffer={onDeleteOffer}
                  stage={stage}
                  activeOfferId={activeOfferId}
                />
              );
            }
            return <ChatMessageBubble key={msg.id} message={msg} />;
          })}
          <div ref={bottomRef} />
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-center p-8 select-none">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-neutral-100 border border-neutral-200/50 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-text-muted opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-text-secondary">Belum Ada Pesan</p>
              <p className="text-[10px] text-text-muted font-semibold">Kirim pesan pertama Anda untuk memulai diskusi negosiasi.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
