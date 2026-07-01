import { Transaction } from "@/types/umkm-dashboard.types";

// Type aliases derived from the global Transaction type
export type TransactionStatus = Transaction["status"];
export type TransactionType = Transaction["type"];
export type ReferenceType = Transaction["referenceType"];
