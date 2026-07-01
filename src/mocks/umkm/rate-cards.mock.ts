import { RateCardPackage } from "@/types/umkm-dashboard.types";

export const mockRateCardPackages: RateCardPackage[] = [
  // Packages for creator_001 (Ahmad Fauzi - max 3)
  {
    id: "pkg_001_1",
    creatorId: "creator_001",
    name: "Paket Basic (TikTok Video)",
    description: "1 video review pendek di TikTok durasi 30-45 detik, raw footage dikirim ke klien, 1x revisi minor.",
    price: 350000,
    deliverable: "1 TikTok Video Post",
    estimatedDays: 5,
    isActive: true,
  },
  {
    id: "pkg_001_2",
    creatorId: "creator_001",
    name: "Paket Growth (TikTok + IG Reel)",
    description: "1 video review TikTok + 1 Instagram Reel (Collab Post), link live chat/konsultasi brief, 2x revisi.",
    price: 600000,
    deliverable: "1 TikTok Post & 1 IG Reel Collab Post",
    estimatedDays: 7,
    isActive: true,
  },
  {
    id: "pkg_001_3",
    creatorId: "creator_001",
    name: "Paket Premium (Full Campaign)",
    description: "2 video TikTok + 2 Instagram Reels, 1x Instagram Story, 3x revisi, prioritas pengerjaan 3 hari.",
    price: 1200000,
    deliverable: "2 TikTok Video, 2 IG Reels (Collab Post), 1 IG Story",
    estimatedDays: 10,
    isActive: true,
  },

  // Packages for creator_002 (Siti Rahma - max 2)
  {
    id: "pkg_002_1",
    creatorId: "creator_002",
    name: "Paket Jajan Hemat (IG Story)",
    description: "3x snap Instagram Story ulasan tempat makan/produk kuliner Anda, live link selama 24 jam.",
    price: 200000,
    deliverable: "3 Instagram Story Posts",
    estimatedDays: 3,
    isActive: true,
  },
  {
    id: "pkg_002_2",
    creatorId: "creator_002",
    name: "Paket Jajan Kenyang (IG Reel)",
    description: "1x video Instagram Reel ulasan produk kuliner durasi 30 detik (Collab Post), 1x revisi.",
    price: 350000,
    deliverable: "1 IG Reel Collab Post",
    estimatedDays: 5,
    isActive: true,
  },

  // Packages for creator_003 (Budi Santoso - max 3)
  {
    id: "pkg_003_1",
    creatorId: "creator_003",
    name: "Paket ASMR Makan (TikTok)",
    description: "1x video TikTok berkonsep ASMR makan/mukbang produk kuliner Anda durasi 60 detik, 1x revisi.",
    price: 500000,
    deliverable: "1 TikTok ASMR Video",
    estimatedDays: 5,
    isActive: true,
  },
  {
    id: "pkg_003_2",
    creatorId: "creator_003",
    name: "Paket Mukbang Penuh (TikTok + IG)",
    description: "1x video TikTok ASMR + 1x Instagram Reel Collab Post, review ekspresif dan interaktif, 2x revisi.",
    price: 900000,
    deliverable: "1 TikTok Video & 1 IG Reel Collab Post",
    estimatedDays: 7,
    isActive: true,
  },
  {
    id: "pkg_003_3",
    creatorId: "creator_003",
    name: "Paket Mukbang Sultan",
    description: "2x video TikTok + 2x Instagram Reels Collab Post + Raw Video asset gratis untuk iklan, 3x revisi.",
    price: 1600000,
    deliverable: "2 TikTok Video, 2 IG Reels Collab Post, Raw Files",
    estimatedDays: 10,
    isActive: true,
  },

  // Packages for creator_004 (Dewi Lestari - max 2)
  {
    id: "pkg_004_1",
    creatorId: "creator_004",
    name: "Paket OOTD Casual (IG Post)",
    description: "1x Instagram Carousel Post (3 foto mix and match baju/produk fashion Anda), 1x revisi.",
    price: 400000,
    deliverable: "1 IG Carousel Post",
    estimatedDays: 4,
    isActive: true,
  },
  {
    id: "pkg_004_2",
    creatorId: "creator_004",
    name: "Paket OOTD Premium (IG Reel Collab)",
    description: "1x video Reels transisi outfit menggunakan baju/produk fashion Anda, Collab Post aktif, 2x revisi.",
    price: 750000,
    deliverable: "1 IG Reels Collab Post",
    estimatedDays: 6,
    isActive: true,
  },

  // Packages for creator_005 (Eko Prasetyo - max 2)
  {
    id: "pkg_005_1",
    creatorId: "creator_005",
    name: "Vlog Staycation (TikTok)",
    description: "1x video TikTok ulasan penginapan/homestay/hotel Anda, sinematik vlog berdurasi 60 detik.",
    price: 600000,
    deliverable: "1 TikTok Travel Vlog Video",
    estimatedDays: 7,
    isActive: true,
  },
  {
    id: "pkg_005_2",
    creatorId: "creator_005",
    name: "Full Travel Campaign (TikTok + IG)",
    description: "1x video TikTok + 1x Instagram Reel Collab Post + 2x Instagram Story ulasan tempat wisata/homestay Anda.",
    price: 1100000,
    deliverable: "1 TikTok Video, 1 IG Reel Collab, 2 IG Stories",
    estimatedDays: 10,
    isActive: true,
  },

  // Packages for creator_006 (Fitriani - max 1)
  {
    id: "pkg_006_1",
    creatorId: "creator_006",
    name: "Daily Makeup Review",
    description: "1x video TikTok review jujur produk kosmetik Anda dikombinasikan dengan routine makeup harian.",
    price: 300000,
    deliverable: "1 TikTok Video Post",
    estimatedDays: 5,
    isActive: true,
  }
];
