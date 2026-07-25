"use client";

import { useState } from "react";
import { ClipboardList, BadgeDollarSign, ShoppingBag } from "lucide-react";
import { CreatorRateCardPackage } from "@/types/creator-dashboard";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { rateCardPackageSchema } from "@/lib/validations/rate-card.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import {
  createRateCardPackage,
  updateRateCardPackage,
  setRateCardPackageStatus,
  deleteRateCardPackage,
} from "@/services/creator/creator-dashboard.service";

// ── Metric info card — konsisten dengan SummaryCard di KeuanganView ───────────

interface MetricInfoCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  note: string;
  colors: { bg: string; iconColor: string; border: string };
  badge?: { text: string; cls: string };
}

function MetricInfoCard({ icon: Icon, label, value, note, colors, badge }: MetricInfoCardProps) {
  return (
    <div className="relative min-w-0 p-4 sm:p-5 border border-neutral-200/80 rounded-[22px] bg-gradient-to-b from-white to-neutral-50/50 shadow-[0_4px_16px_rgba(15,23,42,.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-orange-500/20 group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-[13px] grid place-items-center border shadow-[0_2px_8px_rgba(0,0,0,.06)] transition-transform duration-300 group-hover:scale-105 shrink-0"
          style={{ background: colors.bg, borderColor: colors.border, color: colors.iconColor }}
        >
          <Icon size={17} />
        </div>
        {badge && (
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.62rem] font-[900] uppercase tracking-wider border shrink-0", badge.cls)}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="text-[0.68rem] sm:text-[0.72rem] font-[800] text-neutral-400 tracking-wide uppercase leading-none">
        {label}
      </div>
      <div
        className="font-display font-[900] text-neutral-900 tracking-tight leading-tight mt-1.5 break-words"
        style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)" }}
      >
        {value}
      </div>
      <div className="text-[0.68rem] sm:text-[0.72rem] text-neutral-400 font-[600] mt-1.5 leading-none">
        {note}
      </div>
    </div>
  );
}

const MAX_PACKAGES = 3;

type Platform = "tiktok" | "instagram" | "youtube" | "all";

// ── Platform config ──────────────────────────────────────────────────────────

const PLATFORM: Record<
  Platform,
  { label: string; badgeCls: string; stripeCls: string; icon: React.ReactNode }
