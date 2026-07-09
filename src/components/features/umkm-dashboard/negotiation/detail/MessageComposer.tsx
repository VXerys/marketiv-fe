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

  return (
    <div className="space-y-2 select-none">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center p-2.5 bg-white border border-border-subtle rounded-2xl shadow-2xs focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,.08)] transition-all duration-200">
        <input
          type="text"
          placeholder="Tulis pesan negosiasi Anda di sini..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1.5 bg-transparent text-xs font-semibold focus:outline-none placeholder-text-muted/65 text-text-primary"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-xs font-extrabold transition-all duration-200 cursor-pointer border border-primary hover:border-primary-600 disabled:border-neutral-300 shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <span>Kirim</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
      
      {/* Demo helper badge */}
      <div className="flex items-center gap-1.5 pl-1">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">
          Mode demo UI &mdash; pesan ditambahkan secara lokal (belum tersimpan di database).
        </span>
      </div>
    </div>
  );
}
