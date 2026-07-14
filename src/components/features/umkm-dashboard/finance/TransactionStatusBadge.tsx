"use client";

import { TransactionStatus } from "./finance.types";
import { DashboardBadge } from "../shared/DashboardBadge";
import { getStatusLabel } from "./finance.utils";

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

export function TransactionStatusBadge({ status, className }: TransactionStatusBadgeProps) {
  const getTone = (s: TransactionStatus): "orange" | "green" | "blue" | "amber" | "red" | "neutral" | "slate" => {
    switch (s) {
      case "pending":
        return "amber";
      case "escrow":
        return "blue";
      case "success":
        return "green";
      case "failed":
        return "red";
      case "refunded":
        return "slate";
      default:
        return "neutral";
    }
  };

  return (
    <DashboardBadge tone={getTone(status)} className={className}>
      {getStatusLabel(status)}
    </DashboardBadge>
  );
}
