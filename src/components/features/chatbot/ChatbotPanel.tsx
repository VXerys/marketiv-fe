"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { account } from "@/lib/appwrite/account";
import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import {
  getChatbotSuggestions,
  type ChatbotAudience,
} from "@/services/chatbot/chatbot-guardrails";
import {
  getTivvyLoadingMessage,
  getTivvyWelcomeMessage,
  shouldShowChatbotSuggestions,
} from "@/services/chatbot/chatbot-ui";
import { ChatbotLoadingState } from "./ChatbotLoadingState";
import { ChatbotSuggestions } from "./ChatbotSuggestions";
import type { ChatMessage, ChatResponse } from "@/types/chat";

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatbotPanel({ isOpen, onClose }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentPath = usePathname();
  const welcomeAudience: ChatbotAudience = currentPath.startsWith("/dashboard/umkm")
    ? "umkm"
    : currentPath.startsWith("/dashboard/kreator")
      ? "creator"
      : "landing";
  const initialSuggestions = getChatbotSuggestions(
    welcomeAudience,
    currentPath,
    [],
    4,
  );
  const visibleSuggestions =
    messages.length === 0 ? initialSuggestions : followUpSuggestions;
  const showSuggestions = shouldShowChatbotSuggestions(
    isLoading,
    visibleSuggestions.length,
  );

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, loadingStage]);

  useEffect(() => {
    if (!isLoading) return;

    const intervalId = window.setInterval(() => {
      setLoadingStage((stage) => Math.min(stage + 1, 2));
    }, 1_800);

    return () => window.clearInterval(intervalId);
  }, [isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    if (messages.length === 0) {
      setFollowUpSuggestions(initialSuggestions);
    }
    setMessages(updatedMessages);
    setInput("");
    setLoadingStage(0);
    setIsLoading(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentPath.startsWith("/dashboard/") && !DATA_SOURCE_CONFIG.useMockData) {
        const { jwt } = await account.createJWT({ duration: 300 });
        headers.Authorization = `Bearer ${jwt}`;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: updatedMessages.slice(-30),
          currentPath,
        }),
      });

      const data = (await response.json()) as Partial<ChatResponse>;

      if (response.ok && typeof data.message === "string") {
        const assistantContent = data.message;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantContent },
        ]);
        setFollowUpSuggestions(
          Array.isArray(data.suggestions)
            ? data.suggestions.filter((item): item is string => typeof item === "string")
            : [],
        );
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Maaf, terjadi kesalahan. Silakan coba lagi dalam beberapa saat. 🙏",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, tidak dapat terhubung ke server. Periksa koneksi internetmu ya! 🔌",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  return (
    <div
      className={cn(
        "chatbot-panel-float",
        // Animation — not covered by .chatbot-panel-float CSS class
        "transition-all duration-300 ease-out origin-bottom-right",
        isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-coral to-orange-400 shrink-0">
        <div className="flex items-center gap-3">
          {/* Bot Avatar */}
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12 2C8.686 2 6 4.686 6 8v1H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v1c0 3.314 2.686 6 6 6s6-2.686 6-6v-1h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2V8c0-3.314-2.686-6-6-6z" />
              <path d="M9 13v-2" />
              <path d="M15 13v-2" />
              <path d="M10 17h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Tivvy</h3>
            <p className="text-white/80 text-xs">Asisten AI Marketiv</p>
          </div>
        </div>
        <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition-colors cursor-pointer" aria-label="Tutup chatbot">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="flex gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-coral shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M12 2C8.686 2 6 4.686 6 8v1H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v1c0 3.314 2.686 6 6 6s6-2.686 6-6v-1h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2V8c0-3.314-2.686-6-6-6z" />
                <path d="M9 13v-2" />
                <path d="M15 13v-2" />
                <path d="M10 17h4" />
              </svg>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100 max-w-[85%]">
              <p className="text-sm text-text-main leading-relaxed">
                {getTivvyWelcomeMessage(welcomeAudience)}
              </p>
              {showSuggestions && <div className="mt-3">
                <ChatbotSuggestions
                  questions={visibleSuggestions}
                  disabled={false}
                  onSelect={(question) => void sendMessage(question)}
                />
              </div>}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
            {/* Assistant Avatar */}
            {msg.role === "assistant" && (
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-coral shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M12 2C8.686 2 6 4.686 6 8v1H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v1c0 3.314 2.686 6 6 6s6-2.686 6-6v-1h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2V8c0-3.314-2.686-6-6-6z" />
                  <path d="M9 13v-2" />
                  <path d="M15 13v-2" />
                  <path d="M10 17h4" />
                </svg>
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm overflow-x-auto",
                msg.role === "user" ? "bg-brand-coral text-white rounded-tr-md" : "bg-white text-text-main rounded-tl-md border border-gray-100",
              )}
            >
              {msg.role === "assistant" ? <p className="whitespace-pre-wrap">{msg.content}</p> : <p className="whitespace-pre-wrap">{msg.content}</p>}
            </div>
          </div>
        ))}

        {messages.length > 0 && showSuggestions && (
          <div className="pl-9">
            <ChatbotSuggestions
              questions={visibleSuggestions}
              disabled={false}
              onSelect={(question) => void sendMessage(question)}
            />
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <ChatbotLoadingState message={getTivvyLoadingMessage(loadingStage)} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesanmu..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-sm text-text-main bg-gray-50 rounded-full border border-gray-200 outline-none focus:border-brand-coral/50 focus:ring-2 focus:ring-brand-coral/10 transition-all placeholder:text-text-muted disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-coral text-white hover:bg-brand-coral/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Kirim pesan"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
