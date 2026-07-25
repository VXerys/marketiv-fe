import { UmkmProfile, UmkmSettingsProfile } from "@/types/umkm-dashboard.types";
import { MOCK_ASSETS } from "@/constants/mock-assets.constants";

export const mockUmkmProfile: UmkmProfile = {
  id: "umkm_001",
  businessName: "Dapur Sehat Sukabumi",
  ownerName: "Nadia Putri",
  email: "owner@dapur-sehat.id",
  whatsappNumber: "6281234567890",
  location: "Sukabumi, Jawa Barat",
  avatarUrl: MOCK_ASSETS.umkm.dapurSehat,
  isVerified: true,
};

/**
 * Baris `umkm_profiles` untuk halaman Pengaturan (mock). Nilai demo yang dulu
 * di-hardcode di dalam PengaturanClient dipindah ke sini — tempatnya yang benar.
 */
export const mockUmkmSettingsProfile: UmkmSettingsProfile = {
  docId: "umkm_profile_001",
  userId: "umkm_001",
  businessName: "Dapur Sehat Sukabumi",
  category: "kuliner",
  description:
    "Penyedia makanan sehat premium khas Sukabumi, dengan cita rasa autentik dan bahan pilihan segar.",
  city: "Sukabumi",
  address: "Jl. Merdeka No. 45",
  tiktok: "dapursehat.sukabumi",
  logoUrl: "",
  isProfileCompleted: true,
};
