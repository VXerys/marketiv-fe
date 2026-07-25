"use client";

import { useState } from "react";
import {
  User,
  ImageIcon,
  Bell,
  ShieldCheck,
  MapPin,
  Star,
  Zap,
  CheckCircle2,
  Briefcase,
  Eye,
  Globe,
  Mail,
  Lock,
  ChevronRight,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { CreatorProfile, CreatorPortfolioItem, CreatorNiche } from "@/types/creator-dashboard";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { cn } from "@/lib/utils";

// ─── Creator brand gradient ───────────────────────────────────────────────────
const CREATOR_GRADIENT = "linear-gradient(135deg, #2563eb, #7c3aed)";
const CREATOR_GRADIENT_SOFT = "linear-gradient(135deg, rgba(37,99,235,.12) 0%, rgba(124,58,237,.10) 100%)";

// ─── Tab definition ───────────────────────────────────────────────────────────

const TABS = [
  { id: "profil", label: "Profil Kreator", icon: User, description: "Identitas publik & bio" },
  { id: "portofolio", label: "Portofolio", icon: ImageIcon, description: "Katalog konten video" },
  { id: "notifikasi", label: "Notifikasi", icon: Bell, description: "Preferensi pemberitahuan" },
  { id: "keamanan", label: "Keamanan", icon: ShieldCheck, description: "Password & akses" },
] as const;

type SettingsTab = typeof TABS[number]["id"];

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function SettingsCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-[26px] border border-neutral-200/60",
        "shadow-[0_8px_24px_rgba(15,23,42,.06)]",
        "w-full overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Section header inside a card ─────────────────────────────────────────────

function CardSectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-100">
      <h3 className="text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-[0.14em]">
        {title}
      </h3>
      {action}
    </div>
  );
}

// ─── Stat row ────────────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3.5 border-b border-neutral-100/60 last:border-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-[10px] bg-neutral-50 border border-neutral-200/60 flex items-center justify-center shrink-0 text-neutral-400">
          {icon}
        </div>
        <span className="text-[0.84rem] font-[600] text-neutral-500 truncate">{label}</span>
      </div>
      <span className="text-[0.86rem] font-[800] text-neutral-900 shrink-0">{value}</span>
    </div>
  );
}

// ─── Toggle switch (creator blue/violet) ──────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 w-12 h-[28px] rounded-full transition-all duration-250 cursor-pointer focus-visible:outline-[4px] focus-visible:outline focus-visible:outline-blue-500/20 focus-visible:outline-offset-2"
      style={{
        background: checked ? CREATOR_GRADIENT : "#e2e8f0",
        boxShadow: checked ? "0 4px 14px rgba(37,99,235,.3)" : "inset 0 1px 3px rgba(0,0,0,.08)",
      }}
    >
      <span
        className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-md transition-all duration-250"
        style={{ left: checked ? "calc(100% - 25px)" : "3px" }}
      />
    </button>
  );
}

// ─── Notification toggle row ──────────────────────────────────────────────────

function NotifToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-neutral-100/70 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-[0.9rem] font-[700] text-neutral-800 leading-tight">{label}</p>
        <p className="text-[0.76rem] font-[500] text-neutral-400 mt-0.5 leading-snug pr-4">
          {description}
        </p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

// ─── Primary button (creator brand) ──────────────────────────────────────────

function CreatorBtn({
  children,
  onClick,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 px-6 py-2.5 rounded-full",
        "text-white font-[700] text-[0.84rem] cursor-pointer",
        "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
        "focus-visible:outline-[4px] focus-visible:outline focus-visible:outline-blue-500/20 focus-visible:outline-offset-2",
        className
      )}
      style={{ background: CREATOR_GRADIENT, boxShadow: "0 6px 20px rgba(37,99,235,.22)" }}
    >
      {children}
    </button>
  );
}

// ─── Ghost button ─────────────────────────────────────────────────────────────

function GhostBtn({
  children,
  onClick,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 px-6 py-2.5 rounded-full",
        "border border-neutral-200 text-neutral-600 hover:bg-neutral-50",
        "font-[700] text-[0.84rem] cursor-pointer transition-all duration-200",
        className
      )}
    >
      {children}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════════════════

interface SettingsViewProps {
  initialProfile: CreatorProfile;
  initialPortfolio: CreatorPortfolioItem[];
}

