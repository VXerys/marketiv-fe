"use client";

import { ChatMessage } from "@/types/umkm-dashboard.types";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isMe = message.senderRole === "umkm";

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className={cn("flex w-full mb-3.5", isMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl border text-xs font-medium leading-relaxed shadow-3xs flex flex-col justify-between space-y-1.5",
          isMe
            ? "bg-primary text-white border-primary rounded-tr-xs"
            : "bg-white text-text-primary border-border-subtle rounded-tl-xs"
        )}
      >
        {/* Message Content */}
        <p className="whitespace-pre-line leading-relaxed font-semibold">
          {message.content}
        </p>

        {/* Message Timestamp & Read state */}
        <div
          className={cn(
            "flex items-center justify-end gap-1 text-[8px] font-bold",
            isMe ? "text-white/75" : "text-text-muted"
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isMe && (
            <span>
              {message.isRead ? (
                <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 fill-current text-white/60" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
