"use client";

import { ChatMessage } from "@/types/umkm-dashboard.types";

interface SystemMessageCardProps {
  message: ChatMessage;
}

export function SystemMessageCard({ message }: SystemMessageCardProps) {
  return (
    <div className="flex justify-center my-4 select-none">
      <div className="system-note">
        {message.content}
      </div>
    </div>
  );
}
