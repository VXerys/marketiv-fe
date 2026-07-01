"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types/umkm-dashboard.types";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { SystemMessageCard } from "./SystemMessageCard";
import { CustomOfferCard } from "./CustomOfferCard";

interface ChatTimelineProps {
  messages: ChatMessage[];
  onPayOffer: () => void;
  orderStatus: string;
}

export function ChatTimeline({ messages, onPayOffer, orderStatus }: ChatTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="rounded-2xl border border-border-soft bg-neutral-50/25 p-4 sm:p-5 min-h-[420px] max-h-[500px] overflow-y-auto scrollbar-thin">
      {messages.length > 0 ? (
        <div className="space-y-1">
          {messages.map((msg) => {
            if (msg.type === "system") {
              return <SystemMessageCard key={msg.id} message={msg} />;
            }
            if (msg.type === "custom_offer") {
              return (
                <CustomOfferCard
                  key={msg.id}
                  message={msg}
                  onPay={onPayOffer}
                  orderStatus={orderStatus}
                />
              );
            }
            return <ChatMessageBubble key={msg.id} message={msg} />;
          })}
          <div ref={bottomRef} />
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-center p-8 select-none">
          <div className="space-y-1">
            <svg className="w-8 h-8 mx-auto text-text-muted opacity-40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-xs text-text-muted font-bold">Kirim pesan pertama Anda untuk memulai diskusi.</p>
          </div>
        </div>
      )}
    </div>
  );
}
