"use client";

import { useState } from "react";
import Link from "next/link";
import { CreatorNegotiation } from "@/types/creator-dashboard";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { CreatorMetricCard } from "./CreatorMetricCard";
import { CreatorStatusBadge } from "./CreatorStatusBadge";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { CreatorErrorState } from "./CreatorErrorState";
import { CreatorCardSkeleton, CreatorMetricSkeleton } from "./CreatorSkeleton";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface NegosiasiViewProps {
  initialNegotiations: CreatorNegotiation[];
}

export function NegosiasiView({ initialNegotiations }: NegosiasiViewProps) {
  const [negotiations] = useState<CreatorNegotiation[]>(initialNegotiations);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // Slicing states
  const [isLoadingSimulated, setIsLoadingSimulated] = useState(false);
  const [isEmptySimulated, setIsEmptySimulated] = useState(false);
  const [isErrorSimulated, setIsErrorSimulated] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSortBy("latest");
  };

  // Metrics count
  const countNegotiation = negotiations.filter(n => n.status === "Negosiasi").length;
  const countPendingPayment = negotiations.filter(n => n.status === "MenungguPembayaran").length;
  const countEscrow = negotiations.filter(n => n.status === "Escrow" || n.status === "Revisi" || n.status === "MenungguVerifikasi").length;
  const countCompleted = negotiations.filter(n => n.status === "Selesai").length;

  // Filtering & Sorting
  const filteredNegotiations = negotiations
    .filter((n) => {
      const matchesSearch =
        n.umkmName.toLowerCase().includes(search.toLowerCase()) ||
        n.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
        n.lastMessage.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "negosiasi" && n.status === "Negosiasi") ||
        (selectedStatus === "menunggu-pembayaran" && n.status === "MenungguPembayaran") ||
        (selectedStatus === "escrow" && (n.status === "Escrow" || n.status === "Revisi" || n.status === "MenungguVerifikasi")) ||
        (selectedStatus === "selesai" && n.status === "Selesai");

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // default: latest
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

  const hasActiveFilters = search !== "" || selectedStatus !== "all";

  // Error simulated render
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
          errorMsg="Gagal memuat daftar negosiasi Rate Card. Silakan periksa jaringan Anda."
          onRetry={() => {
            setIsErrorSimulated(false);
            showToast("Daftar negosiasi berhasil dimuat kembali!");
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
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
      <div className="mb-6 bg-white/70 backdrop-blur-md border border-neutral-200/50 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-xs font-bold text-neutral-700 shrink-0">
        <div className="flex items-center gap-2 text-neutral-900">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
          <span>Panel Simulator State (Daftar Negosiasi):</span>
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
            onClick={() => setIsEmptySimulated(!isEmptySimulated)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer",
              isEmptySimulated
                ? "bg-primary text-white border-primary-600"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            )}
          >
            {isEmptySimulated ? "Matikan Empty" : "Simulasi Empty"}
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
        <div>
          <CreatorMetricSkeleton />
          <div className="h-10 bg-white border border-neutral-200/50 rounded-xl animate-pulse w-full mb-6"></div>
          <CreatorCardSkeleton count={3} />
        </div>
      ) : (
        <div>
          {/* Header */}
          <CreatorPageHeader
            title="Negosiasi Rate Card"
            description="Kelola order Rate Card dari UMKM."
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <CreatorMetricCard
              label="Negosiasi Aktif"
              value={countNegotiation}
              helperText="Dalam chat negosiasi"
              icon={
                <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
            />
            <CreatorMetricCard
              label="Menunggu Pembayaran"
              value={countPendingPayment}
              helperText="UMKM bayar invoice"
              variant="orange"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <CreatorMetricCard
              label="Escrow Aktif"
              value={countEscrow}
              helperText="Dana aman ter-escrow"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />
            <CreatorMetricCard
              label="Order Selesai"
              value={countCompleted}
              helperText="Negosiasi selesai"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-6 bg-white/80 border border-neutral-200/50 p-4 rounded-2xl">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari UMKM / judul order..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-neutral-800 placeholder-neutral-400"
                />
              </div>

              {/* Filter Status */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-sm font-bold text-neutral-700 cursor-pointer focus:outline-none min-w-[160px]"
              >
                <option value="all">Semua Status</option>
                <option value="negosiasi">Negosiasi</option>
                <option value="menunggu-pembayaran">Menunggu Pembayaran</option>
                <option value="escrow">Escrow Aktif</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none min-w-[140px]"
              >
                <option value="latest">Terbaru</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Chat / Order List */}
          {isEmptySimulated || filteredNegotiations.length === 0 ? (
            <CreatorEmptyState
              title="Belum ada negosiasi Rate Card"
              description={
                isEmptySimulated
                  ? "Kamu belum menerima chat negosiasi dari UMKM untuk penawaran paket Rate Card."
                  : "Tidak ada negosiasi yang cocok dengan filter pencarian Anda."
              }
              actionButton={
                !isEmptySimulated && hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="bg-primary hover:bg-primary-600 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all border border-primary-600/10 shadow"
                  >
                    Reset Filter
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNegotiations.map((neg) => {
                return (
                  <div
                    key={neg.id}
                    className="bg-white/95 border border-neutral-200/50 shadow-sm rounded-3xl p-6 hover:shadow-md transition-all flex flex-col justify-between h-full group"
                  >
                    <div>
                      {/* UMKM Info */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl border border-neutral-200/30 overflow-hidden shrink-0 bg-neutral-50 flex items-center justify-center font-bold text-neutral-400">
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
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-extrabold text-neutral-900 text-sm truncate leading-tight group-hover:text-primary transition-colors">
                              {neg.umkmName}
                            </h4>
                            <span className="text-[10px] text-neutral-400 font-semibold shrink-0">
                              {new Date(neg.lastMessageAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                          
                          <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider truncate">
                            📦 {neg.projectTitle}
                          </p>
                        </div>
                      </div>

                      {/* Last Message bubble */}
                      <div className="bg-neutral-50/50 border border-neutral-100 rounded-2xl p-4.5 mb-5 relative">
                        {neg.unreadCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full text-white font-extrabold text-[9px] flex items-center justify-center shadow">
                            {neg.unreadCount}
                          </span>
                        )}
                        <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pesan Terakhir</span>
                        <p className="text-xs text-neutral-600 font-semibold line-clamp-2 leading-relaxed">
                          &quot;{neg.lastMessage}&quot;
                        </p>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-3 py-3 px-4 rounded-2xl bg-neutral-50 border border-neutral-200/20 mb-5 text-xs font-semibold">
                        <div>
                          <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Harga Penawaran</span>
                          <span className="block font-black text-neutral-900 mt-0.5">
                            {formatCurrency(neg.finalPrice)}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Status Kontrak</span>
                          <div className="mt-0.5">
                            <CreatorStatusBadge status={neg.status} type="negotiation" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/kreator/negosiasi/${neg.id}`}
                      className="w-full text-center bg-primary hover:bg-primary-600 text-white font-black text-xs py-3.5 rounded-xl transition-all border border-primary-600/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 block"
                    >
                      Buka Room Negosiasi
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
