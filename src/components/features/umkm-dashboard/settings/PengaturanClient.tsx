"use client";

import { Store, MapPin, Bell, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";

const INITIAL_SECTIONS = [
  {
    title: "Profil Bisnis",
    icon: Store,
    color: "#ea580c",
    bg: "#fff7ed",
    border: "rgba(234,88,12,.18)",
    fields: [
      { id: "businessName", label: "Nama Bisnis", value: "Dapur Sehat Sukabumi", type: "text" },
      { id: "category", label: "Kategori", value: "Kuliner — Makanan Sehat", type: "text" },
      { id: "description", label: "Deskripsi", value: "Penyedia makanan sehat premium khas Sukabumi, dengan cita rasa autentik dan bahan pilihan segar.", type: "textarea" },
    ],
  },
  {
    title: "Kontak & Lokasi",
    icon: MapPin,
    color: "#2563eb",
    bg: "#f0f6ff",
    border: "rgba(37,99,235,.18)",
    fields: [
      { id: "whatsapp", label: "Nomor WhatsApp", value: "+62 812-3456-7890", type: "text" },
      { id: "email", label: "Email Bisnis", value: "dapursehat.sukabumi@gmail.com", type: "email" },
      { id: "address", label: "Alamat", value: "Jl. Merdeka No. 45, Sukabumi", type: "text" },
      { id: "website", label: "Website", value: "www.dapursehatsukabumi.com", type: "text" },
    ],
  },
];

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
    <div
      onClick={onClick}
      style={{
        width: 44,
        height: 26,
        borderRadius: 999,
        background: enabled ? "linear-gradient(135deg, #f97316, #ea580c)" : "#e5e9ee",
        position: "relative",
        cursor: "pointer",
        transition: ".22s",
        boxShadow: enabled ? "0 4px 12px rgba(234,88,12,.24)" : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: enabled ? "calc(100% - 23px)" : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,.14)",
          transition: ".22s cubic-bezier(.2,.8,.2,1)",
        }}
      />
    </div>
  );
}

interface PengaturanClientProps {
  businessName: string;
}

