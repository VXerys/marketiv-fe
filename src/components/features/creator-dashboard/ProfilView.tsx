"use client";

import { useState } from "react";
import { CreatorProfile, CreatorPortfolioItem, CreatorNiche } from "@/types/creator-dashboard";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { CreatorMetricCard } from "./CreatorMetricCard";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { CreatorErrorState } from "./CreatorErrorState";
import { CreatorCardSkeleton, CreatorMetricSkeleton } from "./CreatorSkeleton";
import { mockCreatorPortfolioItems } from "@/mocks/creator-dashboard.mock";
import { cn } from "@/lib/utils";

interface ProfilViewProps {
  initialProfile: CreatorProfile;
}

export function ProfilView({ initialProfile }: ProfilViewProps) {
  const [profile, setProfile] = useState<CreatorProfile>({
    ...initialProfile,
    bannerUrl: initialProfile.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop",
    averageViews: initialProfile.averageViews || 48500,
    responseTime: initialProfile.responseTime || "2 jam",
    completionRate: initialProfile.completionRate || 98,
    portfolioUrl: initialProfile.portfolioUrl || "https://nadiavisuals.myportfolio.com",
  });

  // Portfolio local state
  const [portfolioItems, setPortfolioItems] = useState<CreatorPortfolioItem[]>(mockCreatorPortfolioItems);

  // Slicing state simulators (DoD)
  const [isLoadingSimulated, setIsLoadingSimulated] = useState(false);
  const [isEmptyPortfolioSimulated, setIsEmptyPortfolioSimulated] = useState(false);
  const [isErrorSimulated, setIsErrorSimulated] = useState(false);

  // Profile Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [tiktokUrl, setTiktokUrl] = useState(profile.tiktokUrl || "");
  const [instagramUrl, setInstagramUrl] = useState(profile.instagramUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolioUrl || "");
  const [selectedNiche, setSelectedNiche] = useState<CreatorNiche>(profile.niche);

  // Modals state
  const [isProfileSuccessOpen, setIsProfileSuccessOpen] = useState(false);
  const [isAddPortOpen, setIsAddPortOpen] = useState(false);
  const [isEditPortOpen, setIsEditPortOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Selected portfolio item for edit/delete
  const [activePortItem, setActivePortItem] = useState<CreatorPortfolioItem | null>(null);

  // Portfolio form fields
  const [portTitle, setPortTitle] = useState("");
  const [portPlatform, setPortPlatform] = useState<"tiktok" | "instagram">("tiktok");
  const [portUrl, setPortUrl] = useState("");
  const [portNiche, setPortNiche] = useState<CreatorNiche>("kecantikan");
  const [portViews, setPortViews] = useState(50000);
  const [portDesc, setPortDesc] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Profile Save
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (tiktokUrl && !tiktokUrl.includes("tiktok.com")) {
      setFormError("Tautan TikTok wajib mengandung 'tiktok.com'");
      return;
    }
    if (instagramUrl && !instagramUrl.includes("instagram.com")) {
      setFormError("Tautan Instagram wajib mengandung 'instagram.com'");
      return;
    }

    setFormError(null);
    setProfile(prev => ({
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

  // Portfolio Add Action
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
      thumbnailUrl: portPlatform === "tiktok"
        ? "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop"
        : "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop",
      description: portDesc.trim(),
    };

    setPortfolioItems(prev => [...prev, newItem]);
    setIsAddPortOpen(false);
    
    // Reset fields
    setPortTitle("");
    setPortUrl("");
    setPortDesc("");
    setPortViews(50000);

    showToast("Portofolio baru berhasil ditambahkan!");
  };

  // Open Edit Portfolio
  const openEditPortModal = (item: CreatorPortfolioItem) => {
    setActivePortItem(item);
    setPortTitle(item.title);
    setPortPlatform(item.platform);
    setPortUrl(item.url);
    setPortNiche(item.niche);
    setPortViews(item.views);
    setPortDesc(item.description);
    setIsEditPortOpen(true);
  };

  // Portfolio Edit Action
  const handleEditPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePortItem || !portTitle.trim() || !portUrl.trim()) return;

    setPortfolioItems(prev =>
      prev.map(item =>
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

  // Open Delete Portfolio
  const openDeleteConfirm = (item: CreatorPortfolioItem) => {
    setActivePortItem(item);
    setIsDeleteConfirmOpen(true);
  };

  // Portfolio Delete Action
  const executeDeletePortfolio = () => {
    if (!activePortItem) return;
    setPortfolioItems(prev => prev.filter(item => item.id !== activePortItem.id));
    setIsDeleteConfirmOpen(false);
    setActivePortItem(null);
    showToast("Item portofolio berhasil dihapus.");
  };

  // State Error render
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
          errorMsg="Gagal memuat profil dan portofolio kreator Anda. Silakan coba kembali."
          onRetry={() => {
            setIsErrorSimulated(false);
            showToast("Profil berhasil dipulihkan!");
          }}
        />
      </div>
    );
  }

  const shownPortfolio = isEmptyPortfolioSimulated ? [] : portfolioItems;

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
          <span>Panel Simulator State (Profil &amp; Portofolio Slicing):</span>
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
            onClick={() => setIsEmptyPortfolioSimulated(!isEmptyPortfolioSimulated)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer",
              isEmptyPortfolioSimulated
                ? "bg-primary text-white border-primary-600"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            )}
          >
            {isEmptyPortfolioSimulated ? "Matikan Portofolio" : "Simulasi Portfolio Kosong"}
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
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-neutral-200 rounded w-28 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 h-96 bg-white border rounded-3xl p-6"></div>
            <div className="lg:col-span-8 h-96 bg-white border rounded-3xl p-6"></div>
          </div>
        </div>
      ) : (
        <div>
          {/* Header */}
          <CreatorPageHeader
            title="Kelola Profil &amp; Portofolio"
            description="Atur visual preview brand, data pencapaian sosial media, dan katalog portofolio kerja Anda."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Public Profile Preview & Trust Stats */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Public Preview Card */}
              <div className="bg-white border border-neutral-200/50 shadow-sm rounded-3xl overflow-hidden flex flex-col relative group">
                {/* Banner wrapper */}
                <div className="w-full h-28 relative bg-neutral-100 border-b border-neutral-200/20 overflow-hidden">
                  {profile.bannerUrl && (
                    <img
                      src={profile.bannerUrl}
                      alt="Banner Kreator"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Banner Upload Simulated Trigger */}
                  <label className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black text-white uppercase tracking-wider cursor-pointer">
                    📷 Ganti Banner
                    <input type="file" className="hidden" onChange={() => showToast("Banner berhasil diunggah (Simulasi).")} />
                  </label>
                </div>

                {/* Profile detail */}
                <div className="p-6 pt-0 text-center flex flex-col items-center -mt-10 relative">
                  {/* Avatar wrapper */}
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden relative bg-neutral-50 mb-3 group/avatar">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Avatar upload simulated trigger */}
                    <label className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-[8px] font-black text-white uppercase tracking-wider cursor-pointer">
                      Ganti Foto
                      <input type="file" className="hidden" onChange={() => showToast("Foto profil berhasil diunggah (Simulasi).")} />
                    </label>
                  </div>

                  <h3 className="text-sm font-black text-neutral-900 flex items-center gap-1 leading-none">
                    <span>{profile.name}</span>
                    {profile.isVerified && (
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-primary text-white text-[7px] font-black uppercase tracking-wider shadow-sm">
                        Verified
                      </span>
                    )}
                  </h3>
                  
                  <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">@{profile.username}</p>
                  
                  <span className="inline-flex items-center mt-3.5 px-3 py-1 rounded-full bg-primary-50 text-primary border border-primary-100 text-[10px] font-black uppercase tracking-wider leading-none">
                    🎨 {profile.niche}
                  </span>

                  <p className="text-xs text-neutral-500 font-semibold leading-relaxed mt-4">
                    {profile.bio}
                  </p>

                  <p className="text-[10px] font-extrabold text-neutral-400 mt-2">
                    📍 {profile.location}
                  </p>

                  {/* Social Buttons */}
                  <div className="flex gap-2 mt-5 w-full">
                    {profile.tiktokUrl && (
                      <a
                        href={profile.tiktokUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center bg-neutral-950 hover:bg-neutral-900 text-white font-extrabold text-[10px] py-2.5 rounded-xl transition-all border border-neutral-900"
                      >
                        TikTok
                      </a>
                    )}
                    {profile.instagramUrl && (
                      <a
                        href={profile.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-extrabold text-[10px] py-2.5 rounded-xl transition-all border border-neutral-300/40"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust Section */}
              <div className="bg-white border border-neutral-200/50 shadow-sm rounded-3xl p-6 space-y-4">
                <h4 className="font-extrabold text-neutral-900 text-xs border-b border-neutral-100 pb-3 uppercase tracking-wider">
                  Data Metrik &amp; Reputasi
                </h4>

                <div className="space-y-3.5 text-xs font-semibold text-neutral-600">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Total Kerja Selesai</span>
                    <span className="text-neutral-900 font-black">{profile.completedJobs} Kontrak</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Rata-rata Views</span>
                    <span className="text-neutral-900 font-black">{profile.averageViews?.toLocaleString("id-ID") || 48500} views</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Rating Review</span>
                    <span className="text-neutral-900 font-black">⭐️ {profile.rating} / 5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Estimasi Respon</span>
                    <span className="text-neutral-900 font-black">⚡ ~{profile.responseTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Penyelesaian Job</span>
                    <span className="text-neutral-900 font-black">{profile.completionRate}%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Edit Profile & Portfolio Grid */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Form Edit Profile / Info */}
              <div className="bg-white border border-neutral-200/50 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <h3 className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider">
                    Informasi Pengguna
                  </h3>
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
                      className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-bold text-neutral-700 transition-all cursor-pointer"
                    >
                      Ubah Data Profil
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    {formError && (
                      <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-800 text-xs font-bold">
                        ⚠️ {formError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">Nama Display</label>
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">Kota Lokasi</label>
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                        />
                      </div>
                    </div>

                    {/* Niche Multi-select */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">Kategori Niche Utama</label>
                      <div className="flex flex-wrap gap-2">
                        {(["kecantikan", "kuliner", "fesyen", "pariwisata", "lainnya"] as CreatorNiche[]).map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setSelectedNiche(n)}
                            className={cn(
                              "px-3.5 py-1.5 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer",
                              selectedNiche === n
                                ? "bg-primary text-white border-primary-600 shadow-sm"
                                : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                            )}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">Bio Singkat</label>
                      <textarea
                        rows={3}
                        required
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-100 pt-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">Link TikTok</label>
                        <input
                          type="url"
                          placeholder="https://tiktok.com/@..."
                          value={tiktokUrl}
                          onChange={(e) => setTiktokUrl(e.target.value)}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">Link Instagram</label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/..."
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">Link Web Portofolio</label>
                        <input
                          type="url"
                          placeholder="https://myportfolio.com"
                          value={portfolioUrl}
                          onChange={(e) => setPortfolioUrl(e.target.value)}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormError(null);
                        }}
                        className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full transition-all border border-primary-600/10 shadow-md cursor-pointer"
                      >
                        Simpan Profil
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-y-4 text-xs font-semibold text-neutral-600">
                    <div>
                      <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Display Name</span>
                      <span className="text-neutral-900 block mt-0.5">{profile.name}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Lokasi Kota</span>
                      <span className="text-neutral-900 block mt-0.5">{profile.location}</span>
                    </div>
                    <div className="col-span-2 border-t border-neutral-100 pt-3">
                      <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Biografi Profil</span>
                      <p className="text-neutral-600 mt-1 font-semibold leading-relaxed">{profile.bio}</p>
                    </div>
                    <div className="col-span-2 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-3">
                      <div>
                        <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">TikTok Tautan</span>
                        <a href={profile.tiktokUrl} target="_blank" rel="noreferrer" className="text-primary truncate block mt-0.5 hover:underline">
                          {profile.tiktokUrl || "-"}
                        </a>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Instagram Tautan</span>
                        <a href={profile.instagramUrl} target="_blank" rel="noreferrer" className="text-primary truncate block mt-0.5 hover:underline">
                          {profile.instagramUrl || "-"}
                        </a>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Portfolio Web</span>
                        <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-primary truncate block mt-0.5 hover:underline">
                          {profile.portfolioUrl || "-"}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Portfolio Manager Section */}
              <div className="bg-white border border-neutral-200/50 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <h3 className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider">
                    Katalog Portofolio Konten
                  </h3>
                  <button
                    onClick={() => {
                      setPortTitle("");
                      setPortUrl("");
                      setPortDesc("");
                      setPortViews(50000);
                      setIsAddPortOpen(true);
                    }}
                    className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow border border-primary-600/10 cursor-pointer"
                  >
                    + Tambah Portofolio
                  </button>
                </div>

                {shownPortfolio.length === 0 ? (
                  <CreatorEmptyState
                    title="Katalog Portofolio Kosong"
                    description="Belum ada item portofolio konten video yang ditambahkan di profil publik Anda."
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {shownPortfolio.map(item => (
                      <div
                        key={item.id}
                        className="bg-neutral-50/50 border border-neutral-200/50 rounded-2xl overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          {/* Thumbnail preview */}
                          {item.thumbnailUrl && (
                            <div className="w-full h-32 relative bg-neutral-200 border-b border-neutral-200/40">
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-neutral-900/80 text-white text-[8px] font-black uppercase tracking-wider">
                                {item.platform}
                              </span>
                            </div>
                          )}

                          <div className="p-4.5 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="font-extrabold text-neutral-950 text-xs leading-tight line-clamp-1">
                                {item.title}
                              </h5>
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-primary-50 text-primary border border-primary-100/50 text-[8px] font-black uppercase tracking-wider">
                                {item.niche}
                              </span>
                            </div>
                            
                            <p className="text-[10px] text-neutral-500 font-semibold leading-relaxed line-clamp-2">
                              {item.description}
                            </p>

                            <div className="flex justify-between items-center text-[10px] font-extrabold text-neutral-400 pt-2 border-t border-neutral-200/10">
                              <span>VIEWS PENONTON</span>
                              <span className="text-neutral-900 font-black">{item.views.toLocaleString("id-ID")} Views</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-3 border-t border-neutral-200/20 bg-neutral-50/20 grid grid-cols-2 gap-2 shrink-0">
                          <button
                            onClick={() => openEditPortModal(item)}
                            className="w-full text-center bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] font-bold py-2 transition-all cursor-pointer text-neutral-700"
                          >
                            Edit Item
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(item)}
                            className="w-full text-center bg-red-50 hover:bg-red-100 border border-red-200/40 text-red-700 rounded-lg text-[10px] font-bold py-2 transition-all cursor-pointer"
                          >
                            Hapus Item
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Modal Profile Success */}
      {isProfileSuccessOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-500 mx-auto mb-5 shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-black text-neutral-900 mb-2 leading-none">
              Profil Berhasil Diperbarui
            </h3>
            
            <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-xs mx-auto mb-6">
              Detail profil publik dan tautan sosial media Anda telah sukses disinkronisasikan ke platform Marketiv.
            </p>

            <button
              onClick={() => setIsProfileSuccessOpen(false)}
              className="w-full py-3 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full transition-all border border-primary-600/10 shadow cursor-pointer"
            >
              Selesai &amp; Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Add Portfolio */}
      {isAddPortOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <h3 className="text-base font-black text-neutral-900 leading-none">Tambah Portofolio Konten</h3>
                <p className="text-[11px] text-neutral-400 font-bold mt-1">LENGKAPI INFORMASI VIDEO YANG INGIN ANDA TAMPILKAN</p>
              </div>
              <button
                onClick={() => setIsAddPortOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddPortfolio} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Judul Konten Video</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Makeup Aesthetic Skincare Lokal"
                  value={portTitle}
                  onChange={(e) => setPortTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Platform</label>
                  <select
                    value={portPlatform}
                    onChange={(e) => setPortPlatform(e.target.value as "tiktok" | "instagram")}
                    className="w-full px-3 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-neutral-700 cursor-pointer focus:outline-none"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Kategori Niche</label>
                  <select
                    value={portNiche}
                    onChange={(e) => setPortNiche(e.target.value as CreatorNiche)}
                    className="w-full px-3 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-neutral-700 cursor-pointer focus:outline-none"
                  >
                    <option value="kecantikan">Kecantikan</option>
                    <option value="kuliner">Kuliner</option>
                    <option value="fesyen">Fesyen</option>
                    <option value="pariwisata">Pariwisata</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Tautan URL Postingan</label>
                  <input
                    type="url"
                    required
                    placeholder="https://tiktok.com/@..."
                    value={portUrl}
                    onChange={(e) => setPortUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Jumlah Views</label>
                  <input
                    type="number"
                    required
                    value={portViews}
                    onChange={(e) => setPortViews(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-neutral-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Deskripsi Singkat Konten</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Review toner serum glow up, tone aesthetic..."
                  value={portDesc}
                  onChange={(e) => setPortDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddPortOpen(false)}
                  className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full transition-all border border-primary-600/10 shadow-md cursor-pointer"
                >
                  Tambahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Portfolio */}
      {isEditPortOpen && activePortItem && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <h3 className="text-base font-black text-neutral-900 leading-none">Ubah Portofolio</h3>
                <p className="text-[11px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">{activePortItem.title}</p>
              </div>
              <button
                onClick={() => {
                  setIsEditPortOpen(false);
                  setActivePortItem(null);
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditPortfolio} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Judul Konten Video</label>
                <input
                  type="text"
                  required
                  value={portTitle}
                  onChange={(e) => setPortTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Platform</label>
                  <select
                    value={portPlatform}
                    onChange={(e) => setPortPlatform(e.target.value as "tiktok" | "instagram")}
                    className="w-full px-3 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-neutral-700 cursor-pointer focus:outline-none"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Kategori Niche</label>
                  <select
                    value={portNiche}
                    onChange={(e) => setPortNiche(e.target.value as CreatorNiche)}
                    className="w-full px-3 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-neutral-700 cursor-pointer focus:outline-none"
                  >
                    <option value="kecantikan">Kecantikan</option>
                    <option value="kuliner">Kuliner</option>
                    <option value="fesyen">Fesyen</option>
                    <option value="pariwisata">Pariwisata</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Tautan URL Postingan</label>
                  <input
                    type="url"
                    required
                    value={portUrl}
                    onChange={(e) => setPortUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Jumlah Views</label>
                  <input
                    type="number"
                    required
                    value={portViews}
                    onChange={(e) => setPortViews(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-neutral-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Deskripsi Singkat Konten</label>
                <textarea
                  rows={3}
                  required
                  value={portDesc}
                  onChange={(e) => setPortDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditPortOpen(false);
                    setActivePortItem(null);
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

      {/* Modal Delete Confirmation */}
      {isDeleteConfirmOpen && activePortItem && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-base font-black text-neutral-900 leading-none mb-3">
              Hapus Item Portofolio?
            </h3>
            <p className="text-xs text-neutral-500 font-semibold leading-relaxed mb-6">
              Anda akan menghapus item portofolio <span className="font-extrabold text-neutral-900">&quot;{activePortItem.title}&quot;</span> secara permanen dari daftar katalog Anda. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setActivePortItem(null);
                }}
                className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeletePortfolio}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full transition-all border border-red-700/10 shadow-md cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
