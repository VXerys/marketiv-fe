import type { Creator } from "@/types/campaign";
import type {
  CreatorProfile,
  CreatorNiche,
  RateCardPackage,
} from "@/types/umkm-dashboard.types";
import type { RateCardPackage as RateCardPackageView } from "./detail/RateCardPackageCard";
import { formatCurrency } from "@/lib/formatters";

/**
 * Adapter kanon → view-model kartu kreator (s1-creators).
 *
 * `Creator` (@/types/campaign) adalah view-model lama yang dikonsumsi
 * CreatorCard & CreatorProfileHero. Sumber datanya kini `CreatorProfile`
 * dari service (getCreators/getCreatorById), bukan lagi src/data/creators.ts.
 *
 * Dua field tidak punya padanan di kanon:
 * - `followers`  → tidak ada kolom sumber (creator_profiles.totalFollowers baru
 *   tersedia lewat Function DTO). Ditampilkan "—" agar tidak mengarang angka.
 * - `totalReviews` → memakai `completedJobs` sebagai proxy (satu pekerjaan
 *   selesai ≈ satu ulasan) sampai DTO ulasan tersedia.
 */

/** Label kategori tampilan per niche kanon. */
const NICHE_LABEL: Record<CreatorNiche, string> = {
  kuliner: "Kuliner",
  fashion: "Fashion",
  pariwisata: "Pariwisata",
  edukasi: "Edukasi",
  kecantikan: "Kecantikan",
  lainnya: "Lainnya",
};

/**
 * Paket rate card kanon → view-model kartu paket.
 *
 * Kanon tidak membawa `revisionLimit`, `recommended`, maupun daftar deliverable
 * jamak (hanya satu string `deliverable`). Nilai default di bawah dipakai
 * sampai tipe kanon/DTO diperluas — bukan data fabrikasi per kategori seperti
 * generator lama.
 */
export function toRateCardPackageView(pkg: RateCardPackage): RateCardPackageView {
  return {
    id: pkg.id,
    name: pkg.name,
    price: formatCurrency(pkg.price),
    description: pkg.description,
    deliveryDays: pkg.estimatedDays,
    revisionLimit: null,
    deliverables: pkg.deliverable ? [pkg.deliverable] : [],
  };
}

export function toCreatorView(profile: CreatorProfile): Creator {
  return {
    id: profile.id,
    name: profile.name,
    username: profile.username || profile.name.toLowerCase().replace(/\s+/g, ""),
    description: profile.bio || "Kreator konten terverifikasi siap berkolaborasi untuk promosi produk Anda.",
    category: NICHE_LABEL[profile.niche] ?? "Lainnya",
    imageUrl: profile.avatarUrl,
    bannerUrl: profile.bannerUrl,
    estimatedSalary: profile.startingPrice > 0 ? formatCurrency(profile.startingPrice) : "Mulai Rp 100.000",
    followers: profile.engagementRate > 0 ? `${profile.engagementRate}%` : "Aktif",
    rating: profile.rating,
    totalReviews: profile.completedJobs,
    isVerified: profile.isVerified,
    location: profile.location || "Indonesia",
    engagementRate: profile.engagementRate,
    completedJobs: profile.completedJobs,
    instagramUrl: profile.instagramUrl,
    tiktokUrl: profile.tiktokUrl,
  };
}
