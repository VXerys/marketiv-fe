import {
  WithdrawalAction,
  WithdrawalFilter,
  WithdrawalStatus,
} from "./types";

export function maskAccountNumber(accountNumber: string): string {
  const value = accountNumber.trim();
  return value.length > 4 ? `****${value.slice(-4)}` : "****";
}

export function getAvailableWithdrawalActions(
  status: WithdrawalStatus,
): WithdrawalAction[] {
  if (status === "requested") return ["start_processing"];
  if (status === "processing") return ["mark_succeeded", "fail"];
  return [];
}

export function matchesWithdrawalFilter(
  status: WithdrawalStatus,
  filter: WithdrawalFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "operational") {
    return status === "requested" || status === "processing";
  }
  return status === filter;
}
