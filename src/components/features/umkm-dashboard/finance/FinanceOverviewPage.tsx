"use client";

import { useState, useEffect } from "react";
import { Transaction, UmkmFinanceSummary, EscrowOverview } from "@/types/umkm-dashboard.types";
import { getTransactions } from "@/services/umkm/umkm-dashboard.service";
import { FinanceHeader } from "./FinanceHeader";
import { FinanceSummaryCards } from "./FinanceSummaryCards";
import { EscrowOverviewCard } from "./EscrowOverviewCard";
import { FinanceToolbar } from "./FinanceToolbar";
import { TransactionHistorySection } from "./TransactionHistorySection";
import { FinancePageSkeleton } from "./FinancePageSkeleton";
import { FinanceErrorState } from "./FinanceErrorState";
import { TransactionDetailModal } from "./modals/TransactionDetailModal";
import { PaymentSimulationModal } from "./modals/PaymentSimulationModal";
import { ExportFinanceReportModal } from "./modals/ExportFinanceReportModal";
import { FinanceActionSuccessModal } from "./modals/FinanceActionSuccessModal";

export function FinanceOverviewPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [refFilter, setRefFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("date_desc");

  // Dialog / Modal States
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);
  const [selectedTxPayment, setSelectedTxPayment] = useState<Transaction | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // Fetch initial transactions
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTransactions();
      if (res.success && res.data) {
        setTransactions(res.data);
      } else {
        setError(res.error || "Gagal mengambil data transaksi");
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recalculate summary metrics from the local transaction state
  const computedSummary: UmkmFinanceSummary = (() => {
    const successOrEscrow = transactions.filter(
      (tx) => tx.status === "success" || tx.status === "escrow"
    );

    const totalExpenses = successOrEscrow
      .filter((tx) => tx.type === "deposit" || tx.type === "fee")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const escrowBalance = transactions
      .filter((tx) => tx.status === "escrow")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const pendingPayments = transactions
      .filter((tx) => tx.status === "pending")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const refundsReceived = transactions
      .filter((tx) => tx.type === "refund" && tx.status === "refunded")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const platformFees = transactions
      .filter((tx) => tx.type === "fee" && tx.status === "success")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const successfulTransactionsCount = transactions.filter(
      (tx) => tx.status === "success" || tx.status === "escrow" || tx.status === "refunded"
    ).length;

    return {
      totalExpenses,
      escrowBalance,
      pendingPayments,
      refundsReceived,
      platformFees,
      successfulTransactionsCount,
    };
  })();

  // Recalculate escrow metrics from the local transaction state
  const computedEscrowOverview: EscrowOverview = (() => {
    const activeEscrow = transactions
      .filter((tx) => tx.status === "escrow")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const campaignEscrow = transactions
      .filter((tx) => tx.status === "escrow" && tx.referenceType === "campaign")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const rateCardEscrow = transactions
      .filter((tx) => tx.status === "escrow" && tx.referenceType === "rate_card")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const pendingRelease = rateCardEscrow;
    const refundEligible = campaignEscrow > 0 ? Math.min(campaignEscrow, 1200000) : 0;

    return {
      activeEscrow,
      pendingRelease,
      refundEligible,
      campaignEscrow,
      rateCardEscrow,
    };
  })();

  // Filter & Sort computation
  const filteredTransactions = transactions
    .filter((tx) => {
      // 1. Search Query filter (ID or Description)
      const matchesSearch =
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Status filter
      const matchesStatus = statusFilter === "all" || tx.status === statusFilter;

      // 3. Type filter
      const matchesType = typeFilter === "all" || tx.type === typeFilter;

      // 4. Feature Reference filter
      const matchesRef = refFilter === "all" || tx.referenceType === refFilter;

      return matchesSearch && matchesStatus && matchesType && matchesRef;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortOrder === "date_desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOrder === "date_asc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOrder === "amount_desc") {
        return b.amount - a.amount;
      }
      if (sortOrder === "amount_asc") {
        return a.amount - b.amount;
      }
      return 0;
    });

  const hasFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    refFilter !== "all";

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setRefFilter("all");
    setSortOrder("date_desc");
  };

  // Payment simulated action completion handler
  const handlePaymentSuccess = (txId: string) => {
    setSelectedTxPayment(null);

    // Update transactions status locally to simulate database updates
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId) {
          // If transaction type is deposit or escrow, change status appropriately
          return {
            ...tx,
            status: tx.referenceType === "rate_card" && tx.description.includes("escrow") ? "escrow" : "success",
          };
        }
        return tx;
      })
    );

    // Get the paid transaction info
    const paidTx = transactions.find((tx) => tx.id === txId);

    setSuccessDialog({
      isOpen: true,
      title: "Pembayaran Sukses Terverifikasi",
      message: paidTx
        ? `Pembayaran senilai ${new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(paidTx.amount)} untuk "${paidTx.description}" telah berhasil diproses oleh Midtrans.`
        : "Pembayaran Anda telah berhasil diproses.",
      details: `Midtrans Order ID: ${paidTx?.midtransOrderId || `MID-DEMO-${txId.toUpperCase()}`}`,
    });
  };

  // Export success handler
  const handleExportSuccess = (filename: string) => {
    setIsExportOpen(false);
    setSuccessDialog({
      isOpen: true,
      title: "Laporan Berhasil Diunduh",
      message: "Laporan Keuangan kemajuan P2MW Anda berhasil diekspor. File spreadsheet CSV telah terunduh ke direktori komputer Anda.",
      details: `Filename: ${filename}`,
    });
  };

  if (isLoading) {
    return <FinancePageSkeleton />;
  }

  if (error) {
    return <FinanceErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <FinanceHeader onTriggerExport={() => setIsExportOpen(true)} />

      {/* Summary metrics */}
      <FinanceSummaryCards summary={computedSummary} />

      {/* Escrow overview diagram */}
      <EscrowOverviewCard overview={computedEscrowOverview} />

      {/* Control bar / Toolbar */}
      <FinanceToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        refFilter={refFilter}
        setRefFilter={setRefFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        onClearAll={handleClearAllFilters}
        hasFilters={hasFilters}
      />

      {/* Transaction list */}
      <TransactionHistorySection
        transactions={filteredTransactions}
        onOpenDetails={(tx) => setSelectedTxDetail(tx)}
        onOpenPayment={(tx) => setSelectedTxPayment(tx)}
        isFiltered={hasFilters}
        onResetFilters={handleClearAllFilters}
      />

      {/* Dialog: Detail Transaction */}
      {selectedTxDetail && (
        <TransactionDetailModal
          transaction={selectedTxDetail}
          isOpen={!!selectedTxDetail}
          onClose={() => setSelectedTxDetail(null)}
        />
      )}

      {/* Dialog: Payment checkout Sandbox */}
      {selectedTxPayment && (
        <PaymentSimulationModal
          transaction={selectedTxPayment}
          isOpen={!!selectedTxPayment}
          onClose={() => setSelectedTxPayment(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Dialog: Configure Export */}
      {isExportOpen && (
        <ExportFinanceReportModal
          transactions={transactions}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          onExportSuccess={handleExportSuccess}
        />
      )}

      {/* Dialog: Transaction Complete confirmation */}
      {successDialog.isOpen && (
        <FinanceActionSuccessModal
          isOpen={successDialog.isOpen}
          title={successDialog.title}
          message={successDialog.message}
          details={successDialog.details}
          onClose={() => setSuccessDialog((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}
