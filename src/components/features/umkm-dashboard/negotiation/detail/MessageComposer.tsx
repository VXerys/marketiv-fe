"use client";

import { useState } from "react";

interface MessageComposerProps {
  onSendMessage: (content: string) => void;
}

export function MessageComposer({ onSendMessage }: MessageComposerProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSendMessage(content.trim());
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!content.trim()) return;
      onSendMessage(content.trim());
      setContent("");
    }
  };

  const canSend = content.trim().length > 0;

  return (
    <div
      className="shrink-0 px-4 py-3 select-none"
      style={{
        borderTop: "1px solid rgba(17,24,39,.07)",
        background: "rgba(255,255,255,.75)",
        backdropFilter: "blur(8px)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 items-center px-3 py-2 bg-white rounded-2xl transition-all duration-200 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,.08)]"
        style={{
          border: "1px solid rgba(17,24,39,.08)",
          boxShadow: "0 2px 8px rgba(15,23,42,.04)",
        }}
      >
        <input
          type="text"
          placeholder="Tulis pesan negosiasi Anda di sini..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1.5 bg-transparent text-xs font-semibold focus:outline-none text-[#182033] placeholder:text-[#737f91]/55"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="px-4 py-2 rounded-xl text-white text-xs font-extrabold transition-all duration-200 select-none flex items-center gap-1.5 shrink-0 disabled:cursor-not-allowed"
          style={
            canSend
              ? { background: "linear-gradient(180deg,#f97316,#ea580c)", boxShadow: "0 3px 10px rgba(249,115,22,.3)" }
              : { background: "#d1d5db" }
          }
        >
          <span>Kirim</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>

      {/* Demo mode indicator */}
      <div className="flex items-center gap-1.5 pl-1 mt-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f97316] animate-pulse" />
        <span className="text-[8px] font-bold text-[#737f91]/60 uppercase tracking-wider">
          Mode demo UI &mdash; pesan ditambahkan secara lokal (belum tersimpan di database).
        </span>
      </div>
    </div>
  );
}