> = {
  tiktok: {
    label: "TikTok",
    badgeCls: "bg-neutral-900 text-white border-neutral-700",
    stripeCls: "bg-neutral-900",
    icon: (
      <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.3 9.4a3.8 3.8 0 0 1-2.1-.6v4a3.5 3.5 0 1 1-3.5-3.5 3.4 3.4 0 0 1 1.7.5v-2.3a5.5 5.5 0 0 0-1.7-.3 5.5 5.5 0 1 0 5.5 5.5v-5.6a5.7 5.7 0 0 0 3.2.9v-2.1a3.6 3.6 0 0 1-3.1-.5z" />
      </svg>
    ),
  },
  instagram: {
    label: "Instagram",
    badgeCls: "bg-pink-50 text-pink-700 border-pink-200",
    stripeCls: "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500",
    icon: (
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  youtube: {
    label: "YouTube",
    badgeCls: "bg-red-50 text-red-700 border-red-200",
    stripeCls: "bg-red-600",
    icon: (
      <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  all: {
    label: "Semua Platform",
    badgeCls: "bg-blue-50 text-blue-700 border-blue-200",
    stripeCls: "bg-gradient-to-r from-blue-500 to-indigo-500",
    icon: (
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
};

function PlatformBadge({ platform }: { platform?: Platform }) {
  const cfg = PLATFORM[platform ?? "all"];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider", cfg.badgeCls)}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── Package card ─────────────────────────────────────────────────────────────

interface PackageCardProps {
  pkg: CreatorRateCardPackage;
  onToggle: (pkg: CreatorRateCardPackage) => void;
  onEdit: (pkg: CreatorRateCardPackage) => void;
  onDelete: (pkg: CreatorRateCardPackage) => void;
  busy?: boolean;
}

function PackageCard({ pkg, onToggle, onEdit, onDelete, busy }: PackageCardProps) {
  // MVP TikTok-only — tak ada kolom platform di rate_card_packages.
  const p: Platform = "tiktok";
  const cfg = PLATFORM[p];
  const isPublished = pkg.status === "published";

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-[26px] overflow-hidden border border-neutral-200/60 bg-white",
        "shadow-[0_8px_24px_rgba(15,23,42,.06)]",
        "hover:shadow-[0_18px_46px_rgba(15,23,42,.11)] hover:-translate-y-1",
        "transition-all duration-[240ms]",
        !isPublished && "opacity-60"
      )}
    >
      {/* Platform accent stripe */}
      <div className={cn("h-[3.5px] w-full shrink-0", cfg.stripeCls)} />

      <div className="flex flex-col flex-1 p-5 sm:p-6 gap-4">

        {/* Header: platform badge + status toggle */}
        <div className="flex items-center justify-between gap-2">
          <PlatformBadge platform={p} />
          <button
            onClick={() => onToggle(pkg)}
            disabled={busy}
            aria-label={isPublished ? "Jadikan draft" : "Tayangkan paket"}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border cursor-pointer select-none transition-all duration-200 shrink-0 disabled:opacity-50",
              isPublished
                ? "bg-green-50 text-green-700 border-green-200/80 hover:bg-green-100"
                : "bg-neutral-50 text-neutral-400 border-neutral-200 hover:bg-neutral-100"
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isPublished ? "bg-green-500" : "bg-neutral-300")} />
            {isPublished ? "Tayang" : "Draft"}
          </button>
        </div>

        {/* Title */}
        <h4 className="font-extrabold text-neutral-900 group-hover:text-primary transition-colors duration-200 text-[15px] leading-snug -mt-1">
          {pkg.name}
        </h4>

        {/* Price chip */}
        <div className={cn(
          "rounded-2xl px-4 py-3.5 border transition-colors duration-200",
          isPublished
            ? "bg-gradient-to-br from-orange-50/90 via-amber-50/50 to-transparent border-orange-100 group-hover:border-orange-200"
            : "bg-neutral-50/80 border-neutral-200/50"
        )}>
          <span className={cn("block text-[9px] font-bold uppercase tracking-wider mb-1.5", isPublished ? "text-orange-500" : "text-neutral-400")}>
            Harga Paket
          </span>
          <span
            className={cn("font-display font-black tracking-tight leading-none", isPublished ? "text-orange-700" : "text-neutral-600")}
            style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)" }}
          >
            {formatCurrency(pkg.price)}
          </span>
        </div>

        {/* Description */}
        <p className="text-[11.5px] text-neutral-500 font-medium leading-relaxed line-clamp-2 -mt-1">
          {pkg.description}
        </p>

        {/* Spec rows */}
        <div className="border-t border-dashed border-neutral-200 pt-4 space-y-3 flex-1">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400 font-semibold shrink-0">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Estimasi Durasi
            </span>
            <span className="font-bold text-neutral-800">{pkg.estimatedDays} Hari Kerja</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400 font-semibold shrink-0">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
              </svg>
              Maks. Revisi
            </span>
            <span className="font-bold text-neutral-800">{pkg.revisionCount ?? 2}×</span>
          </div>
          <div className="flex items-start justify-between gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400 font-semibold shrink-0">
              <svg className="w-3.5 h-3.5 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Output / Deliverables
            </span>
            <span className="font-bold text-neutral-800 text-right line-clamp-2 max-w-[55%]">
              {pkg.deliverable}
            </span>
          </div>
        </div>

        {/* Action row — 2 buttons, full-width, min 44px */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => onEdit(pkg)}
            className="py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs border border-neutral-200/60 transition-all duration-150 cursor-pointer min-h-[44px]"
          >
            Ubah Paket
          </button>
          <button
            onClick={() => onDelete(pkg)}
            className="py-3 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200/50 transition-all duration-150 cursor-pointer min-h-[44px]"
          >
            Hapus
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Grid cols helper ──────────────────────────────────────────────────────────

function packageGridClass(count: number): string {
  if (count <= 1) return "grid grid-cols-1 gap-6";
  if (count === 2) return "grid grid-cols-1 sm:grid-cols-2 gap-6";
  return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
}

// ── Main view ─────────────────────────────────────────────────────────────────

interface RateCardViewProps {
  initialPackages: CreatorRateCardPackage[];
  /** Jumlah order Rate Card masuk — agregasi backend, bukan dihitung di klien. */
  ordersCount: number;
}

export function RateCardView({ initialPackages, ordersCount }: RateCardViewProps) {
  const [packages, setPackages] = useState<CreatorRateCardPackage[]>(
    initialPackages.map((p) => ({
      ...p,
      revisionCount: p.revisionCount ?? 2,
    }))
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activePackage, setActivePackage] = useState<CreatorRateCardPackage | null>(null);

  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState(150000);
  const [formDeliverables, setFormDeliverables] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDuration, setFormDuration] = useState(3);
  const [formRevisions, setFormRevisions] = useState(2);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteBlocked, setDeleteBlocked] = useState(false);

  // Derived
  const activeCount = packages.filter((p) => p.status === "published").length;
  const activePrices = packages.filter((p) => p.status === "published").map((p) => p.price);
  const startingPrice = activePrices.length > 0 ? Math.min(...activePrices) : 0;
  const isAtLimit = packages.length >= MAX_PACKAGES;

  const showToast = (msg: string) => toast.success(msg);

  const buildInput = () => ({
    name: formName.trim(),
    description: formDesc.trim(),
    output: formDeliverables.trim(),
    deliveryDays: formDuration,
    price: formPrice,
    revisionLimit: formRevisions,
    published: formIsActive,
  });

  const openCreate = () => {
    if (isAtLimit) return;
    setFormName(""); setFormPrice(150000); setFormDeliverables("");
    setFormDesc(""); setFormDuration(3); setFormRevisions(2);
    setFormIsActive(true); setFormError(null);
    setIsCreateOpen(true);
  };

  const handleToggleActive = async (pkg: CreatorRateCardPackage) => {
    const next = pkg.status === "published" ? ("draft" as const) : ("published" as const);
    setTogglingId(pkg.id);
    const res = await setRateCardPackageStatus(
      { id: pkg.id, rateCardId: pkg.rateCardId, base: pkg },
      next
    );
    setTogglingId(null);
    if (res.success && res.data) {
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? res.data! : p)));
      showToast(`Paket berhasil ${next === "published" ? "diaktifkan" : "dinonaktifkan"}!`);
    } else {
      toast.error(res.error ?? "Gagal mengubah status paket.");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseOrErrors(rateCardPackageSchema, buildInput());
    if (!parsed.ok) {
      setFormError(Object.values(parsed.errors)[0] ?? "Periksa kembali isian paket.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    const res = await createRateCardPackage({ ...parsed.data, published: formIsActive });
    setIsSubmitting(false);
    if (res.success && res.data) {
      setPackages((prev) => [...prev, res.data!]);
      setIsCreateOpen(false);
      showToast(`Paket "${res.data.name}" berhasil dibuat!`);
    } else {
      setFormError(res.error ?? "Gagal membuat paket.");
    }
  };

  const handleOpenEdit = (pkg: CreatorRateCardPackage) => {
    setActivePackage(pkg);
    setFormName(pkg.name); setFormPrice(pkg.price);
    setFormDeliverables(pkg.deliverable); setFormDesc(pkg.description);
    setFormDuration(pkg.estimatedDays); setFormRevisions(pkg.revisionCount ?? 2);
    setFormIsActive(pkg.status === "published"); setFormError(null);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePackage) return;
    const parsed = parseOrErrors(rateCardPackageSchema, buildInput());
    if (!parsed.ok) {
      setFormError(Object.values(parsed.errors)[0] ?? "Periksa kembali isian paket.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    const res = await updateRateCardPackage(
      { id: activePackage.id, rateCardId: activePackage.rateCardId },
      { ...parsed.data, published: formIsActive }
    );
    setIsSubmitting(false);
    if (res.success && res.data) {
      setPackages((prev) => prev.map((p) => (p.id === activePackage.id ? res.data! : p)));
      setIsEditOpen(false); setActivePackage(null);
      showToast(`Paket "${res.data.name}" berhasil diperbarui!`);
    } else {
      setFormError(res.error ?? "Gagal memperbarui paket.");
    }
  };

  const handleOpenDelete = (pkg: CreatorRateCardPackage) => {
    setActivePackage(pkg);
    setDeleteError(null);
    setDeleteBlocked(false);
    setIsDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!activePackage) return;
    setIsSubmitting(true);
    const res = await deleteRateCardPackage({
      id: activePackage.id,
      rateCardId: activePackage.rateCardId,
    });
    setIsSubmitting(false);
    if (res.success) {
      setPackages((prev) => prev.filter((p) => p.id !== activePackage.id));
      setIsDeleteOpen(false); setActivePackage(null);
      showToast("Paket Rate Card berhasil dihapus.");
    } else {
      // forbidden/validation → tawarkan "Jadikan Draft" alih-alih gagal senyap.
      setDeleteError(res.error ?? "Gagal menghapus paket.");
      setDeleteBlocked(res.code === "forbidden" || res.code === "validation");
    }
  };

  const handleMakeDraftFromDelete = async () => {
    if (!activePackage) return;
    setIsSubmitting(true);
    const res = await setRateCardPackageStatus(
      { id: activePackage.id, rateCardId: activePackage.rateCardId, base: activePackage },
      "draft"
    );
    setIsSubmitting(false);
    if (res.success && res.data) {
      setPackages((prev) => prev.map((p) => (p.id === activePackage.id ? res.data! : p)));
      setIsDeleteOpen(false); setActivePackage(null);
      showToast("Paket dijadikan draft — tidak lagi tampil di marketplace.");
    } else {
      setDeleteError(res.error ?? "Gagal menjadikan draft.");
    }
  };

  // ── Error ──

  const shownPackages = packages;

  // ── Shared input class ──
  const inputCls = "w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800 text-xs";

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">

        <div>

          {/* ── Page header ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
            <CreatorPageHeader
              title="Paket Rate Card Jasa"
              description="Kelola paket jasa kreator untuk order fixed-price."
            />
            <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={openCreate}
                disabled={isAtLimit}
                aria-disabled={isAtLimit}
                className={cn(
                  "w-full sm:w-auto px-5 py-3 text-white rounded-xl text-xs font-black transition-all shadow-md border min-h-[46px]",
                  isAtLimit
                    ? "bg-neutral-300 border-neutral-400/10 cursor-not-allowed opacity-60"
                    : "bg-primary hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(249,115,22,.22)] border-primary-600/10 cursor-pointer"
                )}
              >
                + Buat Paket Baru
              </button>
              {isAtLimit && (
                <p className="text-[10px] text-amber-600 font-bold sm:text-right leading-snug">
                  Anda sudah mencapai maksimal 3 paket. Hapus satu paket untuk menambah baru.
                </p>
              )}
            </div>
          </div>

          {/* ── Metric summary ── */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
            <MetricInfoCard
              icon={ClipboardList}
              label="Paket Aktif"
              value={activeCount.toString()}
              note="Tampil di direktori kreator"
              colors={{ bg: "#f0f6ff", iconColor: "#2563eb", border: "#bfdbfe" }}
            />
            <MetricInfoCard
              icon={BadgeDollarSign}
              label="Harga Mulai Dari"
              value={startingPrice > 0 ? formatCurrency(startingPrice) : "—"}
              note="Harga paket termurah aktif"
              colors={{ bg: "#fff7ed", iconColor: "#ea580c", border: "#fed7aa" }}
            />
            <MetricInfoCard
              icon={ShoppingBag}
              label="Order Jasa Masuk"
              value={ordersCount.toString()}
              note="Melalui Rate Card"
              colors={{ bg: "#f1fbf5", iconColor: "#16a34a", border: "#bbf7d0" }}
            />
          </div>

          {/* ── Package catalog ── */}
          {shownPackages.length === 0 ? (
            <CreatorEmptyState
              title="Belum ada paket Rate Card"
              description="Buat paket jasa Rate Card kolaborasi fixed-price pertamamu untuk mulai mendapatkan penawaran langsung dari UMKM."
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
              actionButton={
                <button onClick={openCreate} className="px-5 py-2.5 bg-primary hover:bg-primary-600 text-white font-extrabold text-xs rounded-full transition-all border border-primary-600/10 shadow cursor-pointer">
                  Buat Paket Pertama
                </button>
              }
            />
          ) : (
            <div className={packageGridClass(shownPackages.length)}>
              {shownPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onToggle={handleToggleActive}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                  busy={togglingId === pkg.id}
                />
              ))}
            </div>
          )}

        </div>

      {/* ════════════════ Modal: Create ════════════════ */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <h3 className="text-base font-black text-neutral-900 leading-none">Buat Paket Baru</h3>
                <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">Lengkapi spesifikasi jasa Rate Card</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0" aria-label="Tutup">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-800 text-xs font-bold mb-4">⚠️ {formError}</div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Nama Paket</label>
                <input type="text" required placeholder="Contoh: Standard TikTok Review" value={formName} onChange={(e) => setFormName(e.target.value)} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Harga (Rp)</label>
                  <input type="number" required min={0} value={formPrice} onChange={(e) => setFormPrice(Number(e.target.value))} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Estimasi (Hari)</label>
                  <input type="number" required min={1} value={formDuration} onChange={(e) => setFormDuration(Number(e.target.value))} className={inputCls} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Batas Revisi</label>
                <input type="number" required min={0} value={formRevisions} onChange={(e) => setFormRevisions(Number(e.target.value))} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Output / Deliverables</label>
                <input type="text" required placeholder="Contoh: 1 Video TikTok (30-60 detik) + Link Bio 3 Hari" value={formDeliverables} onChange={(e) => setFormDeliverables(e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Deskripsi Paket</label>
                <textarea rows={3} required placeholder="Jelaskan konsep konten, visual tone, dan apa yang didapat UMKM..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className={cn(inputCls, "resize-none")} />
              </div>
              <div className="flex items-center gap-3 py-2 bg-neutral-50 px-4 rounded-xl border border-neutral-200/40">
                <input type="checkbox" id="create-active" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} className="rounded border-neutral-300 text-primary w-4 h-4 cursor-pointer" />
                <label htmlFor="create-active" className="font-bold text-neutral-700 cursor-pointer select-none">Aktifkan dan tampilkan di katalog publik</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" disabled={isSubmitting} onClick={() => setIsCreateOpen(false)} className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full transition-all border border-primary-600/10 shadow-md cursor-pointer disabled:opacity-60">{isSubmitting ? "Menyimpan…" : "Buat Paket"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ Modal: Edit ════════════════ */}
      {isEditOpen && activePackage && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <h3 className="text-base font-black text-neutral-900 leading-none">Ubah Paket Jasa</h3>
                <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">{activePackage.name}</p>
              </div>
              <button onClick={() => { setIsEditOpen(false); setActivePackage(null); }} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0" aria-label="Tutup">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-800 text-xs font-bold mb-4">⚠️ {formError}</div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Nama Paket</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Harga (Rp)</label>
                  <input type="number" required min={0} value={formPrice} onChange={(e) => setFormPrice(Number(e.target.value))} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Estimasi (Hari)</label>
                  <input type="number" required min={1} value={formDuration} onChange={(e) => setFormDuration(Number(e.target.value))} className={inputCls} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Batas Revisi</label>
                <input type="number" required min={0} value={formRevisions} onChange={(e) => setFormRevisions(Number(e.target.value))} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Output / Deliverables</label>
                <input type="text" required value={formDeliverables} onChange={(e) => setFormDeliverables(e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Deskripsi Paket</label>
                <textarea rows={3} required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className={cn(inputCls, "resize-none")} />
              </div>
              <div className="flex items-center gap-3 py-2 bg-neutral-50 px-4 rounded-xl border border-neutral-200/40">
                <input type="checkbox" id="edit-active" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} className="rounded border-neutral-300 text-primary w-4 h-4 cursor-pointer" />
                <label htmlFor="edit-active" className="font-bold text-neutral-700 cursor-pointer select-none">Aktifkan dan tampilkan di katalog publik</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" disabled={isSubmitting} onClick={() => { setIsEditOpen(false); setActivePackage(null); }} className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full transition-all border border-primary-600/10 shadow-md cursor-pointer disabled:opacity-60">{isSubmitting ? "Menyimpan…" : "Simpan Perubahan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ Modal: Delete confirm ════════════════ */}
      {isDeleteOpen && activePackage && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-sm w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-5 mx-auto">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-black text-neutral-900 text-center mb-2">Hapus Paket Jasa?</h3>
            <p className="text-xs text-neutral-500 font-semibold leading-relaxed text-center mb-4">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-extrabold text-neutral-900">&quot;{activePackage.name}&quot;</span>{" "}
              secara permanen? Tindakan ini tidak dapat dibatalkan.
            </p>

            {deleteError && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-800 text-[11px] font-semibold leading-relaxed mb-4">
                {deleteError}
              </div>
            )}

            {deleteBlocked ? (
              <div className="flex flex-col gap-3">
                <button type="button" disabled={isSubmitting} onClick={handleMakeDraftFromDelete} className="w-full py-3 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full transition-all shadow-md cursor-pointer disabled:opacity-60">
                  {isSubmitting ? "Memproses…" : "Jadikan Draft Saja"}
                </button>
                <button type="button" onClick={() => { setIsDeleteOpen(false); setActivePackage(null); }} className="w-full py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer">Tutup</button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button type="button" disabled={isSubmitting} onClick={() => { setIsDeleteOpen(false); setActivePackage(null); }} className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer disabled:opacity-50">Batal</button>
                <button type="button" disabled={isSubmitting} onClick={executeDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full transition-all shadow-md cursor-pointer disabled:opacity-60">{isSubmitting ? "Menghapus…" : "Ya, Hapus Paket"}</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
