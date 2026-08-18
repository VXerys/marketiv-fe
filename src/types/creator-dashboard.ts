/**
 * Tipe view-model dashboard Kreator.
 *
 * Semua nilai status di-reexport dari kanon `@/types/domain` — jangan
 * mendefinisikan ulang union status di file ini.
 */
import type {
  CampaignStatus,
  ClaimStatus,
  SubmissionStatus,
  FraudStatus,
  OrderStatus,
  OfferStatus,
  NegotiationStage,
  EscrowStatus,
  RateCardStatus,
  TransactionStatus,
  TransactionType,
} from "./domain";

export type {
  ServiceResult,
  ServiceErrorCode,
  CampaignStatus,
  ClaimStatus,
  SubmissionStatus,
  FraudStatus,
  OrderStatus,
  OfferStatus,
  NegotiationStage,
  EscrowStatus,
  RateCardStatus,
  TransactionStatus,
  TransactionType,
} from "./domain";

export type CreatorNiche =
  | "kuliner"
  | "fashion"
  | "pariwisata"
  | "edukasi"
  | "kecantikan"
  | "lainnya";

export interface CreatorProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  niche: CreatorNiche;
  bio: string;
  location: string;
  followers: number;
  startingPrice: number;
  rating: number;
  completedJobs: number;
  engagementRate: number;
  instagramUrl?: string;
  tiktokUrl?: string;
  isVerified: boolean;
  isOnboarded: boolean;
  bannerUrl?: string;
  averageViews?: number;
  responseTime?: string;
  completionRate?: number;
  portfolioUrl?: string;
}

/**
 * `creator_portfolios` hanya menyimpan creatorId, title, description,
 * thumbnailUrl, dan portfolioUrl. `platform`, `niche`, dan `views` tidak punya
 * kolom — biarkan opsional dan jangan dirender bila kosong.
 */
export interface CreatorPortfolioItem {
  id: string;
  title: string;
  url: string;
  description: string;
  thumbnailUrl?: string;
  platform?: "tiktok" | "instagram";
  niche?: CreatorNiche;
  views?: number;
}

export interface CreatorMetric {
  availableJobsCount: number;
  activeJobsCount: number;
  pendingSubmissionsCount: number;
  balance: number;
  pendingPayouts: number;
  validatedViewsCount: number;
  activeRateCardsCount: number;
  negotiationOrdersCount: number;
  escrowBalance: number;
  totalEarnings?: number;
  thisMonthEarnings?: number;
  campaignEarnings?: number;
  rateCardEarnings?: number;
}

/** Satu baris `campaign_assets` — materi opsional yang disediakan UMKM. */
export interface CreatorJobMaterial {
  id: string;
  /** `campaign_assets.fileName`, jatuh ke host URL bila kosong. */
  label: string;
  url: string;
  /** `campaign_assets.type` — menentukan aksi "Buka" (link) atau "Unduh" (file). */
  kind: "link" | "file";
}

export interface CreatorJob {
  id: string;
  title: string;
  brandName: string;
  brandAvatar: string;
  brief: string;
  niche: CreatorNiche;
  quota: number;
  usedQuota: number;
  ratePerThousandViews: number;
  status: CampaignStatus;
  totalBudget: number;
  createdAt: string;
  // Detail brief fields
  targetViews?: number;
  productDescription?: string;
  contentInstruction?: string;
  doAndDont?: {
    do: string[];
    dont: string[];
  };
  targetAudience?: string;
  ctaInstruction?: string;
  externalAssetUrl?: string;
  thumbnailUrl?: string;
  /** `campaigns.type` — tipe campaign, mis. "clipping". */
  type?: string;
  /** `campaigns.platforms` — kolom array, bukan string tunggal. */
  platforms?: string[];
  /** Seluruh baris `campaign_assets` milik campaign ini. */
  materials?: CreatorJobMaterial[];
}