export function SettingsView({ initialProfile, initialPortfolio }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profil");

  // ── Profile state ──
  const [profile, setProfile] = useState<CreatorProfile>({
    ...initialProfile,
    bannerUrl:
      initialProfile.bannerUrl ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop",
    averageViews: initialProfile.averageViews || 48500,
    responseTime: initialProfile.responseTime || "2 jam",
    completionRate: initialProfile.completionRate || 98,
    portfolioUrl: initialProfile.portfolioUrl || "https://nadiavisuals.myportfolio.com",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [tiktokUrl, setTiktokUrl] = useState(profile.tiktokUrl || "");
  const [instagramUrl, setInstagramUrl] = useState(profile.instagramUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolioUrl || "");
  const [selectedNiche, setSelectedNiche] = useState<CreatorNiche>(profile.niche);
  const [formError, setFormError] = useState<string | null>(null);
  const [isProfileSuccessOpen, setIsProfileSuccessOpen] = useState(false);

  // ── Portfolio state ──
  const [portfolioItems, setPortfolioItems] = useState<CreatorPortfolioItem[]>(initialPortfolio);
  const [isAddPortOpen, setIsAddPortOpen] = useState(false);
  const [isEditPortOpen, setIsEditPortOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activePortItem, setActivePortItem] = useState<CreatorPortfolioItem | null>(null);
  const [portTitle, setPortTitle] = useState("");
  const [portPlatform, setPortPlatform] = useState<"tiktok" | "instagram">("tiktok");
  const [portUrl, setPortUrl] = useState("");
  const [portNiche, setPortNiche] = useState<CreatorNiche>("kecantikan");
  const [portViews, setPortViews] = useState(50000);
  const [portDesc, setPortDesc] = useState("");

  // ── Notification toggles ──
  const [notifCampaign, setNotifCampaign] = useState(true);
  const [notifDeadline, setNotifDeadline] = useState(true);
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifPayment, setNotifPayment] = useState(true);
  const [notifMessage, setNotifMessage] = useState(true);
  const [notifNewsletter, setNotifNewsletter] = useState(false);

  const showToast = (msg: string) => toast.success(msg);

  // ── Profile handlers ──
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tiktokUrl && !tiktokUrl.includes("tiktok.com")) {
      setFormError("Tautan TikTok wajib mengandung 'tiktok.com'");
      return;
    }
    if (instagramUrl && !instagramUrl.includes("instagram.com")) {
      setFormError("Tautan Instagram wajib mengandung 'instagram.com'");
      return;
    }
    setFormError(null);
    setProfile((prev) => ({
      ...prev,
      name: displayName.trim(),
      bio: bio.trim(),
      location: location.trim(),
      tiktokUrl: tiktokUrl.trim() || undefined,
      instagramUrl: instagramUrl.trim() || undefined,
      portfolioUrl: portfolioUrl.trim() || undefined,
      niche: selectedNiche,
    }));
    setIsEditing(false);
    setIsProfileSuccessOpen(true);
  };

  // ── Portfolio handlers ──
  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle.trim() || !portUrl.trim()) return;
    const newItem: CreatorPortfolioItem = {
      id: `port_new_${Date.now()}`,
      title: portTitle.trim(),
      platform: portPlatform,
      url: portUrl.trim(),
      niche: portNiche,
      views: Number(portViews),
      thumbnailUrl:
        portPlatform === "tiktok"
          ? "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop"
          : "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop",
      description: portDesc.trim(),
    };
    setPortfolioItems((prev) => [...prev, newItem]);
    setIsAddPortOpen(false);
    setPortTitle("");
    setPortUrl("");
    setPortDesc("");
    setPortViews(50000);
    showToast("Portofolio baru berhasil ditambahkan!");
  };

  const openEditPortModal = (item: CreatorPortfolioItem) => {
    setActivePortItem(item);
    setPortTitle(item.title);
    setPortPlatform(item.platform ?? "tiktok");
    setPortUrl(item.url);
    setPortNiche(item.niche ?? "lainnya");
    setPortViews(item.views ?? 0);
    setPortDesc(item.description);
    setIsEditPortOpen(true);
  };

  const handleEditPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePortItem || !portTitle.trim() || !portUrl.trim()) return;
    setPortfolioItems((prev) =>
      prev.map((item) =>
        item.id === activePortItem.id
          ? {
              ...item,
              title: portTitle.trim(),
              platform: portPlatform,
              url: portUrl.trim(),
              niche: portNiche,
              views: Number(portViews),
              description: portDesc.trim(),
            }
          : item
      )
    );
    setIsEditPortOpen(false);
    setActivePortItem(null);
    showToast("Portofolio berhasil diperbarui!");
  };

  const openDeleteConfirm = (item: CreatorPortfolioItem) => {
    setActivePortItem(item);
    setIsDeleteConfirmOpen(true);
  };

  const executeDeletePortfolio = () => {
    if (!activePortItem) return;
    setPortfolioItems((prev) => prev.filter((item) => item.id !== activePortItem.id));
    setIsDeleteConfirmOpen(false);
    setActivePortItem(null);
    showToast("Item portofolio berhasil dihapus.");
  };

  // ── Input class ──
  const inputCls =
    "w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-[14px] " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 " +
    "transition-all font-[600] text-neutral-800 text-[0.88rem] placeholder:text-neutral-300";

  // ══════════════════════════════════════════════════════════════════════════════
  // Panel: Profil Kreator
  // ══════════════════════════════════════════════════════════════════════════════

  const renderProfil = () => (
    <div className="flex flex-col gap-5 w-full">

      {/* ── Identity showcase card ── */}
      <SettingsCard>
        {/* Banner — taller */}
        <div className="relative w-full h-48 sm:h-52 group/banner">
          {profile.bannerUrl ? (
            <img
              src={profile.bannerUrl}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full" style={{ background: CREATOR_GRADIENT }} />
          )}
          <label className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center text-[0.72rem] font-[900] text-white uppercase tracking-wider cursor-pointer gap-1.5">
            <ImageIcon size={13} /> Ganti Banner
            <input
              type="file"
              className="hidden"
              onChange={() => showToast("Banner berhasil diunggah (Simulasi).")}
            />
          </label>
          {/* Gradient fade at bottom for avatar overlap */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/30 to-transparent pointer-events-none" />
        </div>

        {/* Avatar row — overlaps banner only, never the name */}
        <div className="px-6 -mt-14 relative flex items-end justify-between gap-3">
          {/* Avatar — larger */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[22px] border-4 border-white shadow-lg overflow-hidden bg-neutral-100 shrink-0 group/avatar">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            <label className="absolute inset-0 bg-neutral-950/55 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-[0.65rem] font-[900] text-white uppercase tracking-wider cursor-pointer">
              Ganti
              <input
                type="file"
                className="hidden"
                onChange={() => showToast("Foto profil berhasil diunggah (Simulasi).")}
              />
            </label>
            {/* Online indicator */}
            <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          {/* Edit button — right-aligned, below the banner */}
          {!isEditing && (
            <button
              onClick={() => {
                setDisplayName(profile.name);
                setBio(profile.bio);
                setLocation(profile.location);
                setTiktokUrl(profile.tiktokUrl || "");
                setInstagramUrl(profile.instagramUrl || "");
                setPortfolioUrl(profile.portfolioUrl || "");
                setSelectedNiche(profile.niche);
                setIsEditing(true);
              }}
              className="mb-1 shrink-0 flex items-center gap-1.5 px-4 py-2.5 border border-neutral-200 hover:bg-neutral-50 rounded-[13px] text-[0.8rem] font-[700] text-neutral-600 transition-all cursor-pointer"
            >
              <Pencil size={13} /> Ubah Profil
            </button>
          )}
        </div>

        {/* Identity — always below banner, never overlaps */}
        <div className="px-6 pb-6 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[1.15rem] font-[900] text-neutral-900 tracking-tight leading-none">
              {profile.name}
            </h3>
            {profile.isVerified && (
              <BadgeCheck size={17} className="text-blue-500 shrink-0" />
            )}
          </div>
          <p className="text-[0.78rem] font-[600] text-neutral-400 mt-1">
            @{profile.username}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[0.66rem] font-[900] uppercase tracking-wider text-white"
              style={{ background: CREATOR_GRADIENT }}
            >
              {profile.niche}
            </span>
            <span className="flex items-center gap-1 text-[0.72rem] font-[600] text-neutral-400">
              <MapPin size={11} className="text-neutral-300" />
              {profile.location}
            </span>
          </div>

          {/* Bio & social links (view mode) */}
          {!isEditing && (
            <div className="mt-4 space-y-3">
              <p className="text-[0.9rem] font-[500] text-neutral-600 leading-relaxed">
                {profile.bio}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {profile.tiktokUrl && (
                  <a
                    href={profile.tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 text-white text-[0.75rem] font-[700] hover:bg-neutral-800 transition-colors"
                  >
                    TikTok <ExternalLink size={10} />
                  </a>
                )}
                {profile.instagramUrl && (
                  <a
                    href={profile.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600 text-white text-[0.75rem] font-[700] hover:bg-pink-700 transition-colors"
                  >
                    Instagram <ExternalLink size={10} />
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-[0.75rem] font-[700] hover:bg-blue-100 transition-colors"
                  >
                    Portfolio <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* ── Edit form (only visible while editing) ── */}
      {isEditing && (
        <SettingsCard>
          <CardSectionHeader title="Ubah Informasi Profil" />
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-[14px] text-red-800 text-[0.82rem] font-[700]">
                ⚠️ {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-wider">
                  Nama Display
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-wider">
                  Kota Lokasi
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-wider">
                Kategori Niche Utama
              </label>
              <div className="flex flex-wrap gap-2">
                {(["kecantikan", "kuliner", "fashion", "pariwisata", "lainnya"] as CreatorNiche[]).map(
                  (n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSelectedNiche(n)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-[12px] border text-[0.8rem] font-[700] capitalize transition-all cursor-pointer",
                        selectedNiche === n
                          ? "text-white border-transparent shadow-sm"
                          : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                      )}
                      style={
                        selectedNiche === n
                          ? { background: CREATOR_GRADIENT }
                          : {}
                      }
                    >
                      {n}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-wider">
                Bio Singkat
              </label>
              <textarea
                rows={3}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={cn(inputCls, "resize-none")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-100 pt-4">
              <div className="space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-wider">
                  Link TikTok
                </label>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@..."
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-wider">
                  Link Instagram
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-wider">
                  Link Web Portofolio
                </label>
                <input
                  type="url"
                  placeholder="https://myportfolio.com"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <GhostBtn
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormError(null);
                }}
                className="flex-1"
              >
                Batal
              </GhostBtn>
              <CreatorBtn type="submit" className="flex-1">
                Simpan Profil
              </CreatorBtn>
            </div>
          </form>
        </SettingsCard>
      )}

      {/* ── Statistik & Reputasi ── */}
      <SettingsCard>
        <CardSectionHeader title="Statistik & Reputasi" />
        <div className="px-6 py-1">
          <StatRow
            label="Total Kontrak Selesai"
            value={`${profile.completedJobs} Kontrak`}
            icon={<Briefcase size={13} />}
          />
          <StatRow
            label="Rata-rata Views per Konten"
            value={`${(profile.averageViews ?? 48500).toLocaleString("id-ID")} views`}
            icon={<Eye size={13} />}
          />
          <StatRow
            label="Rating dari Klien"
            value={`⭐ ${profile.rating} / 5.0`}
            icon={<Star size={13} />}
          />
          <StatRow
            label="Estimasi Waktu Respon"
            value={`⚡ ~${profile.responseTime ?? "2 jam"}`}
            icon={<Zap size={13} />}
          />
          <StatRow
            label="Tingkat Penyelesaian Job"
            value={`${profile.completionRate ?? 98}%`}
            icon={<CheckCircle2 size={13} />}
          />
          <StatRow
            label="Total Followers Gabungan"
            value={`${profile.followers.toLocaleString("id-ID")} followers`}
            icon={<Globe size={13} />}
          />
        </div>
        <div className="px-6 py-4 bg-neutral-50/60 border-t border-neutral-100">
          <p className="text-[0.72rem] font-[600] text-neutral-400 leading-relaxed">
            Statistik dihitung otomatis dari aktivitas di Marketiv dan diperbarui setiap hari.
          </p>
        </div>
      </SettingsCard>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // Panel: Portofolio
  // ══════════════════════════════════════════════════════════════════════════════

  const renderPortofolio = () => (
    <div className="flex flex-col gap-5 w-full">
      <SettingsCard>
        <CardSectionHeader
          title="Katalog Portofolio Konten"
          action={
            <button
              onClick={() => {
                setPortTitle("");
                setPortUrl("");
                setPortDesc("");
                setPortViews(50000);
                setIsAddPortOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] text-[0.78rem] font-[800] text-white transition-all cursor-pointer hover:-translate-y-0.5"
              style={{ background: CREATOR_GRADIENT, boxShadow: "0 4px 12px rgba(37,99,235,.22)" }}
            >
              <Plus size={13} /> Tambah
            </button>
          }
        />
        <div className="p-6">
          {portfolioItems.length === 0 ? (
            <CreatorEmptyState
              title="Belum Ada Portofolio"
              description="Tambahkan konten video terbaik Anda agar brand bisa melihat karya Anda."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {portfolioItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-neutral-50/60 border border-neutral-200/60 rounded-[20px] overflow-hidden flex flex-col group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {item.thumbnailUrl && (
                    <div className="relative w-full h-36 bg-neutral-200">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {item.platform && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-neutral-900/80 text-white text-[0.62rem] font-[900] uppercase tracking-wider">
                          {item.platform}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-[800] text-neutral-900 text-[0.88rem] leading-snug line-clamp-1 flex-1">
                        {item.title}
                      </h5>
                      {item.niche && (
                        <span className="shrink-0 inline-flex px-2 py-0.5 rounded-full text-white text-[0.62rem] font-[900] uppercase tracking-wider" style={{ background: CREATOR_GRADIENT }}>
                          {item.niche}
                        </span>
                      )}
                    </div>
                    <p className="text-[0.78rem] text-neutral-400 font-[500] leading-relaxed line-clamp-2 flex-1">
                      {item.description}
                    </p>
                    {item.views !== undefined && (
                      <div className="flex items-center justify-between text-[0.72rem] font-[800] text-neutral-400 pt-2 border-t border-neutral-200/40 mt-auto">
                        <span>VIEWS PENONTON</span>
                        <span className="text-neutral-800">{item.views.toLocaleString("id-ID")} views</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-neutral-200/40 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openEditPortModal(item)}
                      className="flex items-center justify-center gap-1 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-[10px] text-[0.75rem] font-[700] text-neutral-700 transition-all cursor-pointer"
                    >
                      <Pencil size={11} /> Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(item)}
                      className="flex items-center justify-center gap-1 py-2 bg-red-50 hover:bg-red-100 border border-red-200/50 text-red-600 rounded-[10px] text-[0.75rem] font-[700] transition-all cursor-pointer"
                    >
                      <Trash2 size={11} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // Panel: Notifikasi
  // ══════════════════════════════════════════════════════════════════════════════

  const renderNotifikasi = () => (
    <div className="flex flex-col gap-5 w-full">
      <SettingsCard>
        <CardSectionHeader title="Notifikasi Kampanye & Pekerjaan" />
        <div className="px-6 py-1">
          <NotifToggleRow
            label="Campaign Baru Sesuai Niche"
            description="Terima notifikasi saat ada campaign baru yang cocok dengan kategori konten Anda."
            checked={notifCampaign}
            onChange={setNotifCampaign}
          />
          <NotifToggleRow
            label="Pengingat Deadline Pekerjaan"
            description="Ingatkan saya H-2 sebelum tenggat waktu pengiriman konten."
            checked={notifDeadline}
            onChange={setNotifDeadline}
          />
          <NotifToggleRow
            label="Update Status Order Rate Card"
            description="Notifikasi saat UMKM melakukan order, konfirmasi, atau revisi pada paket Anda."
            checked={notifOrder}
            onChange={setNotifOrder}
          />
        </div>
      </SettingsCard>

      <SettingsCard>
        <CardSectionHeader title="Notifikasi Pembayaran & Pesan" />
        <div className="px-6 py-1">
          <NotifToggleRow
            label="Alert Pembayaran & Pencairan"
            description="Notifikasi instan saat pembayaran masuk ke wallet atau pencairan berhasil diproses."
            checked={notifPayment}
            onChange={setNotifPayment}
          />
          <NotifToggleRow
            label="Pesan Baru dari Brand atau Admin"
            description="Notifikasi saat ada pesan baru di negosiasi atau pengumuman dari Marketiv."
            checked={notifMessage}
            onChange={setNotifMessage}
          />
          <NotifToggleRow
            label="Newsletter & Tips Kreator"
            description="Email bulanan berisi tips monetisasi, update fitur, dan insight dari Marketiv."
            checked={notifNewsletter}
            onChange={setNotifNewsletter}
          />
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <CreatorBtn onClick={() => showToast("Preferensi notifikasi berhasil disimpan!")}>
          Simpan Preferensi
        </CreatorBtn>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // Panel: Keamanan
  // ══════════════════════════════════════════════════════════════════════════════

  const renderKeamanan = () => (
    <div className="flex flex-col gap-5 w-full">
      <SettingsCard>
        <CardSectionHeader title="Informasi Akun" />
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-wider">
                Username
              </label>
              <div className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-neutral-50/80 border border-neutral-200/60 rounded-[14px]">
                <span className="text-neutral-300 font-[800] text-[0.9rem]">@</span>
                <span className="text-[0.88rem] font-[600] text-neutral-600">{profile.username}</span>
              </div>
              <p className="text-[0.68rem] font-[600] text-neutral-300">Username tidak dapat diubah</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-wider">
                Email Terdaftar
              </label>
              <div className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-neutral-50/80 border border-neutral-200/60 rounded-[14px]">
                <Mail size={14} className="text-neutral-300 shrink-0" />
                <span className="text-[0.88rem] font-[600] text-neutral-600 truncate">
                  kreator@example.com
                </span>
              </div>
              <p className="text-[0.68rem] font-[600] text-neutral-300">Dikelola via sistem autentikasi</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-[14px] bg-blue-50 border border-blue-200/60">
            <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-[0.82rem] font-[700] text-blue-800">Akun Terverifikasi</p>
              <p className="text-[0.72rem] font-[500] text-blue-600 mt-0.5">
                Identitas Anda telah diverifikasi oleh tim Marketiv
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <CardSectionHeader title="Ubah Password" />
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-wider">
              Password Saat Ini
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
              <input type="password" placeholder="••••••••" className={cn(inputCls, "pl-10")} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-wider">
                Password Baru
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                <input type="password" placeholder="Min. 8 karakter" className={cn(inputCls, "pl-10")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[0.68rem] font-[900] text-neutral-400 uppercase tracking-wider">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                <input type="password" placeholder="Ulangi password baru" className={cn(inputCls, "pl-10")} />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <CreatorBtn onClick={() => showToast("Fitur ubah password akan segera tersedia!")}>
              Ubah Password
            </CreatorBtn>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <CardSectionHeader title="Sesi & Aktivitas Login" />
        <div className="p-6">
          <div className="flex items-start gap-4 p-4 rounded-[16px] bg-neutral-50 border border-neutral-200/60">
            <div
              className="w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0"
              style={{ background: CREATOR_GRADIENT_SOFT, border: "1px solid rgba(37,99,235,.18)" }}
            >
              <ShieldCheck size={17} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.9rem] font-[700] text-neutral-800">Sesi Aktif Saat Ini</p>
              <p className="text-[0.76rem] font-[500] text-neutral-400 mt-0.5">
                Chrome · Windows · Jakarta, Indonesia
              </p>
              <p className="text-[0.68rem] font-[600] text-emerald-600 mt-1">● Online sekarang</p>
            </div>
            <span className="shrink-0 text-[0.68rem] font-[800] text-neutral-300 uppercase tracking-wider">
              Ini Anda
            </span>
          </div>
        </div>
      </SettingsCard>
    </div>
  );

  const PANEL_MAP: Record<SettingsTab, () => React.ReactNode> = {
    profil: renderProfil,
    portofolio: renderPortofolio,
    notifikasi: renderNotifikasi,
    keamanan: renderKeamanan,
  };

  // ── Modal frame ───────────────────────────────────────────────────────────────
  const ModalFrame = ({
    children,
    maxW = "max-w-md",
  }: {
    children: React.ReactNode;
    maxW?: string;
  }) => (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={cn(
          "bg-white rounded-[26px] border border-neutral-200/50 shadow-2xl p-6 sm:p-8 w-full",
          "animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto",
          maxW
        )}
      >
        {children}
      </div>
    </div>
  );

  const inputModalCls = inputCls;

  // ══════════════════════════════════════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
      <CreatorPageHeader
        title="Pengaturan"
        description="Kelola profil publik, portofolio, notifikasi, dan keamanan akun Anda."
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ══ Tab Navigation ══ */}

        {/* Mobile: 2×2 grid of tab cards */}
        <div className="grid grid-cols-2 gap-3 w-full lg:hidden">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-2.5 p-4 rounded-[20px] border-2 transition-all duration-200 cursor-pointer text-center",
                  "focus-visible:outline-[4px] focus-visible:outline focus-visible:outline-blue-500/20 focus-visible:outline-offset-2",
                  isActive
                    ? "border-blue-500/25 font-[800] shadow-md"
                    : "border-neutral-200/60 bg-white text-neutral-500 hover:bg-neutral-50 font-[600]"
                )}
                style={isActive ? { background: CREATOR_GRADIENT_SOFT } : {}}
              >
                <div
                  className="w-12 h-12 rounded-[16px] flex items-center justify-center transition-all shrink-0"
                  style={
                    isActive
                      ? { background: CREATOR_GRADIENT, boxShadow: "0 6px 18px rgba(37,99,235,.28)" }
                      : { background: "#f3f4f6" }
                  }
                >
                  <tab.icon
                    size={20}
                    className={isActive ? "text-white" : "text-neutral-400"}
                  />
                </div>
                <span
                  className={cn(
                    "text-[0.82rem] leading-tight",
                    isActive ? "text-blue-700" : "text-neutral-600"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop: vertical sidebar nav */}
        <nav
          className="hidden lg:flex flex-col gap-1 w-[230px] shrink-0 sticky top-6"
          aria-label="Navigasi Pengaturan"
        >
          <div className="bg-white rounded-[22px] border border-neutral-200/60 shadow-[0_8px_24px_rgba(15,23,42,.06)] p-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-3 rounded-[14px] transition-all duration-200 cursor-pointer text-left w-full",
                    "focus-visible:outline-[4px] focus-visible:outline focus-visible:outline-blue-500/17 focus-visible:outline-offset-2",
                    isActive
                      ? "font-[800]"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 font-[600]"
                  )}
                  style={isActive ? { background: CREATOR_GRADIENT_SOFT } : {}}
                >
                  <div
                    className="w-8 h-8 rounded-[11px] flex items-center justify-center shrink-0 transition-all"
                    style={
                      isActive
                        ? { background: CREATOR_GRADIENT, boxShadow: "0 4px 12px rgba(37,99,235,.25)" }
                        : { background: "#f3f4f6" }
                    }
                  >
                    <tab.icon
                      size={15}
                      className={isActive ? "text-white" : "text-neutral-400"}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-[0.88rem] leading-tight truncate",
                        isActive ? "text-blue-700" : ""
                      )}
                    >
                      {tab.label}
                    </span>
                    <span
                      className={cn(
                        "block text-[0.66rem] font-[500] leading-tight mt-0.5 truncate",
                        isActive ? "text-blue-400" : "text-neutral-300"
                      )}
                    >
                      {tab.description}
                    </span>
                  </div>
                  {isActive && (
                    <ChevronRight size={13} className="ml-auto shrink-0 text-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ══ Content panel ══ */}
        <div className="flex-1 min-w-0 w-full">
          {PANEL_MAP[activeTab]()}
        </div>
      </div>

      {/* ════════════ Modal: Profile Success ════════════ */}
      {isProfileSuccessOpen && (
        <ModalFrame>
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto mb-5 shadow-lg"
              style={{ background: CREATOR_GRADIENT }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-[1.05rem] font-[900] text-neutral-900 mb-2 leading-none">
              Profil Berhasil Diperbarui
            </h3>
            <p className="text-[0.82rem] text-neutral-500 font-[500] leading-relaxed max-w-xs mx-auto mb-6">
              Detail profil publik dan tautan sosial media Anda telah berhasil disinkronisasikan ke
              platform Marketiv.
            </p>
            <CreatorBtn onClick={() => setIsProfileSuccessOpen(false)} className="w-full">
              Selesai & Tutup
            </CreatorBtn>
          </div>
        </ModalFrame>
      )}

      {/* ════════════ Modal: Add Portfolio ════════════ */}
      {isAddPortOpen && (
        <ModalFrame>
          <div className="flex justify-between items-start gap-4 mb-5">
            <div>
              <h3 className="text-[1rem] font-[900] text-neutral-900 leading-none">
                Tambah Portofolio
              </h3>
              <p className="text-[0.7rem] text-neutral-400 font-[700] mt-1 uppercase tracking-wider">
                Lengkapi informasi konten video
              </p>
            </div>
            <button
              onClick={() => setIsAddPortOpen(false)}
              className="p-1.5 rounded-[10px] text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleAddPortfolio} className="space-y-4 text-[0.85rem]">
            <div className="space-y-1.5">
              <label className="block text-[0.68rem] font-[900] text-neutral-500 uppercase tracking-wider">
                Judul Konten Video
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Makeup Aesthetic Skincare Lokal"
                value={portTitle}
                onChange={(e) => setPortTitle(e.target.value)}
                className={inputModalCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-500 uppercase tracking-wider">
                  Platform
                </label>
                <select
                  value={portPlatform}
                  onChange={(e) => setPortPlatform(e.target.value as "tiktok" | "instagram")}
                  className={cn(inputModalCls, "cursor-pointer")}
                >
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-500 uppercase tracking-wider">
                  Kategori Niche
                </label>
                <select
                  value={portNiche}
                  onChange={(e) => setPortNiche(e.target.value as CreatorNiche)}
                  className={cn(inputModalCls, "cursor-pointer")}
                >
                  <option value="kecantikan">Kecantikan</option>
                  <option value="kuliner">Kuliner</option>
                  <option value="fashion">Fashion</option>
                  <option value="pariwisata">Pariwisata</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-500 uppercase tracking-wider">
                  Tautan URL Postingan
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://tiktok.com/@..."
                  value={portUrl}
                  onChange={(e) => setPortUrl(e.target.value)}
                  className={inputModalCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-500 uppercase tracking-wider">
                  Jumlah Views
                </label>
                <input
                  type="number"
                  required
                  value={portViews}
                  onChange={(e) => setPortViews(Number(e.target.value))}
                  className={inputModalCls}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[0.68rem] font-[900] text-neutral-500 uppercase tracking-wider">
                Deskripsi Singkat Konten
              </label>
              <textarea
                rows={3}
                required
                placeholder="Review toner serum glow up..."
                value={portDesc}
                onChange={(e) => setPortDesc(e.target.value)}
                className={cn(inputModalCls, "resize-none")}
              />
            </div>
            <div className="pt-4 flex gap-3">
              <GhostBtn type="button" onClick={() => setIsAddPortOpen(false)} className="flex-1">
                Batal
              </GhostBtn>
              <CreatorBtn type="submit" className="flex-1">
                Tambahkan
              </CreatorBtn>
            </div>
          </form>
        </ModalFrame>
      )}

      {/* ════════════ Modal: Edit Portfolio ════════════ */}
      {isEditPortOpen && activePortItem && (
        <ModalFrame>
          <div className="flex justify-between items-start gap-4 mb-5">
            <div>
              <h3 className="text-[1rem] font-[900] text-neutral-900 leading-none">
                Ubah Portofolio
              </h3>
              <p className="text-[0.7rem] text-neutral-400 font-[700] mt-1 uppercase tracking-wider line-clamp-1">
                {activePortItem.title}
              </p>
            </div>
            <button
              onClick={() => {
                setIsEditPortOpen(false);
                setActivePortItem(null);
              }}
              className="p-1.5 rounded-[10px] text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleEditPortfolio} className="space-y-4 text-[0.85rem]">
            <div className="space-y-1.5">
              <label className="block text-[0.68rem] font-[900] text-neutral-500 uppercase tracking-wider">
                Judul Konten Video
              </label>
              <input
                type="text"
                required
                value={portTitle}
                onChange={(e) => setPortTitle(e.target.value)}
                className={inputModalCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-500 uppercase tracking-wider">
                  Platform
                </label>
                <select
                  value={portPlatform}
                  onChange={(e) => setPortPlatform(e.target.value as "tiktok" | "instagram")}
                  className={cn(inputModalCls, "cursor-pointer")}
                >
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-500 uppercase tracking-wider">
                  Kategori Niche
                </label>
                <select
                  value={portNiche}
                  onChange={(e) => setPortNiche(e.target.value as CreatorNiche)}
                  className={cn(inputModalCls, "cursor-pointer")}
                >
                  <option value="kecantikan">Kecantikan</option>
                  <option value="kuliner">Kuliner</option>
                  <option value="fashion">Fashion</option>
                  <option value="pariwisata">Pariwisata</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-500 uppercase tracking-wider">
                  Tautan URL Postingan
                </label>
                <input
                  type="url"
                  required
                  value={portUrl}
                  onChange={(e) => setPortUrl(e.target.value)}
                  className={inputModalCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[0.68rem] font-[900] text-neutral-500 uppercase tracking-wider">
                  Jumlah Views
                </label>
                <input
                  type="number"
                  required
                  value={portViews}
                  onChange={(e) => setPortViews(Number(e.target.value))}
                  className={inputModalCls}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[0.68rem] font-[900] text-neutral-500 uppercase tracking-wider">
                Deskripsi Singkat Konten
              </label>
              <textarea
                rows={3}
                required
                value={portDesc}
                onChange={(e) => setPortDesc(e.target.value)}
                className={cn(inputModalCls, "resize-none")}
              />
            </div>
            <div className="pt-4 flex gap-3">
              <GhostBtn
                type="button"
                onClick={() => {
                  setIsEditPortOpen(false);
                  setActivePortItem(null);
                }}
                className="flex-1"
              >
                Batal
              </GhostBtn>
              <CreatorBtn type="submit" className="flex-1">
                Simpan Perubahan
              </CreatorBtn>
            </div>
          </form>
        </ModalFrame>
      )}

      {/* ════════════ Modal: Delete Confirm ════════════ */}
      {isDeleteConfirmOpen && activePortItem && (
        <ModalFrame maxW="max-w-sm">
          <h3 className="text-[1rem] font-[900] text-neutral-900 leading-none mb-3">
            Hapus Item Portofolio?
          </h3>
          <p className="text-[0.82rem] text-neutral-500 font-[500] leading-relaxed mb-6">
            Anda akan menghapus{" "}
            <span className="font-[800] text-neutral-900">
              &quot;{activePortItem.title}&quot;
            </span>{" "}
            secara permanen. Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3">
            <GhostBtn
              type="button"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setActivePortItem(null);
              }}
              className="flex-1"
            >
              Batal
            </GhostBtn>
            <button
              type="button"
              onClick={executeDeletePortfolio}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-[700] text-[0.82rem] rounded-full transition-all shadow-md cursor-pointer"
            >
              Ya, Hapus
            </button>
          </div>
        </ModalFrame>
      )}
    </div>
  );
}
