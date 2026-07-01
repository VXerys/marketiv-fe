"use client";

import { useState } from "react";
import { CreatorRateCardPackage } from "@/types/creator-dashboard";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { CreatorMetricCard } from "./CreatorMetricCard";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { CreatorErrorState } from "./CreatorErrorState";
import { CreatorCardSkeleton, CreatorMetricSkeleton } from "./CreatorSkeleton";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface RateCardViewProps {
  initialPackages: CreatorRateCardPackage[];
}

export function RateCardView({ initialPackages }: RateCardViewProps) {
  const [packages, setPackages] = useState<CreatorRateCardPackage[]>(
    initialPackages.map(p => ({
      ...p,
      revisionCount: p.revisionCount || 2,
      platform: p.platform || "all",
    }))
  );

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form fields
  const [activePackage, setActivePackage] = useState<CreatorRateCardPackage | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState(150000);
  const [formDeliverables, setFormDeliverables] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDuration, setFormDuration] = useState(3);
  const [formRevisions, setFormRevisions] = useState(2);
  const [formPlatform, setFormPlatform] = useState<"tiktok" | "instagram" | "youtube" | "all">("all");
  const [formIsActive, setFormIsActive] = useState(true);

  // Slicing states (DoD)
  const [isLoadingSimulated, setIsLoadingSimulated] = useState(false);
  const [isEmptySimulated, setIsEmptySimulated] = useState(false);
  const [isErrorSimulated, setIsErrorSimulated] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics summary
  const activePackagesCount = packages.filter(p => p.isActive).length;
  const activePrices = packages.filter(p => p.isActive).map(p => p.price);
  const startingPrice = activePrices.length > 0 ? Math.min(...activePrices) : 0;
  const mockOrdersCount = 14; // Mock rate card order count
  const mostPopularPkg = packages.length > 0 ? packages[0].name : "Standard Single Post";

  // Toggle package active state
  const handleToggleActive = (id: string, currentState: boolean) => {
    setPackages(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isActive: !currentState } : p
      )
    );
    showToast(`Paket berhasil ${currentState ? "dinonaktifkan" : "diaktifkan"}!`);
  };

  // Create Package
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDeliverables.trim()) {
      setFormError("Judul paket dan deliverables wajib diisi.");
      return;
    }
    setFormError(null);

    const newPkg: CreatorRateCardPackage = {
      id: `pkg_new_${Date.now()}`,
      name: formName.trim(),
      price: Number(formPrice),
      deliverable: formDeliverables.trim(),
      description: formDesc.trim(),
      estimatedDays: Number(formDuration),
      revisionCount: Number(formRevisions),
      platform: formPlatform,
      isActive: formIsActive,
    };

    setPackages(prev => [...prev, newPkg]);
    setIsCreateOpen(false);
    showToast(`Paket kustom "${formName}" berhasil dibuat!`);
  };

  // Open Edit modal
  const handleOpenEdit = (pkg: CreatorRateCardPackage) => {
    setActivePackage(pkg);
    setFormName(pkg.name);
    setFormPrice(pkg.price);
    setFormDeliverables(pkg.deliverable);
    setFormDesc(pkg.description);
    setFormDuration(pkg.estimatedDays);
    setFormRevisions(pkg.revisionCount || 2);
    setFormPlatform(pkg.platform || "all");
    setFormIsActive(pkg.isActive);
    setIsEditOpen(true);
  };

  // Edit Package submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePackage || !formName.trim() || !formDeliverables.trim()) return;

    setPackages(prev =>
      prev.map(p =>
        p.id === activePackage.id
          ? {
              ...p,
              name: formName.trim(),
              price: Number(formPrice),
              deliverable: formDeliverables.trim(),
              description: formDesc.trim(),
              estimatedDays: Number(formDuration),
              revisionCount: Number(formRevisions),
              platform: formPlatform,
              isActive: formIsActive,
            }
          : p
      )
    );

    setIsEditOpen(false);
    setActivePackage(null);
    showToast(`Detail paket "${formName}" berhasil diperbarui!`);
  };

  // Duplicate Package
  const handleDuplicate = (pkg: CreatorRateCardPackage) => {
    const duplicatedPkg: CreatorRateCardPackage = {
      ...pkg,
      id: `pkg_dup_${Date.now()}`,
      name: `${pkg.name} [Copy]`,
      isActive: false, // Default duplicated is inactive
    };
    setPackages(prev => [...prev, duplicatedPkg]);
    showToast(`Paket "${pkg.name}" berhasil digandakan.`);
  };

  // Open Delete Confirm
  const handleOpenDelete = (pkg: CreatorRateCardPackage) => {
    setActivePackage(pkg);
    setIsDeleteOpen(true);
  };

  // Delete Package
  const executeDelete = () => {
    if (!activePackage) return;
    setPackages(prev => prev.filter(p => p.id !== activePackage.id));
    setIsDeleteOpen(false);
    setActivePackage(null);
    showToast("Paket Rate Card berhasil dihapus.");
  };

  // Error simulation
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
          errorMsg="Gagal menyinkronkan daftar paket Rate Card ke database."
          onRetry={() => {
            setIsErrorSimulated(false);
            showToast("Sinkronisasi Rate Card berhasil dipulihkan!");
          }}
        />
      </div>
    );
  }

  const shownPackages = isEmptySimulated ? [] : packages;

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
          <span>Panel Simulator State (Rate Card Slicing):</span>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
            <CreatorPageHeader
              title="Paket Rate Card Jasa"
              description="Kelola paket jasa kreator untuk order fixed-price."
            />
            <button
              onClick={() => {
                setFormName("");
                setFormPrice(150000);
                setFormDeliverables("");
                setFormDesc("");
                setFormDuration(3);
                setFormRevisions(2);
                setFormPlatform("all");
                setFormIsActive(true);
                setFormError(null);
                setIsCreateOpen(true);
              }}
              className="px-5 py-3 bg-primary hover:bg-primary-600 text-white rounded-xl text-xs font-black transition-all shadow-md border border-primary-600/10 cursor-pointer shrink-0"
            >
              + Buat Paket Baru
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <CreatorMetricCard
              label="Paket Aktif"
              value={activePackagesCount}
              helperText="Tampil di direktori"
              icon={
                <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
            />
            <CreatorMetricCard
              label="Harga Mulai Dari"
              value={startingPrice}
              isCurrency={true}
              helperText="Harga paket termurah"
              variant="orange"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <CreatorMetricCard
              label="Order Jasa Masuk"
              value={mockOrdersCount}
              helperText="Lewat Rate Card"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            />
            <div className="bg-white border border-neutral-200/50 p-6 rounded-3xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">Paket Terpopuler</span>
                <span className="block text-sm font-black text-neutral-900 leading-tight">{mostPopularPkg}</span>
                <span className="block text-[10px] text-green-600 font-bold uppercase">Best Seller</span>
              </div>
            </div>
          </div>

          {/* Package Catalog */}
          {shownPackages.length === 0 ? (
            <CreatorEmptyState
              title="Belum ada paket Rate Card"
              description="Buat paket jasa Rate Card kolaborasi fixed-price pertamamu untuk mulai mendapatkan penawaran langsung dari UMKM."
              actionButton={
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-600 text-white font-extrabold text-xs rounded-full transition-all border border-primary-600/10 shadow"
                >
                  Buat Paket Pertama
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
              {shownPackages.map(pkg => (
                <div
                  key={pkg.id}
                  className={cn(
                    "bg-white/95 border border-neutral-200/50 shadow-sm rounded-3xl p-6 hover:shadow-md transition-all flex flex-col justify-between h-full group",
                    !pkg.isActive && "opacity-75"
                  )}
                >
                  <div>
                    {/* Header info */}
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <h4 className="font-extrabold text-neutral-900 group-hover:text-primary transition-colors text-sm leading-tight">
                          {pkg.name}
                        </h4>
                        <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[8px] font-black uppercase tracking-wider">
                          📱 {pkg.platform || "all"}
                        </span>
                      </div>

                      {/* Active Status Badge */}
                      <button
                        onClick={() => handleToggleActive(pkg.id, pkg.isActive)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border cursor-pointer select-none transition-all duration-300",
                          pkg.isActive
                            ? "bg-green-50 text-green-700 border-green-150 hover:bg-green-100"
                            : "bg-neutral-50 text-neutral-400 border-neutral-200 hover:bg-neutral-100"
                        )}
                      >
                        {pkg.isActive ? "● aktif" : "○ nonaktif"}
                      </button>
                    </div>

                    <p className="text-xs text-neutral-500 font-semibold leading-relaxed mb-4 line-clamp-3">
                      {pkg.description}
                    </p>

                    {/* Specs List */}
                    <div className="space-y-2.5 border-t border-neutral-100 pt-3.5 mb-5 text-xs font-semibold text-neutral-600">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Harga Jasa</span>
                        <span className="text-neutral-900 font-black">{formatCurrency(pkg.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Estimasi Durasi</span>
                        <span className="text-neutral-900 font-bold">{pkg.estimatedDays} Hari Kerja</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Maksimal Revisi</span>
                        <span className="text-neutral-900 font-bold">{pkg.revisionCount || 2}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Deliverables</span>
                        <span className="text-neutral-900 font-bold text-right truncate max-w-[160px]">
                          {pkg.deliverable}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 mt-auto pt-2 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="text-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-[10px] py-2 rounded-xl transition-all border border-neutral-300/40 cursor-pointer"
                    >
                      Ubah
                    </button>
                    <button
                      onClick={() => handleDuplicate(pkg)}
                      className="text-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-[10px] py-2 rounded-xl transition-all border border-neutral-300/40 cursor-pointer"
                    >
                      Salin
                    </button>
                    <button
                      onClick={() => handleOpenDelete(pkg)}
                      className="text-center bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] py-2 rounded-xl transition-all border border-red-200/40 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Create Package */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <h3 className="text-base font-black text-neutral-900 leading-none">Buat Paket Baru</h3>
                <p className="text-[10px] text-neutral-400 font-bold mt-1">LENGKAPI SPESIFIKASI JASA RATE CARD KOLABORASI</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-800 text-xs font-bold mb-4">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Nama Paket Jasa</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Premium Instagram Feed Pack"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Harga Paket (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-neutral-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Target Platform</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as "tiktok" | "instagram" | "youtube" | "all")}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-neutral-700 cursor-pointer focus:outline-none"
                  >
                    <option value="all">Semua (Cross-Post)</option>
                    <option value="tiktok">TikTok Video</option>
                    <option value="instagram">Instagram Reels</option>
                    <option value="youtube">YouTube Video</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Durasi Kerja (Hari)</label>
                  <input
                    type="number"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Batas Jumlah Revisi</label>
                  <input
                    type="number"
                    required
                    value={formRevisions}
                    onChange={(e) => setFormRevisions(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Rincian Deliverables</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1 Reels Collab Post + 1 IG Stories (Tag Brand)"
                  value={formDeliverables}
                  onChange={(e) => setFormDeliverables(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Deskripsi Paket Jasa</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Deskripsikan konsep outfit lookbook, visual tone warna, dsb..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 py-1 bg-neutral-50 px-4 rounded-xl border border-neutral-200/30">
                <input
                  type="checkbox"
                  id="create-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-neutral-300 text-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="create-active" className="font-bold text-neutral-700 cursor-pointer select-none">
                  Aktifkan langsung dan tampilkan di katalog publik
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full transition-all border border-primary-600/10 shadow-md cursor-pointer"
                >
                  Buat Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Package */}
      {isEditOpen && activePackage && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <h3 className="text-base font-black text-neutral-900 leading-none">Ubah Paket Jasa</h3>
                <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">{activePackage.name}</p>
              </div>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setActivePackage(null);
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Nama Paket Jasa</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Harga Paket (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-neutral-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Target Platform</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as "tiktok" | "instagram" | "youtube" | "all")}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-neutral-700 cursor-pointer focus:outline-none"
                  >
                    <option value="all">Semua (Cross-Post)</option>
                    <option value="tiktok">TikTok Video</option>
                    <option value="instagram">Instagram Reels</option>
                    <option value="youtube">YouTube Video</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Durasi Kerja (Hari)</label>
                  <input
                    type="number"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Batas Jumlah Revisi</label>
                  <input
                    type="number"
                    required
                    value={formRevisions}
                    onChange={(e) => setFormRevisions(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Rincian Deliverables</label>
                <input
                  type="text"
                  required
                  value={formDeliverables}
                  onChange={(e) => setFormDeliverables(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Deskripsi Paket Jasa</label>
                <textarea
                  rows={3}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 py-1 bg-neutral-50 px-4 rounded-xl border border-neutral-200/30">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-neutral-300 text-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="edit-active" className="font-bold text-neutral-700 cursor-pointer select-none">
                  Aktifkan paket jasa ini dan tampilkan di katalog
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setActivePackage(null);
                  }}
                  className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full transition-all border border-primary-600/10 shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Delete Confirm */}
      {isDeleteOpen && activePackage && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-base font-black text-neutral-900 leading-none mb-3">
              Hapus Paket Jasa?
            </h3>
            <p className="text-xs text-neutral-500 font-semibold leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus paket Rate Card <span className="font-extrabold text-neutral-900">&quot;{activePackage.name}&quot;</span> secara permanen dari katalog Anda? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setActivePackage(null);
                }}
                className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full transition-all border border-red-700/10 shadow-md cursor-pointer"
              >
                Ya, Hapus Paket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
