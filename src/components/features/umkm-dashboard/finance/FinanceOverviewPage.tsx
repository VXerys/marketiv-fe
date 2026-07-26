"use client";

import { useState, useEffect, useCallback } from "react";
import { useStickyToolbar } from "@/hooks/useStickyToolbar";
import { Transaction, UmkmFinanceSummary, EscrowOverview } from "@/types/umkm-dashboard.types";
import { getTransactions, getFinanceOverview } from "@/services/umkm/umkm-dashboard.service";
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
  const [summary, setSummary] = useState<UmkmFinanceSummary | null>(null);
  const [escrowOverview, setEscrowOverview] = useState<EscrowOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [refFilter, setRefFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("date_desc");
  const { toolbarRef, isSticky: isToolbarSticky } = useStickyToolbar();

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

  // Fetch transaksi + ringkasan finansial (dihitung backend, bukan di klien).
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Satu panggilan untuk finance + escrow — menghindari dua agregasi identik.
      const [txRes, financeRes] = await Promise.all([
        getTransactions(),
        getFinanceOverview(),
      ]);

      if (!txRes.success || !txRes.data) {
        setError(txRes.error || "Gagal mengambil data transaksi");
        return;
      }
      setTransactions(txRes.data);
      setSummary(financeRes.success && financeRes.data ? financeRes.data.finance : null);
      setEscrowOverview(financeRes.success && financeRes.data ? financeRes.data.escrow : null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
            status: tx.referenceType === "rate_card" && tx.description.includes("escrow") ? "held" as const : "paid" as const,
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
    <div className="space-y-6 max-w-[1280px] mx-auto pb-20">
      {/* Header */}
      <FinanceHeader onTriggerExport={() => setIsExportOpen(true)} />

      {/* Summary metrics — dari service (getFinanceSummary), bukan hitung ulang klien */}
      {summary && <FinanceSummaryCards summary={summary} />}

      {/* Escrow overview diagram — dari service (getEscrowOverview) */}
      {escrowOverview && <EscrowOverviewCard overview={escrowOverview} />}

      {/* Control bar / Toolbar — sticky direct child of space-y-6 container */}
      <div ref={toolbarRef} style={{ position: "sticky", top: 0, zIndex: 30 }}>
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
          isSticky={isToolbarSticky}
        />
      </div>

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