export function PengaturanClient({ businessName }: PengaturanClientProps) {
  const [notifications, setNotifications] = useState<NotificationSetting[]>(INITIAL_NOTIFICATIONS);
  const [sections, setSections] = useState(INITIAL_SECTIONS);

  const handleToggle = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const handleFieldChange = (sectionIndex: number, fieldId: string, value: string) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== sectionIndex) return sec;
        return {
          ...sec,
          fields: sec.fields.map((f) => (f.id === fieldId ? { ...f, value } : f)),
        };
      })
    );
  };

  const handleSaveChanges = () => {
    toast.success("Pengaturan berhasil disimpan!");
  };

  const handleDeactivate = () => {
    toast.error("Akun berhasil dinonaktifkan sementara.");
  };

  return (
    <UmkmDashboardChrome businessName={businessName}>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#ea580c", fontSize: ".74rem", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>
            <span style={{ width: 18, height: 2, borderRadius: 999, background: "#f97316", display: "block" }} />
            Akun UMKM
          </div>
          <h2 style={{ fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 700, letterSpacing: "-.06em", color: "#182033", margin: 0 }}>Pengaturan</h2>
        </div>

        {/* Profile card */}
        <div style={{ padding: "22px", borderRadius: 24, border: "1px solid rgba(17,24,39,.08)", background: "radial-gradient(circle at 100% 0%, rgba(249,115,22,.08), transparent 16rem), rgba(255,255,255,.92)", boxShadow: "0 8px 24px rgba(15,23,42,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid rgba(17,24,39,.08)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: "radial-gradient(circle at 36% 28%, rgba(255,255,255,.86) 0 12%, transparent 13%), linear-gradient(135deg, #fed7aa, #fb923c)", boxShadow: "0 12px 28px rgba(249,115,22,.18)", flexShrink: 0 }} />
            <div>
              <h3 style={{ fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-.04em", color: "#182033", margin: "0 0 5px" }}>{businessName}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, minHeight: 26, padding: "0 10px", borderRadius: 999, background: "#f1fbf5", border: "1px solid rgba(22,163,74,.22)", color: "#177b42", fontSize: ".74rem", fontWeight: 800 }}>
                  <Check size={11} /> Akun Terverifikasi
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", minHeight: 26, padding: "0 10px", borderRadius: 999, background: "#fff7ed", border: "1px solid rgba(249,115,22,.22)", color: "#ea580c", fontSize: ".74rem", fontWeight: 800 }}>
                  UMKM Plan
                </span>
              </div>
            </div>
            <button
              onClick={() => toast.info("Unggah foto baru sedang diproses.")}
              style={{ marginLeft: "auto", minHeight: 38, padding: "0 16px", borderRadius: 12, border: "1px solid rgba(17,24,39,.10)", background: "rgba(255,255,255,.82)", color: "#34435d", fontSize: ".82rem", fontWeight: 790, cursor: "pointer", boxShadow: "0 4px 12px rgba(15,23,42,.04)", flexShrink: 0 }}
            >
              Edit Foto
            </button>
          </div>

          {/* Setting sections */}
          {sections.map((section, sIdx) => (
            <div key={section.title} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: section.bg, border: `1px solid ${section.border}`, display: "grid", placeItems: "center" }}>
                  <section.icon size={16} color={section.color} />
                </div>
                <h4 style={{ fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: ".94rem", fontWeight: 700, letterSpacing: "-.03em", color: "#182033", margin: 0 }}>{section.title}</h4>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {section.fields.map((field) => (
                  <div key={field.label} style={{ display: "grid", gap: 6 }}>
                    <label style={{ color: "#34435d", fontSize: ".78rem", fontWeight: 800 }}>{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={field.value}
                        onChange={(e) => handleFieldChange(sIdx, field.id, e.target.value)}
                        rows={3}
                        style={{ width: "100%", border: "1px solid rgba(17,24,39,.10)", borderRadius: 14, padding: "11px 14px", background: "rgba(255,255,255,.90)", color: "#182033", fontSize: ".86rem", fontFamily: "inherit", resize: "vertical", outline: "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,.9), 0 4px 12px rgba(15,23,42,.03)" }}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => handleFieldChange(sIdx, field.id, e.target.value)}
                        style={{ width: "100%", border: "1px solid rgba(17,24,39,.10)", borderRadius: 14, padding: "0 14px", height: 46, background: "rgba(255,255,255,.90)", color: "#182033", fontSize: ".86rem", fontFamily: "inherit", outline: "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,.9), 0 4px 12px rgba(15,23,42,.03)" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSaveChanges}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 22px", border: "1px solid rgba(194,65,12,.22)", borderRadius: 14, background: "linear-gradient(180deg, #fb7a18, #ea580c)", color: "white", fontWeight: 790, fontSize: ".88rem", boxShadow: "0 12px 28px rgba(234,88,12,.22)", cursor: "pointer" }}
          >
            Simpan Perubahan
          </button>
        </div>

        {/* Notifications */}
        <div style={{ padding: "22px", borderRadius: 24, border: "1px solid rgba(17,24,39,.08)", background: "rgba(255,255,255,.92)", boxShadow: "0 8px 24px rgba(15,23,42,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "#f7f3ff", border: "1px solid rgba(124,58,237,.18)", display: "grid", placeItems: "center" }}>
              <Bell size={16} color="#7c3aed" />
            </div>
            <h4 style={{ fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: ".94rem", fontWeight: 700, letterSpacing: "-.03em", color: "#182033", margin: 0 }}>Preferensi Notifikasi</h4>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {notifications.map((n) => (
              <div key={n.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "13px 16px", borderRadius: 16, background: "#f8fafc", border: "1px solid rgba(17,24,39,.06)" }}>
                <div>
                  <strong style={{ display: "block", fontSize: ".86rem", color: "#182033", letterSpacing: "-.018em" }}>{n.label}</strong>
                  <span style={{ color: "#737f91", fontSize: ".76rem" }}>{n.desc}</span>
                </div>
                <Toggle enabled={n.enabled} onClick={() => handleToggle(n.id)} />
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ padding: "20px 22px", borderRadius: 22, border: "1px solid rgba(220,38,38,.16)", background: "linear-gradient(180deg, #fff5f5, #ffffff)" }}>
          <h4 style={{ fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: ".9rem", fontWeight: 700, color: "#b4232a", margin: "0 0 14px" }}>Zona Berbahaya</h4>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <strong style={{ display: "block", fontSize: ".84rem", color: "#182033" }}>Nonaktifkan Akun</strong>
              <span style={{ color: "#737f91", fontSize: ".76rem" }}>Semua campaign aktif akan dihentikan sementara</span>
            </div>
            <button
              onClick={handleDeactivate}
              style={{ minHeight: 38, padding: "0 16px", borderRadius: 12, border: "1px solid rgba(220,38,38,.22)", background: "white", color: "#b4232a", fontSize: ".82rem", fontWeight: 790, cursor: "pointer" }}
            >
              Nonaktifkan
            </button>
          </div>
        </div>
      </div>
    </UmkmDashboardChrome>
  );
}