export interface CreatorActiveWork {
  id: string; // claimId
  campaignId: string;
  title: string;
  brandName: string;
  brandAvatar: string;
  brief: string;
  ratePerThousandViews: number;
  /** campaign_claims.status kanon */
  status: ClaimStatus;
  claimedAt: string;
  deadline: string;
  submissionId?: string;
  submissionStatus?: SubmissionStatus;
  /** hasil ai-fraud-precheck — terpisah dari submissionStatus */
  fraudStatus?: FraudStatus;
  contentUrl?: string;
  actualViews?: number;
  earnings?: number;
  platform?: "tiktok" | "instagram";
  notes?: string;
  submittedAt?: string;
  validatedAt?: string;
  rejectedReason?: string;
  /** Materi pendukung campaign — `campaign_assets.fileUrl` pertama. */
  assetUrl?: string;
  thumbnailUrl?: string;
  /** Locked views count dari Admin Marketiv validation (ADR-010). */
  viewsCount?: number;
  viewsCapturedAt?: string;
  viewsSource?: string;
  viewsFinal?: boolean;
}

export interface CreatorSubmission {
  id: string;
  campaignId: string;
  claimId: string;
  platform: "tiktok" | "instagram";
  contentUrl: string;
  actualViews: number;
  status: SubmissionStatus;
  fraudStatus?: FraudStatus;
  submittedAt: string;
  validatedAt?: string;
  earnings: number;
}

/**
 * Satu ruang negosiasi dari sisi Kreator — DTO `get-creator-negotiations`.
 *
 * DI-KEY OLEH `conversationId`, BUKAN `orderId`. Di Alur B urutannya
 * chat → offer → accept → order, jadi order lahir paling akhir dan sebagian
 * besar hidup ruang ini berjalan tanpa order. Karena itu seluruh field offer
 * dan order bersifat opsional; `stage` adalah satu-satunya penanda tahap yang
 * selalu terisi.
 *
 * Bentuknya sejajar dengan `NegotiationOrder` di umkm-dashboard.types.ts —
 * yang berbeda hanya identitas lawan bicara dan semantik fee.
 */
export interface CreatorNegotiation {
  /** = conversationId. Kunci route `/negosiasi/[id_conversation]`. */
  id: string;
  conversationId: string;
  stage: NegotiationStage;

  umkmId: string;
  umkmName: string;
  umkmAvatarUrl: string;

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
  /** escrows.status kanon */
  escrowStatus?: EscrowStatus;
  deliverables?: string;
  submittedCollabUrl?: string;

  /** Harga order kalau sudah ada, kalau belum harga offer yang ditawar. */
  finalPrice: number;
  /**
   * Potongan 2% yang ditanggung kreator. Rate Card Order adalah seller-side
   * (ADR-008) — UMKM membayar `finalPrice` penuh, kreator menerima sisanya.
   */
  platformFee: number;
  /** = finalPrice - platformFee. Yang DITERIMA kreator. */
  totalAmount: number;
}

export interface CreatorRateCardPackage {
  id: string;
  /** $id parent rate_cards — dibutuhkan write (model 1 rate_cards per paket). */
  rateCardId: string;
  name: string;
  description: string;
  price: number;
  deliverable: string;
  estimatedDays: number;
  /** rate_cards.status — bukan boolean isActive */
  status: RateCardStatus;
  revisionCount?: number;
  // Tidak ada kolom platform di rate_card_packages (MVP TikTok-only).
}

export interface CreatorTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  referenceId?: string;
  source?: "Campaign" | "Rate Card" | "Withdrawal";
  relatedName?: string;
  notes?: string;
}

/**
 * Empat nilai pertama adalah kategori tampilan yang sudah punya warna & label di
 * CreatorDashboardView. Sisanya adalah nilai `notifications.type` yang benar-benar
 * ditulis backend dan tidak punya padanan — diteruskan apa adanya, dan UI
 * menampilkannya sebagai "INFO" lewat cabang default-nya.
 */
export type CreatorActivityType =
  | "submission_valid"
  | "payout"
  | "negotiation_new"
  | "pending_escrow"
  | "claim"
  | "claim_expired"
  | "campaign_published";

export interface CreatorActivity {
  id: string;
  type: CreatorActivityType;
  title: string;
  description: string;
  amount?: number;
  createdAt: string;
}
