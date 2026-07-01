import { UmkmProfile } from "@/types/umkm-dashboard.types";
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
