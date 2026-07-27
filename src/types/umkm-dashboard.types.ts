/**
 * Tipe view-model dashboard UMKM.
 *
 * Semua nilai status di-reexport dari kanon `@/types/domain` — jangan
 * mendefinisikan ulang union status di file ini.
 */
export type {
  ServiceResult,
  ServiceErrorCode,
  CampaignStatus,
  SubmissionStatus,
  FraudStatus,
  TransactionStatus,
  TransactionType,
  OrderStatus,
  OfferStatus,
  EscrowStatus,
  NegotiationStage,
  MessageType,
  RateCardStatus,
} from "./domain";

import type {
  CampaignStatus,
  SubmissionStatus,
  FraudStatus,
  TransactionStatus,
  TransactionType,
  OrderStatus,
  OfferStatus,
  EscrowStatus,
  NegotiationStage,
  MessageType,
  RateCardStatus,
} from "./domain";

export type CreatorNiche =
  | "kuliner"
  | "fashion"
  | "pariwisata"
  | "edukasi"
  | "kecantikan"
  | "lainnya";

export interface UmkmProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  whatsappNumber: string;
  location: string;
  avatarUrl: string;
  isVerified: boolean;
}

/**
 * Baris `umkm_profiles` mentah untuk halaman Pengaturan — DTO get-umkm-profile
 * tidak mengembalikan category/description/address/tiktok yang form butuh.
 * `docId` = $id dokumen, dibutuhkan updateDocument.
 */
export interface UmkmSettingsProfile {
  docId: string;
  userId: string;
  businessName: string;
  category: string;
  description: string;
  city: string;
  address: string;
  tiktok: string;
  logoUrl: string;
  isProfileCompleted: boolean;
}

export interface Campaign {
  id: string;
  umkmId: string;
  title: string;
  brief: string;
  externalAssetUrl: string;
  thumbnailUrl: string;
  niche: CreatorNiche;
  status: CampaignStatus;
  creatorQuota: number;
  usedQuota: number;
  pricePerThousandViews: number;
  totalBudgetEscrow: number;
  usedBudget: number;
  totalViews: number;
  createdAt: string;
  updatedAt: string;
  // Optional wizard fields — aligned with Appwrite Campaigns collection schema
  location?: string;      // Target lokasi kreator
  videoStyle?: string;    // Tone/gaya video (natural, edukatif, dll)
  callToAction?: string;  // CTA yang dipilih (kunjungi_toko, dll)
  hashtags?: string;      // Hashtag rekomendasi
  requiredPoints?: string; // Poin penting yang wajib ada di video
  assetNotes?: string;    // Catatan tambahan untuk aset eksternal
}


export interface CampaignSubmission {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl: string;
  platform: "tiktok" | "instagram";
  contentUrl: string;
  actualViews: number;
  targetViews: number;
  releasedFund: number;
  /** campaign_submissions.status — keputusan UMKM */
  validationStatus: SubmissionStatus;
  /** campaign_submissions.fraudStatus — hasil ai-fraud-precheck, terpisah dari status */
  fraudStatus: FraudStatus;
  rejectedReason?: string;
  submittedAt: string;
  validatedAt?: string;
}

export interface CreatorProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  niche: CreatorNiche;
  bio: string;
  location: string;
  startingPrice: number;
  rating: number;
  completedJobs: number;
  engagementRate: number;
  instagramUrl?: string;
  tiktokUrl?: string;
  isVerified: boolean;
}

export interface RateCardPackage {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  price: number;
  deliverable: string;
  estimatedDays: number;
  /** rate_cards.status — bukan boolean isActive */
  status: RateCardStatus;
}

/**
 * Satu ruang negosiasi dari sisi UMKM — DTO `get-umkm-negotiations`.
 *
 * DI-KEY OLEH `conversationId`, BUKAN `orderId`. Di Alur B urutannya
 * chat → offer → accept → order, jadi order lahir paling akhir dan sebagian
 * besar hidup ruang ini berjalan tanpa order. Karena itu seluruh field offer
 * dan order bersifat opsional; `stage` adalah satu-satunya penanda tahap yang
 * selalu terisi.
 *
 * Nama tipe dipertahankan supaya diff-nya tidak menyebar ke seluruh komponen.
 */
export interface NegotiationOrder {
  /** = conversationId. Kunci route `/negosiasi/[id_conversation]`. */
  id: string;
  conversationId: string;
  stage: NegotiationStage;

  creatorId: string;
  creatorName: string;
  creatorAvatarUrl: string;

  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  /** `conversations.is_archived` — keputusan pengguna, bukan turunan status. */
  isArchived: boolean;

  /** Terisi sejak UMKM mengirim Custom Offer. */
  offerId?: string;
  offerStatus?: OfferStatus;
  projectTitle: string;
  scope: string;
  deadline: string;
  revisionCount?: number;

  /** Terisi setelah kreator accept dan `create-order` selesai (asinkron). */
  orderId?: string;
  orderStatus?: OrderStatus;
  escrowStatus?: EscrowStatus;
  deliverables?: string;
  submittedCollabUrl?: string;

  /** Harga order kalau sudah ada, kalau belum harga offer yang ditawar. */
  finalPrice: number;
  /**
   * Selalu 0 untuk UMKM. Rate Card Order adalah seller-side (ADR-008): UMKM
   * membayar persis harga rate card, potongan 2% ditanggung kreator saat escrow
   * dirilis. Field ini ada supaya bentuknya sejajar dengan sisi kreator.
   */
  platformFee: number;
  /** = finalPrice. Yang dibayar UMKM. */
  totalAmount: number;
}

export interface ChatMessage {
  id: string;
  /**
   * `messages.conversation_id`. Dulu bernama `orderId`, dan pembacanya memang
   * mengirim orderId ke `Query.equal("conversation_id", …)` — kunci yang tidak
   * akan pernah cocok, sehingga chat UMKM selalu kosong.
   */
  conversationId: string;
  senderId: string;
  senderRole: "umkm" | "creator" | "system";
  /** messages.message_type kanon */
  type: MessageType;
  content: string;
  /** Terisi saat `type === "offer"`. `offerId` dibutuhkan aksi hapus/terima. */
  offerData?: {
    offerId: string;
    finalPrice: number;
    scope: string;
    deadline: string;
    revisionCount: number;
  };
  isRead: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  referenceId: string;
  referenceType: "campaign" | "rate_card";
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  midtransOrderId?: string;
  createdAt: string;
}

export interface UmkmDashboardSummary {
  activeCampaigns: number;
  completedCampaigns: number;
  totalViews: number;
  totalSpent: number;
  escrowBalance: number;
  pendingSubmissions: number;
  activeNegotiations: number;
  pendingPayments: number;
}

export interface UmkmFinanceSummary {
  totalExpenses: number;
  escrowBalance: number;
  pendingPayments: number;
  refundsReceived: number;
  platformFees: number;
  successfulTransactionsCount: number;
}

export interface EscrowOverview {
  activeEscrow: number;
  pendingRelease: number;
  refundEligible: number;
  campaignEscrow: number;
  rateCardEscrow: number;
}

