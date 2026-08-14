import { CampaignSubmissionDomain } from "../types";

export const INITIAL_SUBMISSION_FIXTURES: CampaignSubmissionDomain[] = [
  {
    id: "sub-101",
    campaignId: "camp-1",
    creator: {
      id: "cr-1",
      name: "Angkasa",
      username: "@angkasacreates",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      tiktokHandle: "@angkasacreates",
    },
    campaign: {
      id: "camp-1",
      title: "Promo Kopi Susu Aren - Unboxing & Review",
      rewardPer1000Views: 10000, // Rp 10.000 / 1.000 views
      platform: "tiktok",
    },
    umkm: {
      id: "umkm-1",
      name: "Kopi ABC",
      ownerName: "Budi Santoso",
    },
    platform: "tiktok",
    postUrl: "https://www.tiktok.com/@angkasacreates/video/73918239410294129",
    note: "Konten sudah tayang dan mencapai FYP, silakan dicek kak!",
    submittedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
    status: "pending",
  },
  {
    id: "sub-102",
    campaignId: "camp-2",
    creator: {
      id: "cr-2",
      name: "Siti Rahma",
      username: "@sitikuliner",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      tiktokHandle: "@sitikuliner",
    },
    campaign: {
      id: "camp-2",
      title: "Spill Rahasia Sambal Pedas Mantap",
      rewardPer1000Views: 12500, // Rp 12.500 / 1.000 views
      platform: "tiktok",
    },
    umkm: {
      id: "umkm-2",
      name: "Sambal Bu Nina",
      ownerName: "Nina Herlina",
    },
    platform: "tiktok",
    postUrl: "https://www.tiktok.com/@sitikuliner/video/73919829381928410",
    note: "Video memasak dan me-review rasa pedas produk.",
    submittedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
    status: "pending",
  },
  {
    id: "sub-103",
    campaignId: "camp-3",
    creator: {
      id: "cr-3",
      name: "Rizky Tech",
      username: "@rizkygadget",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      tiktokHandle: "@rizkygadget",
    },
    campaign: {
      id: "camp-3",
      title: "Review Aksesoris Smartphone Lokal",
      rewardPer1000Views: 15000, // Rp 15.000 / 1.000 views
      platform: "tiktok",
    },
    umkm: {
      id: "umkm-3",
      name: "GadgetKu Indonesia",
      ownerName: "Rudi Hartono",
    },
    platform: "tiktok",
    postUrl: "https://www.tiktok.com/@rizkygadget/video/73914482910391823",
    note: "Review ketahanan casing dan charger lokal.",
    submittedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5h ago
    status: "pending",
  },
  {
    id: "sub-104",
    campaignId: "camp-4",
    creator: {
      id: "cr-4",
      name: "Maya Outfit",
      username: "@maya_style",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      tiktokHandle: "@maya_style",
    },
    campaign: {
      id: "camp-4",
      title: "Try-On Haul Batik Modern Edisi Summer",
      rewardPer1000Views: 10000,
      platform: "tiktok",
    },
    umkm: {
      id: "umkm-4",
      name: "Batik Nusantara Crafter",
      ownerName: "Sari Dewi",
    },
    platform: "tiktok",
    postUrl: "https://www.tiktok.com/@maya_style/video/73909128391029482",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "approved",
    verifiedViews: 24500,
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    verifiedBy: "Admin Operations",
    estimatedReward: 240000,
    finalReward: 240000,
  },
  {
    id: "sub-105",
    campaignId: "camp-5",
    creator: {
      id: "cr-5",
      name: "Dewi Beauty",
      username: "@dewibeautytips",
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
      tiktokHandle: "@dewibeautytips",
    },
    campaign: {
      id: "camp-5",
      title: "Skincare Glow Up Alami",
      rewardPer1000Views: 12000,
      platform: "tiktok",
    },
    umkm: {
      id: "umkm-5",
      name: "GlowOrganik Herbal",
      ownerName: "Fitriani",
    },
    platform: "tiktok",
    postUrl: "https://www.tiktok.com/@dewibeautytips/video/73908129481920391",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    status: "rejected",
    rejectionReason: "Konten tidak sesuai brief",
    verifiedBy: "Admin Operations",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
  },
];
