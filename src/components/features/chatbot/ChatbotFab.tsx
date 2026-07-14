"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChatbotPanel } from "@/components/features/chatbot/ChatbotPanel";

export function ChatbotFab() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Panel */}
      <ChatbotPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* FAB Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle AI Message Bot"
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "flex items-center justify-center",
          "w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18",
          "rounded-full bg-brand-coral shadow-2xl",
          "hover:scale-110 transition-all duration-200",
          "border-4 border-white/20 cursor-pointer",
        )}
      >
        {/* Toggle between robot icon and close icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9", "transition-transform duration-300", isOpen && "rotate-90")}>
          {isOpen ? (
            <>
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </>
          ) : (
            <>
              <path d="M12 2C8.686 2 6 4.686 6 8v1H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v1c0 3.314 2.686 6 6 6s6-2.686 6-6v-1h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2V8c0-3.314-2.686-6-6-6z" />
              <path d="M9 13v-2" />
              <path d="M15 13v-2" />
              <path d="M10 17h4" />
            </>
          )}
        </svg>
      </button>
    </>
  );
}
