import type {
  DeliverableSource,
  DeliverableStatus,
  EscrowStatus,
  OrderStatus,
  RevisionStatus,
} from "./domain";

export type RatecardValidationStatus = "pending" | "valid" | "invalid";

export interface RatecardReviewDeliverable {
  id: string;
  version: number;
  status: DeliverableStatus;
  source: DeliverableSource;
  fileUrl: string;
  notes: string;
  createdAt: string;
}

export interface RatecardReviewValidation {
  status: RatecardValidationStatus;
  reviewNotes?: string;
  reviewedAt?: string;
}

export interface RatecardReviewPackageContext {
  id: string;
  name: string;
  description: string;
  output: string;
  deliveryDays: number;
  basePrice: number;
}

export interface RatecardReviewRevision {
  id: string;
  message: string;
  status: RevisionStatus;
  createdAt: string;
}

export interface RatecardReview {
  orderId: string;
  conversationId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl: string;
  projectTitle: string;
  scope: string;
  packageContext: RatecardReviewPackageContext | null;
  amount: number;
  orderStatus: OrderStatus;
  escrowStatus: EscrowStatus | "";
  revisionCount: number;
  revisionLimit: number;
  latestDeliverable: RatecardReviewDeliverable | null;
  validation: RatecardReviewValidation;
  deliverableHistory: RatecardReviewDeliverable[];
  revisionHistory: RatecardReviewRevision[];
  createdAt: string;
}

export type RatecardReviewFilter =
  | "action_required"
  | "marketiv_validation"
  | "revision"
  | "completed";
