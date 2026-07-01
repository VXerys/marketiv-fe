"use client";

import { ChatMessage } from "@/types/umkm-dashboard.types";

interface SystemMessageCardProps {
  message: ChatMessage;
}

export function SystemMessageCard({ message }: SystemMessageCardProps) {
  return (
    <div className="flex justify-center my-4 select-none">
      <div className="rounded-xl bg-neutral-100 border border-neutral-200/50 px-4 py-1.5 text-center text-[10px] font-extrabold text-text-secondary max-w-md shadow-3xs leading-relaxed">
        {message.content}
      </div>
    </div>
  );
}
