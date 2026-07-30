"use client";

import { useState, useRef, useEffect } from "react";
import type { NegotiationStage } from "@/types/domain";

interface MessageComposerProps {
  onSendMessage: (content: string) => void;
  /** Tahap ruang — menentukan aksi cepat mana yang masuk akal saat ini. */
  stage?: NegotiationStage;
  onSendOffer?: () => void;
  onPay?: () => void;
  /** Nonaktifkan input selama pesan sedang dikirim. */
  sending?: boolean;
}

interface QuickAction {
  icon: string;
  label: string;
  handler: () => void;
}

export function MessageComposer({
  onSendMessage,
  stage,
  onSendOffer,
  onPay,
  sending = false,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const buildQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];

    // Custom Offer boleh dikirim selama belum ada offer yang menunggu jawaban:
    // saat masih ngobrol, atau setelah tawaran sebelumnya ditolak. Versi lama
    // hanya memunculkannya di `pending_payment` — tahap yang justru sudah
    // TERLAMBAT untuk menawar, karena ordernya sudah terbentuk.
    if ((stage === "chatting" || stage === "offer_rejected") && onSendOffer) {
      actions.push({
        icon: "💰",
        label: "Kirim Custom Offer",
        handler: () => { onSendOffer(); setMenuOpen(false); },
      });
    }
    if (stage === "pending_payment" && onPay) {
      actions.push({
        icon: "💳",
        label: "Lakukan Pembayaran",
        handler: () => { onPay(); setMenuOpen(false); },
      });
    }

    // Template messages — always available
    const templates = [
      { icon: "👍", label: "Setuju penawaran ini", text: "Baik, saya setuju dengan penawaran ini." },
      { icon: "🤔", label: "Minta penyesuaian harga", text: "Mohon ditinjau kembali, apakah harga bisa disesuaikan?" },
      { icon: "📅", label: "Tanya jadwal mulai", text: "Kapan konten bisa mulai dikerjakan kak?" },
    ];
    templates.forEach(({ icon, label, text }) => {
      actions.push({
        icon,
        label,
        handler: () => { setContent(text); setMenuOpen(false); },
      });
    });

    return actions;
  };

  const quickActions = buildQuickActions();
  const canSend = content.trim().length > 0 && !sending;

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
        {/* (+) Quick action button */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Aksi cepat"
            className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-150 cursor-pointer"
            style={
              menuOpen
                ? { background: "#fff7ed", color: "#f97316" }
                : { color: "#9ca3af" }
            }
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-[16px] p-1.5 z-30"
              style={{
                border: "1px solid rgba(17,24,39,.08)",
                boxShadow: "0 16px 48px rgba(15,23,42,.16), 0 4px 12px rgba(15,23,42,.06)",
              }}
            >
              <div className="px-2.5 py-1.5 mb-0.5">
                <span className="text-[8px] font-black text-[#9ca3af] uppercase tracking-widest">
                  Aksi Cepat
                </span>
              </div>
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={action.handler}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-left text-[11px] font-extrabold text-[#182033] hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <span className="text-sm leading-none shrink-0">{action.icon}</span>
                  <span className="truncate">{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <span className="w-px h-4 bg-neutral-200 shrink-0" />

        {/* Text input */}
        <input
          type="text"
          placeholder="Tulis pesan negosiasi Anda di sini..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1.5 bg-transparent text-xs font-semibold focus:outline-none text-[#182033] placeholder:text-[#737f91]/55"
        />

        {/* Send button */}
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

    </div>
  );
}
