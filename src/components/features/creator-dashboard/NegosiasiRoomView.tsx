"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CreatorNegotiation } from "@/types/creator-dashboard";
import { toast } from "sonner";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { CreatorErrorState } from "./CreatorErrorState";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  FileText,
  Check,
  X,
  Lock,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  LinkIcon,
  Clock,
  RotateCcw,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface NegosiasiRoomViewProps {
  negotiation: CreatorNegotiation | null;
  onRetry?: () => void;
}

type MessageSender = "umkm" | "creator" | "system";

interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  time: string;
  isCustomOffer?: boolean;
  offerData?: {
    price: number;
    scope: string;
    revisions: number;
    days: number;
    deliverables: string;
  };
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { dot: string; text: string; bg: string; border: string; label: string }> = {
  Negosiasi:          { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200/60",   label: "Negosiasi" },
  MenungguPembayaran: { dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200/60",    label: "Menunggu Pembayaran" },
  Escrow:             { dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/60", label: "Escrow Aktif" },
  Revisi:             { dot: "bg-orange-400",  text: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-200/60",  label: "Revisi Diminta" },
  MenungguVerifikasi: { dot: "bg-violet-400",  text: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200/60",  label: "Menunggu Verifikasi" },
  Selesai:            { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/60", label: "Selesai" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.Negosiasi;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold border", s.text, s.bg, s.border)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

// ─── Input field helper ───────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">{children}</label>;
}

function FieldInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all font-semibold text-neutral-800 placeholder-neutral-400",
        className
      )}
      {...props}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NegosiasiRoomView({ negotiation: initialNeg, onRetry }: NegosiasiRoomViewProps) {
  const [neg, setNeg] = useState<CreatorNegotiation | null>(initialNeg);
  const [isLoadingSimulated] = useState(false);
  const [isErrorSimulated, setIsErrorSimulated] = useState(false);
  const [isEmptyChatSimulated] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    initialNeg?.id === "order_001"
      ? [
          { id: "m1", sender: "umkm", text: "Halo Nadia, kami dari Dapur Sehat Solo ingin memesan paket Batik Outer Cap untuk promosi.", time: "10:00" },
          { id: "m2", sender: "creator", text: "Halo kak! Tentu saja, outer batik Solo cap sangat cocok dipadukan dengan look kasual jeans maupun dress formal. Pengerjaan biasanya selesai dalam 3–5 hari.", time: "10:05" },
          { id: "m3", sender: "system", text: "Kesepakatan tercapai. UMKM mendepositkan dana escrow sebesar Rp 750.000.", time: "10:15" },
          { id: "m4", sender: "umkm", text: "Dana escrow sudah kami bayar ya kak, silakan diproses.", time: "10:20" },
        ]
      : initialNeg?.id === "order_002"
      ? [
          { id: "m1", sender: "umkm", text: "Halo kak, kami tertarik promosi Serum Herbal Glow. Apakah harganya bisa nego dikit untuk paket hemat ini?", time: "09:30" },
        ]
      : []
  );

  const [inputMessage, setInputMessage] = useState("");

  // Offer modal
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState(300000);
  const [offerScope, setOfferScope] = useState("");
  const [offerDeliverables, setOfferDeliverables] = useState("");
  const [offerRevisions, setOfferRevisions] = useState(2);
  const [offerDays, setOfferDays] = useState(7);

  // Collab modal
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [collabUrl, setCollabUrl] = useState("");
  const [collabError, setCollabError] = useState<string | null>(null);

  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const quickMenuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (!isQuickMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target as Node)) {
        setIsQuickMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isQuickMenuOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!neg || !inputMessage.trim()) return;

    const msg: ChatMessage = {
      id: `mc_${Date.now()}`,
      sender: "creator",
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages(prev => [...prev, msg]);
    setInputMessage("");
    setNeg(prev => prev ? { ...prev, lastMessage: msg.text, lastMessageAt: new Date().toISOString() } : null);

    setTimeout(() => {
      const reply: ChatMessage = {
        id: `mu_${Date.now()}`,
        sender: "umkm",
        text: "Terima kasih infonya kak Nadia, akan kami sampaikan ke tim internal dulu.",
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages(prev => [...prev, reply]);
    }, 1500);
  };

  const handleSendCustomOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!neg || !offerScope.trim() || !offerDeliverables.trim()) return;

    const platFee = Math.round(offerPrice * 0.03);
    const total = offerPrice + platFee;

    setNeg(prev => prev ? { ...prev, finalPrice: offerPrice, deliverables: offerDeliverables.trim(), revisionCount: offerRevisions, platformFee: platFee, totalAmount: total } : null);

    const msg: ChatMessage = {
      id: `offer_${Date.now()}`,
      sender: "creator",
      text: `Custom Offer: Rp ${offerPrice.toLocaleString("id-ID")}`,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isCustomOffer: true,
      offerData: { price: offerPrice, scope: offerScope.trim(), revisions: offerRevisions, days: offerDays, deliverables: offerDeliverables.trim() },
    };

    setChatMessages(prev => [...prev, msg]);
    setIsOfferModalOpen(false);
    toast.success("Custom Offer berhasil dikirim ke chat!");
  };

  const handleAcceptOrder = () => {
    if (!neg) return;
    setNeg(prev => prev ? { ...prev, status: "MenungguPembayaran" } : null);
    setChatMessages(prev => [...prev, {
      id: `sys_${Date.now()}`,
      sender: "system",
      text: "Negosiasi deal. Kontrak dibuat, menunggu pembayaran escrow dari UMKM.",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    }]);
    toast.success("Kontrak disepakati!");
  };

  const handleSubmitCollabUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = collabUrl.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setCollabError("URL wajib diawali dengan http:// atau https://");
      return;
    }
    const lower = trimmed.toLowerCase();
    if (!lower.includes("tiktok.com") && !lower.includes("instagram.com")) {
      setCollabError("URL harus memuat domain 'tiktok.com' atau 'instagram.com'");
      return;
    }

    setCollabError(null);
    setNeg(prev => prev ? { ...prev, status: "MenungguVerifikasi", submittedCollabUrl: trimmed } : null);
    setChatMessages(prev => [...prev, {
      id: `sys_collab_${Date.now()}`,
      sender: "system",
      text: `Bukti tayang diserahkan. Link Collab Post: ${trimmed}. Menunggu verifikasi admin.`,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setIsCollabModalOpen(false);
    setCollabUrl("");
    toast.success("Link Collab Post berhasil dikirim!");
  };

  const handleMarkRevisionDone = () => {
    if (!neg) return;
    setNeg(prev => prev ? { ...prev, status: "MenungguVerifikasi" } : null);
    setChatMessages(prev => [...prev, {
      id: `sys_rev_${Date.now()}`,
      sender: "system",
      text: "Kreator menandai revisi selesai. Kontrak menunggu verifikasi ulang.",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    }]);
    toast.success("Revisi ditandai selesai.");
  };

  if (isErrorSimulated) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[80vh]">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4.5 mb-8 max-w-md w-full flex items-center justify-between shadow-sm text-xs font-semibold text-red-800">
          <span>Mode Uji Coba Error Aktif.</span>
          <button onClick={() => setIsErrorSimulated(false)} className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all cursor-pointer font-bold">
            Matikan Mode Error
          </button>
        </div>
        <CreatorErrorState errorMsg="Simulator error diaktifkan pada halaman detail Room Negosiasi." onRetry={() => { setIsErrorSimulated(false); if (onRetry) onRetry(); }} />
      </div>
    );
  }

  if (!neg) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[70vh]">
        <CreatorEmptyState
          title="Percakapan tidak ditemukan"
          description="ID order negosiasi tidak terdaftar atau order telah dibatalkan."
          actionButton={
            <Link href="/dashboard/kreator/negosiasi" className="text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow cursor-pointer" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              Kembali ke Negosiasi
            </Link>
          }
        />
      </div>
    );
  }

  const isNegoState     = neg.status === "Negosiasi";
  const isEscrowState   = neg.status === "Escrow";
  const isRevisionState = neg.status === "Revisi";

  const platFee   = neg.platformFee   ?? Math.round(neg.finalPrice * 0.03);
  const totalAmt  = neg.totalAmount   ?? (neg.finalPrice + platFee);
  const deadline  = new Date(neg.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  // Checklist milestones
  const milestones = [
    {
      label: "Inisiasi Negosiasi & Deal",
      done: true,
    },
    {
      label: "Pembayaran Escrow UMKM",
      done: !["Negosiasi", "MenungguPembayaran"].includes(neg.status),
    },
    {
      label: "Submit Collab Post URL",
      done: !!neg.submittedCollabUrl,
    },
    {
      label: "Pelepasan Dana Escrow",
      done: neg.status === "Selesai",
    },
  ];
  const doneCount = milestones.filter(m => m.done).length;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-5 sm:pb-5 lg:pb-5 relative h-[calc(100vh-84px)] flex flex-col min-h-0 overflow-hidden">
      {isLoadingSimulated ? (
        <div className="animate-pulse space-y-4 flex-1">
          <div className="h-16 bg-white border border-neutral-200/50 rounded-[22px]" />
          <div className="flex-1 bg-white border border-neutral-200/50 rounded-[22px] h-96" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 max-w-7xl w-full mx-auto">

          {/* Back button */}
          <Link
            href="/dashboard/kreator/negosiasi"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-neutral-500 hover:text-violet-700 transition-colors mb-5 group cursor-pointer shrink-0 w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Negosiasi
          </Link>

          {/* Main workspace grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 items-stretch">

            {/* ── LEFT: Chat pane (8 cols) ───────────────────────────────── */}
            <div className="lg:col-span-8 bg-white border border-neutral-200/60 shadow-[0_4px_24px_rgba(15,23,42,.05)] rounded-[22px] flex flex-col min-h-0 overflow-hidden">

              {/* Chat header */}
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-[13px] overflow-hidden bg-neutral-100 border border-neutral-200/40 flex items-center justify-center font-black text-neutral-300 text-base">
                      {neg.umkmAvatarUrl ? (
                        <img src={neg.umkmAvatarUrl} alt={neg.umkmName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{neg.umkmName.charAt(0)}</span>
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#1e1b4b] leading-tight">{neg.umkmName}</h4>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">{neg.projectTitle}</p>
                  </div>
                </div>
                <StatusPill status={neg.status} />
              </div>

              {/* Warning banner */}
              <div className="px-5 py-2.5 bg-amber-50/60 border-b border-amber-100/60 shrink-0 flex items-start gap-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                  Publikasi hasil konten wajib memakai fitur <span className="font-black">&quot;Collab Post&quot;</span> di Instagram / TikTok agar performa views dapat diverifikasi sistem.
                </p>
              </div>

              {/* Messages feed */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#fafafa] premium-scrollbar">
                {isEmptyChatSimulated || chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center">
                      <MessageSquareIcon className="w-6 h-6 text-neutral-300" />
                    </div>
                    <p className="text-xs text-neutral-400 font-bold max-w-[200px]">Belum ada obrolan. Kirim pesan negosiasi pertama di bawah.</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    if (msg.sender === "system") {
                      return (
                        <div key={msg.id} className="flex justify-center my-2 animate-in fade-in duration-200">
                          <span className="bg-white border border-neutral-200/60 text-neutral-500 text-[9px] font-bold px-4 py-1.5 rounded-full shadow-sm text-center">
                            ⚙️ {msg.text}
                          </span>
                        </div>
                      );
                    }

                    const isCreator = msg.sender === "creator";

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-3 max-w-[82%] items-end animate-in fade-in slide-in-from-bottom-2 duration-300",
                          isCreator ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                      >
                        {!isCreator && (
                          <div className="w-7 h-7 rounded-[9px] overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/30 mb-1">
                            {neg.umkmAvatarUrl && <img src={neg.umkmAvatarUrl} alt={neg.umkmName} className="w-full h-full object-cover" />}
                          </div>
                        )}

                        <div className="space-y-1 min-w-0">
                          {msg.isCustomOffer && msg.offerData ? (
                            /* Custom Offer card bubble */
                            <div className="bg-white border border-violet-200/50 shadow-[0_4px_20px_rgba(109,40,217,.10)] rounded-[18px] rounded-br-[6px] p-5 max-w-xs space-y-4">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="flex items-center gap-1.5 text-[8px] font-black text-violet-600 uppercase tracking-widest mb-1">
                                    <Sparkles className="w-3 h-3" />
                                    Custom Offer
                                  </span>
                                  <h5 className="font-extrabold text-[#1e1b4b] text-xs leading-tight">{neg.projectTitle}</h5>
                                </div>
                                <span className="text-lg font-black text-violet-700 shrink-0 leading-none">
                                  {formatCurrency(msg.offerData.price)}
                                </span>
                              </div>

                              <p className="text-[11px] text-neutral-600 font-medium leading-relaxed border-l-2 border-violet-200 pl-3">
                                {msg.offerData.scope}
                              </p>

                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { label: "Revisi", val: `${msg.offerData.revisions}×` },
                                  { label: "Durasi", val: `${msg.offerData.days}h` },
                                  { label: "Deliverables", val: msg.offerData.deliverables.split(" ").slice(0, 3).join(" ") + (msg.offerData.deliverables.split(" ").length > 3 ? "…" : "") },
                                ].map(({ label, val }) => (
                                  <div key={label} className="bg-neutral-50 rounded-[10px] p-2 text-center">
                                    <span className="block text-[7px] font-black text-neutral-400 uppercase tracking-wider">{label}</span>
                                    <span className="block text-[10px] font-black text-neutral-800 mt-0.5 truncate">{val}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="border-t border-neutral-100 pt-3">
                                {neg.status === "Negosiasi" ? (
                                  <button
                                    onClick={handleAcceptOrder}
                                    className="w-full py-2.5 rounded-[12px] text-[10px] font-extrabold text-white cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
                                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 12px rgba(124,58,237,.30)" }}
                                  >
                                    Terima & Buat Kontrak
                                  </button>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-600">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Kesepakatan Terbuat
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "px-4 py-3 text-xs font-semibold leading-relaxed shadow-sm",
                                isCreator
                                  ? "bg-[#1e1b4b] text-white rounded-[18px] rounded-br-[6px]"
                                  : "bg-white text-neutral-800 border border-neutral-200/50 rounded-[18px] rounded-bl-[6px]"
                              )}
                            >
                              {msg.text}
                            </div>
                          )}
                          <span className={cn("block text-[9px] text-neutral-400 font-bold px-1", isCreator ? "text-right" : "text-left")}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Composer */}
              <div className="p-4 bg-white border-t border-neutral-100 shrink-0 space-y-3">
                {/* Action toolbar */}
                {(isNegoState || isEscrowState || isRevisionState) && (
                  <div className="flex flex-wrap gap-2 pb-3 border-b border-neutral-100">
                    {isNegoState && (
                      <>
                        <button
                          onClick={() => {
                            setOfferScope(neg.scope);
                            setOfferDeliverables(neg.deliverables || "");
                            setOfferPrice(neg.finalPrice);
                            setIsOfferModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-[11px] font-extrabold text-violet-700 bg-violet-50 border border-violet-200/50 hover:bg-violet-100 transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Buat Custom Offer
                        </button>
                        <button
                          onClick={handleAcceptOrder}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-[11px] font-extrabold text-white cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
                          style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 3px 10px rgba(124,58,237,.25)" }}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Terima Penawaran
                        </button>
                      </>
                    )}

                    {(isEscrowState || isRevisionState) && (
                      <button
                        onClick={() => { setCollabUrl(""); setCollabError(null); setIsCollabModalOpen(true); }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-[11px] font-extrabold text-neutral-900 bg-neutral-100 border border-neutral-200/60 hover:bg-neutral-200/60 transition-all cursor-pointer"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        Submit Link Collab Post
                      </button>
                    )}

                    {isRevisionState && (
                      <button
                        onClick={handleMarkRevisionDone}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/50 hover:bg-emerald-100 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Tandai Revisi Selesai
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                  {/* (+) Quick action button */}
                  <div className="relative shrink-0" ref={quickMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsQuickMenuOpen((v) => !v)}
                      aria-label="Aksi cepat"
                      className="w-10 h-10 rounded-[13px] flex items-center justify-center transition-all duration-150 cursor-pointer"
                      style={
                        isQuickMenuOpen
                          ? { background: "rgba(124,58,237,.08)", color: "#7c3aed" }
                          : { color: "#9ca3af" }
                      }
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>

                    {isQuickMenuOpen && (
                      <div
                        className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-[16px] p-1.5 z-30"
                        style={{
                          border: "1px solid rgba(17,24,39,.08)",
                          boxShadow: "0 16px 48px rgba(15,23,42,.16), 0 4px 12px rgba(15,23,42,.06)",
                        }}
                      >
                        <div className="px-2.5 py-1.5 mb-0.5">
                          <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Aksi Cepat</span>
                        </div>

                        {isNegoState && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setOfferScope(neg.scope);
                                setOfferDeliverables(neg.deliverables || "");
                                setOfferPrice(neg.finalPrice);
                                setIsOfferModalOpen(true);
                                setIsQuickMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-left text-[11px] font-extrabold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
                            >
                              <span className="text-sm shrink-0">✨</span>
                              <span>Buat Custom Offer</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => { handleAcceptOrder(); setIsQuickMenuOpen(false); }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-left text-[11px] font-extrabold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
                            >
                              <span className="text-sm shrink-0">✅</span>
                              <span>Terima Penawaran</span>
                            </button>
                          </>
                        )}

                        {(isEscrowState || isRevisionState) && (
                          <button
                            type="button"
                            onClick={() => { setCollabUrl(""); setCollabError(null); setIsCollabModalOpen(true); setIsQuickMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-left text-[11px] font-extrabold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
                          >
                            <span className="text-sm shrink-0">🔗</span>
                            <span>Submit Link Collab</span>
                          </button>
                        )}

                        {isRevisionState && (
                          <button
                            type="button"
                            onClick={() => { handleMarkRevisionDone(); setIsQuickMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-left text-[11px] font-extrabold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
                          >
                            <span className="text-sm shrink-0">🔄</span>
                            <span>Tandai Revisi Selesai</span>
                          </button>
                        )}

                        <div className="my-1 mx-2 border-t border-neutral-100" />
                        {[
                          { icon: "💬", label: "Sedang dikerjakan", text: "Konten sedang dalam proses pengerjaan kak, mohon ditunggu." },
                          { icon: "⏳", label: "Minta perpanjangan", text: "Mohon maaf kak, apakah deadline bisa diundur sedikit?" },
                        ].map((t, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setInputMessage(t.text); setIsQuickMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-left text-[11px] font-extrabold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
                          >
                            <span className="text-sm shrink-0">{t.icon}</span>
                            <span className="truncate">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Tulis pesan negosiasi..."
                    className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-[14px] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all font-semibold text-neutral-800 placeholder-neutral-400"
                  />
                  <button
                    type="submit"
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 14px rgba(124,58,237,.30)" }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
              </div>
            </div>

            {/* ── RIGHT: Info pane (4 cols) ──────────────────────────────── */}
            <div className="lg:col-span-4 flex flex-col gap-3 overflow-y-auto px-4 py-4 -mx-4 -my-4 max-h-[calc(100%+32px)] pr-2 premium-scrollbar">

              {/* Contract details card */}
              <div className="bg-white border border-neutral-200/60 shadow-[0_4px_24px_rgba(15,23,42,.05)] rounded-[22px] p-4 space-y-4">
                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2">
                  Rincian Kontrak Kerja
                </h4>

                <div className="space-y-3">
                  <div>
                    <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Nama Paket</span>
                    <span className="block font-extrabold text-[#1e1b4b] text-sm leading-tight">{neg.projectTitle}</span>
                  </div>

                  <div>
                    <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Ruang Lingkup</span>
                    <p className="text-xs text-neutral-600 font-semibold leading-relaxed">{neg.scope}</p>
                  </div>

                  {neg.deliverables && (
                    <div>
                      <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Deliverables</span>
                      <span className="block text-xs font-extrabold text-neutral-700">{neg.deliverables}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-50 rounded-[12px] p-2.5 border border-neutral-100">
                      <span className="flex items-center gap-1 text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">
                        <Clock className="w-2.5 h-2.5" /> Deadline
                      </span>
                      <span className="block text-xs font-extrabold text-neutral-800">{deadline}</span>
                    </div>
                    <div className="bg-neutral-50 rounded-[12px] p-2.5 border border-neutral-100">
                      <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Maks Revisi</span>
                      <span className="block text-xs font-extrabold text-neutral-800">{neg.revisionCount ?? 2}×</span>
                    </div>
                  </div>

                  {/* Billing breakdown */}
                  <div className="bg-gradient-to-br from-violet-50/60 to-indigo-50/30 rounded-[14px] p-3 border border-violet-100/60 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-neutral-500">
                      <span>Harga Rate Card</span>
                      <span>{formatCurrency(neg.finalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-neutral-500">
                      <span>Biaya Platform (3%)</span>
                      <span>{formatCurrency(platFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#1e1b4b] border-t border-violet-100 pt-2">
                      <span>Total Biaya</span>
                      <span>{formatCurrency(totalAmt)}</span>
                    </div>
                  </div>

                  {/* Escrow status */}
                  <div>
                    <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-2">Status Escrow</span>
                    <div className={cn(
                      "flex items-center gap-2 px-3.5 py-2.5 rounded-[12px] border w-fit",
                      neg.escrowStatus === "Escrowed"
                        ? "bg-emerald-50 border-emerald-200/50 text-emerald-700"
                        : neg.escrowStatus === "Released"
                        ? "bg-blue-50 border-blue-200/50 text-blue-700"
                        : "bg-amber-50 border-amber-200/50 text-amber-700"
                    )}>
                      {neg.escrowStatus === "Escrowed" ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">
                        {neg.escrowStatus ?? "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deliverables checklist */}
              <div className="bg-white border border-neutral-200/60 shadow-[0_4px_24px_rgba(15,23,42,.05)] rounded-[22px] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Checklist Deliverables</h4>
                  <span className="text-[9px] font-extrabold text-violet-600 bg-violet-50 border border-violet-200/50 px-2 py-0.5 rounded-full">
                    {doneCount}/{milestones.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(doneCount / milestones.length) * 100}%`,
                      background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
                    }}
                  />
                </div>

                <div className="space-y-2.5">
                  {milestones.map((m, i) => (
                    <div key={i} className={cn("flex items-center gap-3 transition-opacity", !m.done && "opacity-60")}>
                      <div className={cn(
                        "w-5 h-5 rounded-[7px] flex items-center justify-center shrink-0 transition-all",
                        m.done
                          ? "text-white"
                          : "bg-white border-2 border-neutral-200"
                      )}
                        style={m.done ? { background: "linear-gradient(135deg,#7c3aed,#4f46e5)" } : undefined}
                      >
                        {m.done && <Check className="w-3 h-3" />}
                      </div>
                      <span className={cn("text-xs font-semibold", m.done ? "text-neutral-500 line-through" : "text-neutral-700")}>
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Modal: Buat Custom Offer ─────────────────────────────────────── */}
      {isOfferModalOpen && neg && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-neutral-200/50 shadow-[0_32px_80px_rgba(15,23,42,.20)] p-6 sm:p-7 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <h3 className="text-base font-black text-[#1e1b4b]">Buat Custom Offer</h3>
                </div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{neg.umkmName}</p>
              </div>
              <button onClick={() => setIsOfferModalOpen(false)} className="p-1.5 rounded-[10px] text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSendCustomOffer} className="space-y-4">
              <div>
                <FieldLabel>Harga Penawaran (Rupiah)</FieldLabel>
                <FieldInput type="number" required min={50000} value={offerPrice} onChange={(e) => setOfferPrice(Number(e.target.value))} />
                <p className="text-[10px] text-neutral-400 font-semibold mt-1.5">
                  Biaya platform 3%: <span className="font-bold text-neutral-600">{formatCurrency(Math.round(offerPrice * 0.03))}</span>
                  {" · "}Total: <span className="font-bold text-violet-700">{formatCurrency(offerPrice + Math.round(offerPrice * 0.03))}</span>
                </p>
              </div>

              <div>
                <FieldLabel>Deliverables Konten</FieldLabel>
                <FieldInput type="text" required placeholder="Contoh: 1 Reels Collab Post + 1 Story Link" value={offerDeliverables} onChange={(e) => setOfferDeliverables(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Durasi (Hari)</FieldLabel>
                  <FieldInput type="number" required min={1} value={offerDays} onChange={(e) => setOfferDays(Number(e.target.value))} />
                </div>
                <div>
                  <FieldLabel>Revisi Maksimal</FieldLabel>
                  <FieldInput type="number" required min={1} value={offerRevisions} onChange={(e) => setOfferRevisions(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <FieldLabel>Deskripsi Ruang Lingkup (Scope)</FieldLabel>
                <textarea
                  required
                  rows={3}
                  placeholder="Tulis deskripsi konten, lookbook, angle review, dll..."
                  value={offerScope}
                  onChange={(e) => setOfferScope(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-[14px] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all font-semibold text-neutral-800 placeholder-neutral-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsOfferModalOpen(false)} className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-extrabold text-xs rounded-full transition-all cursor-pointer">
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white font-extrabold text-xs rounded-full border border-transparent transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 14px rgba(124,58,237,.30)" }}
                >
                  Kirim Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Submit Link Collab Post ──────────────────────────────── */}
      {isCollabModalOpen && neg && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-neutral-200/50 shadow-[0_32px_80px_rgba(15,23,42,.20)] p-6 sm:p-7 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <LinkIcon className="w-4 h-4 text-neutral-700" />
                  <h3 className="text-base font-black text-[#1e1b4b]">Submit Link Collab Post</h3>
                </div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{neg.projectTitle}</p>
              </div>
              <button onClick={() => setIsCollabModalOpen(false)} className="p-1.5 rounded-[10px] text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {collabError && (
              <div className="bg-red-50 border border-red-200/60 rounded-[12px] p-3.5 text-red-700 text-xs font-bold mb-4 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{collabError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCollabUrl} className="space-y-4">
              <div>
                <FieldLabel>Link Video Instagram Reels / TikTok</FieldLabel>
                <FieldInput
                  type="url"
                  required
                  placeholder="https://www.instagram.com/reel/CtO12345/"
                  value={collabUrl}
                  onChange={(e) => { setCollabUrl(e.target.value); if (collabError) setCollabError(null); }}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200/50 rounded-[12px] p-3.5 flex items-start gap-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                  Pastikan video sudah dipublikasikan secara publik dan menggunakan fitur <span className="font-black">&quot;Collab Post&quot;</span> agar admin dapat memverifikasi performa views.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsCollabModalOpen(false)} className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-extrabold text-xs rounded-full transition-all cursor-pointer">
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white font-extrabold text-xs rounded-full border border-transparent transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                  style={{ background: "linear-gradient(135deg,#1e1b4b,#4f46e5)", boxShadow: "0 4px 14px rgba(30,27,75,.25)" }}
                >
                  Unggah Tautan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline SVG icon to avoid extra import
function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}
