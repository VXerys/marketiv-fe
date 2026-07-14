"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Store,
  MapPin,
  Bell,
  Check,
  Globe,
  Building,
  Phone,
  Mail,
} from "lucide-react";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { UmkmPageWrapper } from "@/components/features/umkm-dashboard/shared/UmkmPageWrapper";

// Custom inline SVG icons for social channels to avoid dependency package issues
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.62 4.18.99 1.17 2.37 1.96 3.86 2.23v3.74c-1.42-.02-2.82-.41-4.04-1.15-.36-.21-.7-.47-1.01-.76v7.37c-.07 1.52-.64 3.01-1.66 4.14-1.02 1.13-2.45 1.83-3.98 1.99-1.53.16-3.11-.21-4.37-1.07A5.996 5.996 0 0 1 3.93 16.2c-.36-1.5-.16-3.11.58-4.47.74-1.36 1.99-2.38 3.48-2.83V12.7c-.52.12-1 .4-1.37.8-.37.4-.59.93-.62 1.48-.03.55.12 1.1.43 1.56.31.46.77.78 1.29.92.52.14 1.07.08 1.55-.16.48-.24.86-.66 1.06-1.17.16-.41.22-.85.22-1.29V0h2.01z" />
  </svg>
);

interface NotificationSetting {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationSetting[] = [
  { id: "kreator", label: "Kreator baru bergabung", desc: "Notifikasi saat kreator join campaign", enabled: true },
  { id: "submission", label: "Submission masuk", desc: "Notifikasi saat ada konten dikirim", enabled: true },
  { id: "completed", label: "Campaign selesai", desc: "Ringkasan saat campaign berakhir", enabled: true },
  { id: "escrow", label: "Dana escrow siap cair", desc: "Alert saat dana perlu diverifikasi", enabled: true },
  { id: "promo", label: "Promosi & update platform", desc: "Info fitur baru dari Marketiv", enabled: false },
];

function Toggle({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-200 shadow-3xs outline-none border-none ${
        enabled ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/20" : "bg-neutral-200"
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          enabled ? "left-[21px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

interface PengaturanClientProps {
  businessName: string;
}

export function PengaturanClient({ businessName: initialBusinessName }: PengaturanClientProps) {
  const [notifications, setNotifications] = useState<NotificationSetting[]>(INITIAL_NOTIFICATIONS);
  
  // Flat state mapping 1:1 to Appwrite database schema (umkm_profiles & users collections)
  const [profile, setProfile] = useState({
    businessName: initialBusinessName,
    category: "Kuliner — Makanan Sehat",
    description: "Penyedia makanan sehat premium khas Sukabumi, dengan cita rasa autentik dan bahan pilihan segar.",
    city: "Sukabumi",
    address: "Jl. Merdeka No. 45",
    phone: "+62 812-3456-7890",
    email: "dapursehat.sukabumi@gmail.com",
    instagram: "dapursehat.sukabumi",
    tiktok: "dapursehat.sukabumi",
    website: "www.dapursehatsukabumi.com",
    logoUrl: "",
  });

  const handleToggle = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const handleInputChange = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    toast.success("Pengaturan berhasil disimpan!");
  };

  const handleDeactivate = () => {
    toast.error("Akun berhasil dinonaktifkan sementara.");
  };

  return (
    <UmkmDashboardChrome businessName={profile.businessName}>
      <UmkmPageWrapper maxWidth={900} className="gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 text-[0.68rem] font-[800] text-orange-600 uppercase tracking-widest">
            <span className="w-4.5 h-[2px] rounded-full bg-orange-500" />
            Akun UMKM
          </div>
          <h1 className="text-[1.8rem] font-[850] text-ink-900 leading-tight tracking-[-0.03em] font-display">
            Pengaturan
          </h1>
        </div>

        {/* Profile Card & Info Fields */}
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-3xs space-y-8">
          
          {/* Logo & Status Ribbon */}
          <div className="flex items-center gap-5 pb-6 border-b border-neutral-200/60 flex-wrap sm:flex-nowrap">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 flex-shrink-0 shadow-sm border border-orange-400/10" />
            <div className="space-y-1.5 min-w-0 flex-1">
              <h3 className="text-[1.1rem] font-bold text-ink-900 truncate leading-none">
                {profile.businessName}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 min-h-[24px] px-2.5 rounded-full bg-emerald-50 border border-emerald-200/50 text-emerald-700 text-[0.7rem] font-extrabold">
                  <Check size={10} strokeWidth={3} /> Akun Terverifikasi
                </span>
                <span className="inline-flex items-center min-h-[24px] px-2.5 rounded-full bg-orange-50 border border-orange-200/50 text-orange-600 text-[0.7rem] font-extrabold">
                  UMKM Plan
                </span>
              </div>
            </div>
            <button
              onClick={() => toast.info("Unggah foto baru sedang diproses.")}
              className="ml-auto px-4 py-2 bg-white hover:bg-neutral-50 text-ink-700 hover:text-ink-900 border border-neutral-200 text-xs font-bold rounded-xl shadow-3xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              Edit Foto
            </button>
          </div>

          {/* Section 1: Profil Bisnis (umkm_profiles attributes) */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-50 border border-orange-200/50 text-orange-600">
                <Store size={16} />
              </div>
              <h4 className="text-[0.92rem] font-extrabold text-ink-900 font-display">
                Profil Bisnis
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nama Bisnis */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.74rem] font-[800] text-ink-600">Nama Bisnis</label>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-semibold text-ink-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all shadow-3xs"
                />
              </div>

              {/* Kategori */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.74rem] font-[800] text-ink-600">Kategori</label>
                <input
                  type="text"
                  value={profile.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-semibold text-ink-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all shadow-3xs"
                />
              </div>

              {/* Deskripsi (Full Width) */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[0.74rem] font-[800] text-ink-600">Deskripsi</label>
                <textarea
                  value={profile.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-semibold text-ink-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all shadow-3xs resize-vertical"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kontak & Lokasi (umkm_profiles & users attributes) */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-200/50 text-blue-600">
                <MapPin size={16} />
              </div>
              <h4 className="text-[0.92rem] font-extrabold text-ink-900 font-display">
                Kontak & Lokasi
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* WhatsApp */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.74rem] font-[800] text-ink-600 flex items-center gap-1.5">
                  <Phone size={12} className="text-ink-400" /> Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-semibold text-ink-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all shadow-3xs"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.74rem] font-[800] text-ink-600 flex items-center gap-1.5">
                  <Mail size={12} className="text-ink-400" /> Email Bisnis
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-semibold text-ink-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all shadow-3xs"
                />
              </div>

              {/* Kota */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.74rem] font-[800] text-ink-600 flex items-center gap-1.5">
                  <Building size={12} className="text-ink-400" /> Kota
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-semibold text-ink-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all shadow-3xs"
                />
              </div>

              {/* Alamat */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.74rem] font-[800] text-ink-600 flex items-center gap-1.5">
                  <MapPin size={12} className="text-ink-400" /> Alamat
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-semibold text-ink-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all shadow-3xs"
                />
              </div>

              {/* Instagram */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.74rem] font-[800] text-ink-600 flex items-center gap-1.5">
                  <InstagramIcon className="w-3.5 h-3.5 text-ink-400" /> Instagram Username
                </label>
                <input
                  type="text"
                  value={profile.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-semibold text-ink-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all shadow-3xs"
                />
              </div>

              {/* TikTok */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.74rem] font-[800] text-ink-600 flex items-center gap-1.5">
                  <TikTokIcon className="w-3.5 h-3.5 text-ink-400" /> TikTok Username
                </label>
                <input
                  type="text"
                  value={profile.tiktok}
                  onChange={(e) => handleInputChange("tiktok", e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-semibold text-ink-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all shadow-3xs"
                />
              </div>

              {/* Website (Full Width) */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[0.74rem] font-[800] text-ink-600 flex items-center gap-1.5">
                  <Globe size={12} className="text-ink-400" /> Website
                </label>
                <input
                  type="text"
                  value={profile.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-semibold text-ink-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all shadow-3xs"
                />
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              onClick={handleSaveChanges}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/15 active:scale-[0.98] transition-all cursor-pointer border-none outline-none"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>

        {/* Notifications Preference */}
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-3xs space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-50 border border-purple-200/50 text-purple-600">
              <Bell size={16} />
            </div>
            <h4 className="text-[0.92rem] font-extrabold text-ink-900 font-display">
              Preferensi Notifikasi
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {notifications.map((n) => (
              <div
                key={n.label}
                className="flex items-center justify-between gap-4 p-4.5 rounded-2xl bg-neutral-50/60 border border-neutral-200/60 hover:bg-neutral-50 transition-all duration-200"
              >
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <strong className="text-xs font-extrabold text-ink-900 truncate">
                    {n.label}
                  </strong>
                  <span className="text-[0.7rem] font-bold text-ink-400 truncate">
                    {n.desc}
                  </span>
                </div>
                <Toggle enabled={n.enabled} onClick={() => handleToggle(n.id)} />
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50/30 border border-red-200 rounded-3xl p-6 sm:p-8 space-y-5">
          <h4 className="text-[0.9rem] font-extrabold text-red-700 font-display">
            Zona Berbahaya
          </h4>
          <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex flex-col gap-0.5">
              <strong className="text-xs font-extrabold text-ink-900">
                Nonaktifkan Akun
              </strong>
              <span className="text-[0.7rem] font-bold text-ink-400">
                Semua campaign aktif Anda akan dihentikan sementara.
              </span>
            </div>
            <button
              onClick={handleDeactivate}
              className="px-5 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 text-xs font-bold rounded-xl shadow-3xs active:scale-[0.98] transition-all cursor-pointer"
            >
              Nonaktifkan
            </button>
          </div>
        </div>
      </UmkmPageWrapper>
    </UmkmDashboardChrome>
  );
}
