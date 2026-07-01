"use client";

import { useState } from "react";
import Link from "next/link";
import { CreatorNegotiation } from "@/types/creator-dashboard";
import { CreatorStatusBadge } from "./CreatorStatusBadge";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { CreatorErrorState } from "./CreatorErrorState";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface NegosiasiRoomViewProps {
  negotiation: CreatorNegotiation | null;
  onRetry?: () => void;
}

export function NegosiasiRoomView({ negotiation: initialNeg, onRetry }: NegosiasiRoomViewProps) {
  const [neg, setNeg] = useState<CreatorNegotiation | null>(initialNeg);

  // Slicing States (DoD)
  const [isLoadingSimulated, setIsLoadingSimulated] = useState(false);
  const [isErrorSimulated, setIsErrorSimulated] = useState(false);
  const [isEmptyChatSimulated, setIsEmptyChatSimulated] = useState(false);

  // Chat Feed State
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: "umkm" | "creator" | "system";
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
  }>>(
    initialNeg?.id === "order_001"
      ? [
          { id: "m1", sender: "umkm", text: "Halo Nadia, kami dari Dapur Sehat Solo ingin memesan paket Batik Outer Cap untuk promosi.", time: "10:00" },
          { id: "m2", sender: "creator", text: "Halo kak! Tentu saja, outer batik Solo cap sangat cocok dipadukan dengan look kasual jeans maupun dress formal. Pengerjaan biasanya selesai dalam 3-5 hari.", time: "10:05" },
          { id: "m3", sender: "system", text: "Kesepakatan tercapai. UMKM mendepositkan dana escrow sebesar Rp750.000.", time: "10:15" },
          { id: "m4", sender: "umkm", text: "Dana escrow sudah kami bayar ya kak, silakan diproses.", time: "10:20" },
        ]
      : initialNeg?.id === "order_002"
      ? [
          { id: "m1", sender: "umkm", text: "Halo kak, kami tertarik promosi Serum Herbal Glow. Apakah harganya bisa nego dikit untuk paket hemat ini?", time: "09:30" },
        ]
      : []
  );

  const [inputMessage, setInputMessage] = useState("");

  // Modals state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState(300000);
  const [offerScope, setOfferScope] = useState("");
  const [offerDeliverables, setOfferDeliverables] = useState("");
  const [offerRevisions, setOfferRevisions] = useState(2);
  const [offerDays, setOfferDays] = useState(7);

  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [collabUrl, setCollabUrl] = useState("");
  const [collabError, setCollabError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Composer Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!neg || !inputMessage.trim()) return;

    const userMsg = {
      id: `m_c_${Date.now()}`,
      sender: "creator" as const,
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage("");

    // Update last message in negotiation mock state
    setNeg(prev => prev ? { ...prev, lastMessage: userMsg.text, lastMessageAt: new Date().toISOString() } : null);

    // Simulated UMKM reply
    setTimeout(() => {
      const replyMsg = {
        id: `m_u_${Date.now()}`,
        sender: "umkm" as const,
        text: "Terima kasih infonya kak Nadia, akan kami sampaikan ke tim internal dulu.",
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages(prev => [...prev, replyMsg]);
      setNeg(prev => prev ? { ...prev, lastMessage: replyMsg.text, lastMessageAt: new Date().toISOString() } : null);
    }, 1500);
  };

  // Custom Offer Submission
  const handleSendCustomOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!neg || !offerScope.trim() || !offerDeliverables.trim()) return;

    const platFee = Math.round(offerPrice * 0.03);
    const total = offerPrice + platFee;

    // Update negotiation billing details locally
    setNeg(prev => {
      if (!prev) return null;
      return {
        ...prev,
        finalPrice: offerPrice,
        deliverables: offerDeliverables.trim(),
        revisionCount: offerRevisions,
        platformFee: platFee,
        totalAmount: total,
      };
    });

    const offerMsg = {
      id: `m_offer_${Date.now()}`,
      sender: "creator" as const,
      text: `Saya mengirim Custom Offer baru seharga Rp${offerPrice.toLocaleString("id-ID")}`,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isCustomOffer: true,
      offerData: {
        price: offerPrice,
        scope: offerScope.trim(),
        revisions: offerRevisions,
        days: offerDays,
        deliverables: offerDeliverables.trim(),
      }
    };

    setChatMessages(prev => [...prev, offerMsg]);
    setIsOfferModalOpen(false);
    showToast("Custom Offer berhasil dikirim ke chat!");
  };

  // Accept Order
  const handleAcceptOrder = () => {
    if (!neg) return;
    setNeg(prev => prev ? { ...prev, status: "MenungguPembayaran" } : null);

    const sysMsg = {
      id: `sys_${Date.now()}`,
      sender: "system" as const,
      text: "Negosiasi deal. Kontrak dibuat, menunggu pembayaran escrow dari UMKM.",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages(prev => [...prev, sysMsg]);
    showToast("Kontrak disepakati!");
  };

  // Submit Link Collab Post
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

    const sysMsg = {
      id: `sys_collab_${Date.now()}`,
      sender: "system" as const,
      text: `Bukti tayang diserahkan. Link Collab Post: ${trimmed}. Menunggu verifikasi admin.`,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages(prev => [...prev, sysMsg]);
    setIsCollabModalOpen(false);
    setCollabUrl("");
    showToast("Link Collab Post berhasil dikirim untuk diaudit!");
  };

  // Mark revision done
  const handleMarkRevisionDone = () => {
    if (!neg) return;
    setNeg(prev => prev ? { ...prev, status: "MenungguVerifikasi" } : null);

    const sysMsg = {
      id: `sys_rev_${Date.now()}`,
      sender: "system" as const,
      text: "Kreator menandai revisi selesai. Kontrak menunggu verifikasi ulang.",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages(prev => [...prev, sysMsg]);
    showToast("Revisi ditandai selesai.");
  };

  // Error simulation state
  if (isErrorSimulated) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[80vh]">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4.5 mb-8 max-w-md w-full flex items-center justify-between shadow-sm text-xs font-semibold text-red-800">
          <span>Mode Uji Coba Error Aktif.</span>
          <button
            onClick={() => setIsErrorSimulated(false)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all cursor-pointer font-bold"
          >
            Matikan Mode Error
          </button>
        </div>
        <CreatorErrorState
          errorMsg="Simulator error diaktifkan pada halaman detail Room Negosiasi."
          onRetry={() => {
            setIsErrorSimulated(false);
            if (onRetry) onRetry();
          }}
        />
      </div>
    );
  }

  // Not Found state
  if (!neg) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[70vh]">
        <CreatorEmptyState
          title="Percakapan tidak ditemukan"
          description="ID order negosiasi tidak terdaftar atau order telah dibatalkan."
          actionButton={
            <Link
              href="/dashboard/kreator/negosiasi"
              className="bg-primary hover:bg-primary-600 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow border border-primary-600/10"
            >
              Kembali ke Negosiasi
            </Link>
          }
        />
      </div>
    );
  }

  const isNegoState = neg.status === "Negosiasi";
  const isEscrowState = neg.status === "Escrow";
  const isRevisionState = neg.status === "Revisi";

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative h-[calc(100vh-76px)] flex flex-col min-h-0">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2">
          <svg className="w-4.5 h-4.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Simulator Control Panel */}
      <div className="mb-4 bg-white/70 backdrop-blur-md border border-neutral-200/50 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-xs font-bold text-neutral-700 shrink-0">
        <div className="flex items-center gap-2 text-neutral-900">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
          <span>Panel Simulator State (Room Negosiasi):</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsLoadingSimulated(!isLoadingSimulated)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer",
              isLoadingSimulated
                ? "bg-primary text-white border-primary-600"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            )}
          >
            {isLoadingSimulated ? "Matikan Shimmer" : "Simulasi Shimmer"}
          </button>
          <button
            onClick={() => setIsEmptyChatSimulated(!isEmptyChatSimulated)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer",
              isEmptyChatSimulated
                ? "bg-primary text-white border-primary-600"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            )}
          >
            {isEmptyChatSimulated ? "Matikan Chat" : "Simulasi Chat Kosong"}
          </button>
          <button
            onClick={() => setIsErrorSimulated(true)}
            className="px-3.5 py-1.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            Simulasi Error
          </button>
        </div>
      </div>

      {isLoadingSimulated ? (
        <div className="animate-pulse space-y-6 flex-1 flex flex-col justify-between">
          <div className="h-20 bg-white border border-neutral-200/50 rounded-3xl p-6"></div>
          <div className="flex-1 bg-white border rounded-3xl p-6 h-96"></div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Back Button */}
          <Link
            href="/dashboard/kreator/negosiasi"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-neutral-500 hover:text-primary transition-colors mb-4 group cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Negosiasi</span>
          </Link>

          {/* Room Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 items-stretch">
            
            {/* Left Area: Chat box (8 columns) */}
            <div className="lg:col-span-8 bg-white/95 border border-neutral-200/50 shadow-sm rounded-3xl flex flex-col min-h-0 overflow-hidden">
              
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-200/30 flex items-center justify-center font-bold text-neutral-400">
                    {neg.umkmAvatarUrl ? (
                      <img
                        src={neg.umkmAvatarUrl}
                        alt={neg.umkmName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>U</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 leading-none">{neg.umkmName}</h4>
                    <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">
                      {neg.projectTitle}
                    </p>
                  </div>
                </div>

                <CreatorStatusBadge
                  status={neg.status}
                  type="negotiation"
                />
              </div>

              {/* Collab Warning Banner */}
              <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 shrink-0 flex items-center gap-2 text-[10px] font-bold text-amber-800">
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>⚠️ PERHATIAN: Publikasi hasil konten wajib memakai fitur &quot;Collab Post&quot; di Instagram / TikTok agar performa views dapat diverifikasi sistem.</span>
              </div>

              {/* Chat Messages pane */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/20">
                {isEmptyChatSimulated || chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <p className="text-xs text-neutral-400 font-bold">Belum ada obrolan. Kirim pesan negosiasi pertama Anda di bawah.</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    if (msg.sender === "system") {
                      return (
                        <div key={msg.id} className="flex justify-center my-3">
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm text-center">
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
                          "flex gap-3 max-w-[80%] items-start",
                          isCreator ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                      >
                        {!isCreator && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-50 shrink-0 border border-neutral-200/30">
                            {neg.umkmAvatarUrl && (
                              <img
                                src={neg.umkmAvatarUrl}
                                alt={neg.umkmName}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        )}
                        <div className="space-y-1">
                          {msg.isCustomOffer && msg.offerData ? (
                            <div className="bg-white border border-primary-200 shadow-sm rounded-2xl p-5 max-w-sm space-y-3.5">
                              <div className="border-b border-neutral-100 pb-2">
                                <span className="block text-[8px] font-black text-primary uppercase tracking-wider">Custom Offer Diajukan</span>
                                <h5 className="font-extrabold text-neutral-900 text-xs mt-0.5">{neg.projectTitle}</h5>
                              </div>
                              <div className="space-y-2 text-xs font-semibold text-neutral-600 leading-relaxed">
                                <p className="font-medium">{msg.offerData.scope}</p>
                                <div className="grid grid-cols-2 gap-2 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                                  <div>Revisi: <span className="text-neutral-800">{msg.offerData.revisions}x</span></div>
                                  <div>Batas: <span className="text-neutral-800">{msg.offerData.days} Hari</span></div>
                                  <div className="col-span-2">Deliverables: <span className="text-neutral-800 lowercase">{msg.offerData.deliverables}</span></div>
                                </div>
                              </div>
                              <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
                                <span className="text-sm font-black text-neutral-900">
                                  {formatCurrency(msg.offerData.price)}
                                </span>
                                {neg.status === "Negosiasi" ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleAcceptOrder}
                                      className="px-3 py-1.5 bg-primary hover:bg-primary-600 text-white rounded-lg text-[10px] font-black shadow-sm cursor-pointer"
                                    >
                                      Terima Kontrak
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-bold text-green-600">✓ Kesepakatan Terbuat</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm",
                                isCreator
                                  ? "bg-neutral-950 text-white rounded-tr-none"
                                  : "bg-white text-neutral-800 border border-neutral-200/40 rounded-tl-none"
                              )}
                            >
                              {msg.text}
                            </div>
                          )}
                          <span className={cn("block text-[8px] text-neutral-400 font-bold", isCreator ? "text-right" : "text-left")}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Composer / Actions Panel */}
              <div className="p-4 bg-white border-t border-neutral-100 shrink-0 space-y-3">
                {/* Dynamic Status Action Toolbar */}
                <div className="flex flex-wrap gap-2.5 border-b border-neutral-100 pb-3">
                  {isNegoState && (
                    <>
                      <button
                        onClick={() => {
                          setOfferScope(neg.scope);
                          setOfferDeliverables(neg.deliverables || "");
                          setOfferPrice(neg.finalPrice);
                          setIsOfferModalOpen(true);
                        }}
                        className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/50 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>📝 Buat Custom Offer</span>
                      </button>
                      <button
                        onClick={handleAcceptOrder}
                        className="px-3.5 py-2 bg-primary hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Terima Penawaran UMKM
                      </button>
                    </>
                  )}

                  {(isEscrowState || isRevisionState) && (
                    <button
                      onClick={() => {
                        setCollabUrl("");
                        setCollabError(null);
                        setIsCollabModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🔗 Submit Link Collab Post</span>
                    </button>
                  )}

                  {isRevisionState && (
                    <button
                      onClick={handleMarkRevisionDone}
                      className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold border border-neutral-300/40 transition-all cursor-pointer"
                    >
                      ✓ Tandai Revisi Selesai
                    </button>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Tulis pesan kesepakatan atau negosiasi Rate Card..."
                    className="flex-1 px-4.5 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800 placeholder-neutral-400"
                  />
                  <button
                    type="submit"
                    className="w-11 h-11 bg-primary hover:bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shrink-0"
                  >
                    <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>

            </div>

            {/* Right Area: Summary Info Panel (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Custom Offer Summary Card */}
              <div className="bg-white border border-neutral-200/50 shadow-sm rounded-3xl p-6 space-y-5">
                <h4 className="font-extrabold text-neutral-900 text-xs border-b border-neutral-100 pb-3 uppercase tracking-wider">
                  Rincian Kontrak Kerja
                </h4>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Nama Paket</span>
                    <span className="block font-black text-neutral-950 mt-0.5">{neg.projectTitle}</span>
                  </div>

                  <div>
                    <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Ruang Lingkup (Scope)</span>
                    <p className="font-medium text-neutral-600 mt-0.5 leading-relaxed">{neg.scope}</p>
                  </div>

                  {neg.deliverables && (
                    <div>
                      <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Deliverables</span>
                      <span className="block font-bold text-neutral-700 mt-0.5">{neg.deliverables}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-[11px] font-bold">
                    <div>
                      <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Deadline</span>
                      <span className="block text-neutral-900 mt-0.5">
                        {new Date(neg.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Maks Revisi</span>
                      <span className="block text-neutral-900 mt-0.5">{neg.revisionCount || 2}x</span>
                    </div>
                  </div>

                  {/* Billing Details */}
                  <div className="border-t border-neutral-100 pt-3 space-y-1.5 font-bold">
                    <div className="flex justify-between text-neutral-500">
                      <span>Harga Rate Card</span>
                      <span>{formatCurrency(neg.finalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Biaya Platform (3%)</span>
                      <span>{formatCurrency(neg.platformFee || Math.round(neg.finalPrice * 0.03))}</span>
                    </div>
                    <div className="flex justify-between text-neutral-900 font-black border-t border-neutral-100 pt-2 text-sm leading-none">
                      <span>Total Biaya</span>
                      <span>{formatCurrency(neg.totalAmount || (neg.finalPrice + Math.round(neg.finalPrice * 0.03)))}</span>
                    </div>
                  </div>

                  {/* Escrow Status info */}
                  <div className="pt-2">
                    <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Status Keamanan Escrow</span>
                    <span
                      className={cn(
                        "inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                        neg.escrowStatus === "Escrowed"
                          ? "bg-green-50 text-green-700 border-green-150"
                          : neg.escrowStatus === "Released"
                          ? "bg-blue-50 text-blue-700 border-blue-150"
                          : "bg-amber-50 text-amber-700 border-amber-150"
                      )}
                    >
                      🔒 {neg.escrowStatus || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deliverables Interactive Checklist */}
              <div className="bg-white border border-neutral-200/50 shadow-sm rounded-3xl p-6 space-y-4">
                <h4 className="font-extrabold text-neutral-900 text-xs border-b border-neutral-100 pb-3 uppercase tracking-wider">
                  Checklist Deliverables
                </h4>

                <div className="space-y-3 text-xs font-semibold text-neutral-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-neutral-300 text-primary w-4 h-4 cursor-pointer" />
                    <span>Inisiasi Negosiasi &amp; Deal</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked={neg.status !== "Negosiasi" && neg.status !== "MenungguPembayaran"} className="rounded border-neutral-300 text-primary w-4 h-4 cursor-pointer" />
                    <span>Pembayaran Escrow UMKM</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked={!!neg.submittedCollabUrl} className="rounded border-neutral-300 text-primary w-4 h-4 cursor-pointer" />
                    <span>Submit Collab Post URL</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked={neg.status === "Selesai"} className="rounded border-neutral-300 text-primary w-4 h-4 cursor-pointer" />
                    <span>Pelepasan Dana Escrow</span>
                  </label>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Modal 1: Buat Custom Offer */}
      {isOfferModalOpen && neg && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-neutral-900 leading-none">Buat Custom Offer</h3>
                <p className="text-xs text-neutral-400 font-bold mt-1.5 uppercase tracking-wide">{neg.umkmName}</p>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSendCustomOffer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Harga Penawaran (Rupiah)</label>
                <input
                  type="number"
                  required
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-neutral-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Deliverables Konten</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1 Reels Collab Post + 1 Story Link"
                  value={offerDeliverables}
                  onChange={(e) => setOfferDeliverables(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Durasi (Hari)</label>
                  <input
                    type="number"
                    required
                    value={offerDays}
                    onChange={(e) => setOfferDays(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Revisi Maksimal</label>
                  <input
                    type="number"
                    required
                    value={offerRevisions}
                    onChange={(e) => setOfferRevisions(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Deskripsi Ruang Lingkup (Scope)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tulis deskripsi konten, mix-and-match lookbook, dll..."
                  value={offerScope}
                  onChange={(e) => setOfferScope(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full transition-all border border-primary-600/10 shadow-md cursor-pointer"
                >
                  Kirim Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Submit Link Collab Post */}
      {isCollabModalOpen && neg && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-neutral-900 leading-none">Submit Link Collab Post</h3>
                <p className="text-xs text-neutral-400 font-bold mt-1.5 uppercase tracking-wide">{neg.projectTitle}</p>
              </div>
              <button
                onClick={() => setIsCollabModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {collabError && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-800 text-[11px] font-bold mb-4 leading-relaxed flex gap-2">
                <span>⚠️</span>
                <span>{collabError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCollabUrl} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Link Video Instagram Reels / TikTok</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.instagram.com/reel/CtO12345/"
                  value={collabUrl}
                  onChange={(e) => {
                    setCollabUrl(e.target.value);
                    if (collabError) setCollabError(null);
                  }}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                />
                <span className="block text-[10px] text-neutral-400 leading-relaxed font-semibold">
                  ⚠️ Publikasi wajib disetting publik dan menggunakan fitur &quot;Collab Post&quot; agar admin dapat memverifikasi views video.
                </span>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCollabModalOpen(false)}
                  className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full transition-all border border-primary-600/10 shadow-md cursor-pointer"
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
