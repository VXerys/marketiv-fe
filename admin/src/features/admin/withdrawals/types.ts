export type WithdrawalStatus =
  | "requested"
  | "processing"
  | "succeeded"
  | "failed"
  | "reversed";

export type WithdrawalQueueStatus = WithdrawalStatus | "all";
export type WithdrawalFilter =
  | "operational"
  | "requested"
  | "processing"
  | "succeeded"
  | "reversed"
  | "all";

export type WithdrawalAction =
  | "start_processing"
  | "mark_succeeded"
  | "fail";

export interface WithdrawalCreator {
  name: string;
  username: string | null;
  avatarUrl: string | null;
}

export interface AdminWithdrawal {
  id: string;
  userId: string;
  creator: WithdrawalCreator;
  amount: number;
  payoutMethod: string;
  providerName: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  requestedAt: string | null;
  processingAt: string | null;
  processedAt: string | null;
  failureReason: string | null;
  transferReference: string | null;
  adminNote: string | null;
  processedBy: string | null;
}

export interface AdminWithdrawalQueue {
  items: AdminWithdrawal[];
  total: number;
  limit: number;
  offset: number;
}

export interface MarkWithdrawalSucceededPayload {
  withdrawalId: string;
  transferReference: string;
  adminNote?: string;
}

export interface FailWithdrawalPayload {
  withdrawalId: string;
  failureReason: string;
  adminNote?: string;
}
