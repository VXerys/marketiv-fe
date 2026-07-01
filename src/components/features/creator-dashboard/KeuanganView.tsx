"use client";

import { useState } from "react";
import { CreatorMetric, CreatorTransaction } from "@/types/creator-dashboard";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { CreatorMetricCard } from "./CreatorMetricCard";
import { CreatorStatusBadge } from "./CreatorStatusBadge";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface KeuanganViewProps {
  metrics: CreatorMetric;
  initialTransactions: CreatorTransaction[];
}

type SimulatedState = "normal" | "loading" | "empty" | "filter_empty" | "error";

export function KeuanganView({ metrics, initialTransactions }: KeuanganViewProps) {
  // QA Simulated State
  const [simulatedState, setSimulatedState] = useState<SimulatedState>("normal");

  const [walletMetrics, setWalletMetrics] = useState<CreatorMetric>({
    ...metrics,
    totalEarnings: metrics.totalEarnings ?? 2300000,
    thisMonthEarnings: metrics.thisMonthEarnings ?? 600000,
    campaignEarnings: metrics.campaignEarnings ?? 1500000,
    rateCardEarnings: metrics.rateCardEarnings ?? 800000,
  });
  
  const [transactions, setTransactions] = useState<CreatorTransaction[]>(initialTransactions);

  // Withdrawal form states
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [bankName, setBankName] = useState("mandiri");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [amount, setAmount] = useState("");

  // Step state for withdrawal flow: "form" | "confirm" | "success"
  const [withdrawStep, setWithdrawStep] = useState<"form" | "confirm" | "success">("form");
  const [lastWithdrawalDetails, setLastWithdrawalDetails] = useState<{
    id: string;
    bank: string;
    number: string;
    holder: string;
    amount: number;
    fee: number;
    total: number;
  } | null>(null);

  // Detail Modal state
  const [selectedTx, setSelectedTx] = useState<CreatorTransaction | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest"); // "latest" | "oldest" | "highest" | "lowest"

  const ADMIN_FEE = 2500;
  const MIN_WITHDRAWAL = 50000;

  // Derived balance limit
  const numericAmount = Number(amount) || 0;
  const isAmountTooLow = numericAmount > 0 && numericAmount < MIN_WITHDRAWAL;
  const isAmountTooHigh = numericAmount > 0 && (numericAmount + ADMIN_FEE) > walletMetrics.balance;
  const isAmountValid = numericAmount >= MIN_WITHDRAWAL && (numericAmount + ADMIN_FEE) <= walletMetrics.balance;

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAmountValid) return;

    // Proceed to confirmation step
    setWithdrawStep("confirm");
  };

  const handleConfirmWithdrawal = () => {
    const withdrawAmt = Number(amount);
    const totalDebited = withdrawAmt + ADMIN_FEE;
    const txId = `tx_wd_${Date.now().toString().slice(-6)}`;

    // Process local balance updates
    setWalletMetrics(prev => ({
      ...prev,
      balance: prev.balance - totalDebited,
      pendingPayouts: prev.pendingPayouts + withdrawAmt,
    }));

    // Create new pending transaction
    const newTx: CreatorTransaction = {
      id: txId,
      type: "withdrawal",
      amount: withdrawAmt,
      status: "Pending",
      description: `Penarikan saldo wallet ke ${bankName.toUpperCase()} (${accountNumber})`,
      createdAt: new Date().toISOString(),
      source: "Withdrawal",
      notes: "Sedang diproses oleh bank penyalur."
    };

    setTransactions([newTx, ...transactions]);

    setLastWithdrawalDetails({
      id: txId,
      bank: bankName,
      number: accountNumber,
      holder: accountHolder,
      amount: withdrawAmt,
      fee: ADMIN_FEE,
      total: totalDebited,
    });

    setWithdrawStep("success");
  };

  const resetWithdrawForm = () => {
    setIsWithdrawOpen(false);
    setWithdrawStep("form");
    setAmount("");
    setAccountNumber("");
    setAccountHolder("");
    setLastWithdrawalDetails(null);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterStatus("all");
    setSortBy("latest");
  };

  const isFilterActive = searchQuery !== "" || filterType !== "all" || filterStatus !== "all" || sortBy !== "latest";

  // Filter and sort transactions
  const processedTransactions = (() => {
    // If empty state simulated
    if (simulatedState === "empty") return [];

    let result = [...transactions];

    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.id.toLowerCase().includes(q) ||
          tx.description.toLowerCase().includes(q) ||
          (tx.relatedName && tx.relatedName.toLowerCase().includes(q))
      );
    }

    // Source type filter
    if (filterType !== "all") {
      result = result.filter((tx) => tx.source?.toLowerCase() === filterType.toLowerCase());
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((tx) => tx.status.toLowerCase() === filterStatus.toLowerCase());
    }

    // If QA simulated filter empty state
    if (simulatedState === "filter_empty") return [];

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      if (sortBy === "latest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "highest") return b.amount - a.amount;
      if (sortBy === "lowest") return a.amount - b.amount;
      return 0;
    });

    return result;
  })();

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "withdrawal":
        return "Tarik Saldo";
      case "payout":
        return "Pendapatan Campaign";
      case "escrow_release":
        return "Dana Escrow";
      case "adjustment":
        return "Penyesuaian";
      default:
        return type;
    }
  };

  const getBankLabel = (code: string) => {
    const banks: Record<string, string> = {
      mandiri: "Bank Mandiri",
      bca: "Bank BCA",
      bni: "Bank BNI",
      bri: "Bank BRI",
      gopay: "GoPay (E-Wallet)",
      ovo: "OVO (E-Wallet)",
    };
    return banks[code] || code.toUpperCase();
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
      {/* QA State Simulator Bar */}
      <div className="mb-6 p-4 bg-white border border-neutral-200/60 shadow-sm rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
          <span className="text-xs font-bold text-neutral-500 tracking-wide">
            STATE SIMULATOR (QA REVIEW):
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["normal", "loading", "empty", "filter_empty", "error"] as const).map((state) => (
            <button
              key={state}
              onClick={() => setSimulatedState(state)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer border",
                simulatedState === state
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                  : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200/60"
              )}
            >
              {state.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <CreatorPageHeader
        title="Keuangan & Dompet"
        description="Pantau seluruh saldo, riwayat pencairan, pendapatan campaign, dan transaksi escrow Rate Card Anda."
      >
        <button
          onClick={() => {
            setIsWithdrawOpen(true);
            setWithdrawStep("form");
          }}
          disabled={walletMetrics.balance < MIN_WITHDRAWAL || simulatedState === "loading" || simulatedState === "error"}
          className={cn(
            "inline-flex font-bold text-xs px-5 py-2.5 rounded-full border shadow-sm transition-all cursor-pointer items-center gap-1.5",
            walletMetrics.balance < MIN_WITHDRAWAL || simulatedState === "loading" || simulatedState === "error"
              ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed shadow-none"
              : "bg-primary hover:bg-primary-600 text-white border-primary hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ajukan Withdrawal
        </button>
      </CreatorPageHeader>

      {/* Error State Simulator View */}
      {simulatedState === "error" ? (
        <div className="bg-red-50 border border-red-200/60 text-red-800 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto mt-12 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-100/80 border border-red-200/50 flex items-center justify-center text-red-600 mx-auto mb-6 shadow-inner">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-neutral-900 mb-2">Gagal Memuat Data Keuangan</h3>
          <p className="text-sm text-neutral-500 font-semibold leading-relaxed mb-6 max-w-sm mx-auto">
            Sistem gagal tersambung ke database pembayaran. Silakan periksa jaringan internet Anda atau muat ulang halaman.
          </p>
          <button
            onClick={() => setSimulatedState("normal")}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition-all shadow-md hover:-translate-y-0.5 cursor-pointer border border-red-700/10"
          >
            Coba Muat Ulang Data
          </button>
        </div>
      ) : (
        <>
          {/* Metrics Section */}
          <div className="space-y-6 mb-10">
            {/* Main Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulatedState === "loading" ? (
                <>
                  <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 animate-pulse h-[130px] flex flex-col justify-between">
                    <div className="flex justify-between items-start"><div className="h-3.5 w-24 bg-neutral-200 rounded"></div><div className="w-9 h-9 rounded-xl bg-neutral-100"></div></div>
                    <div className="mt-4 space-y-2"><div className="h-7 w-36 bg-neutral-200 rounded"></div><div className="h-3 w-40 bg-neutral-100 rounded"></div></div>
                  </div>
                  <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 animate-pulse h-[130px] flex flex-col justify-between">
                    <div className="flex justify-between items-start"><div className="h-3.5 w-24 bg-neutral-200 rounded"></div><div className="w-9 h-9 rounded-xl bg-neutral-100"></div></div>
                    <div className="mt-4 space-y-2"><div className="h-7 w-32 bg-neutral-200 rounded"></div><div className="h-3 w-40 bg-neutral-100 rounded"></div></div>
                  </div>
                  <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 animate-pulse h-[130px] flex flex-col justify-between">
                    <div className="flex justify-between items-start"><div className="h-3.5 w-24 bg-neutral-200 rounded"></div><div className="w-9 h-9 rounded-xl bg-neutral-100"></div></div>
                    <div className="mt-4 space-y-2"><div className="h-7 w-36 bg-neutral-200 rounded"></div><div className="h-3 w-40 bg-neutral-100 rounded"></div></div>
                  </div>
                </>
              ) : (
                <>
                  <CreatorMetricCard
                    label="Saldo Tersedia"
                    value={walletMetrics.balance}
                    isCurrency={true}
                    helperText="Tersedia untuk ditarik"
                    variant="orange"
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    }
                  />
                  <CreatorMetricCard
                    label="Pending Payout"
                    value={walletMetrics.pendingPayouts}
                    isCurrency={true}
                    helperText="Menunggu audit/validasi views"
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />
                  <CreatorMetricCard
                    label="Total Pendapatan"
                    value={walletMetrics.totalEarnings || 0}
                    isCurrency={true}
                    helperText="Akumulasi seluruh pendapatan"
                    variant="dark"
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    }
                  />
                </>
              )}
            </div>

            {/* Earning Splits Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulatedState === "loading" ? (
                <>
                  <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 animate-pulse h-[130px] flex flex-col justify-between">
                    <div className="flex justify-between items-start"><div className="h-3.5 w-24 bg-neutral-200 rounded"></div><div className="w-9 h-9 rounded-xl bg-neutral-100"></div></div>
                    <div className="mt-4 space-y-2"><div className="h-7 w-32 bg-neutral-200 rounded"></div><div className="h-3 w-40 bg-neutral-100 rounded"></div></div>
                  </div>
                  <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 animate-pulse h-[130px] flex flex-col justify-between">
                    <div className="flex justify-between items-start"><div className="h-3.5 w-24 bg-neutral-200 rounded"></div><div className="w-9 h-9 rounded-xl bg-neutral-100"></div></div>
                    <div className="mt-4 space-y-2"><div className="h-7 w-36 bg-neutral-200 rounded"></div><div className="h-3 w-40 bg-neutral-100 rounded"></div></div>
                  </div>
                  <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 animate-pulse h-[130px] flex flex-col justify-between">
                    <div className="flex justify-between items-start"><div className="h-3.5 w-24 bg-neutral-200 rounded"></div><div className="w-9 h-9 rounded-xl bg-neutral-100"></div></div>
                    <div className="mt-4 space-y-2"><div className="h-7 w-32 bg-neutral-200 rounded"></div><div className="h-3 w-40 bg-neutral-100 rounded"></div></div>
                  </div>
                </>
              ) : (
                <>
                  <CreatorMetricCard
                    label="Pendapatan Bulan Ini"
                    value={walletMetrics.thisMonthEarnings || 0}
                    isCurrency={true}
                    helperText="Bulan berjalan"
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                  <CreatorMetricCard
                    label="Pendapatan Campaign"
                    value={walletMetrics.campaignEarnings || 0}
                    isCurrency={true}
                    helperText="Dari marketing pay-per-view"
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                  <CreatorMetricCard
                    label="Pendapatan Rate Card"
                    value={walletMetrics.rateCardEarnings || 0}
                    isCurrency={true}
                    helperText="Dari negosiasi premium"
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                  />
                </>
              )}
            </div>
          </div>

          {/* Ledger Workspace */}
          <div className="bg-white border border-neutral-200/50 shadow-sm rounded-3xl p-6">
            <div className="flex flex-col gap-4 border-b border-neutral-100 pb-5 mb-6">
              <h3 className="font-extrabold text-neutral-900 text-sm">Riwayat Transaksi Wallet</h3>
              
              {/* Toolbar filters */}
              <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    disabled={simulatedState === "loading"}
                    placeholder="Cari ID, deskripsi, atau campaign..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-neutral-800 placeholder-neutral-400 disabled:opacity-50"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                  {/* Type Filter */}
                  <select
                    disabled={simulatedState === "loading"}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200/60 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 hover:bg-neutral-100/50 transition-all disabled:opacity-50"
                  >
                    <option value="all">Semua Sumber</option>
                    <option value="campaign">Campaign</option>
                    <option value="rate card">Rate Card</option>
                    <option value="withdrawal">Withdrawal</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    disabled={simulatedState === "loading"}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200/60 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 hover:bg-neutral-100/50 transition-all disabled:opacity-50"
                  >
                    <option value="all">Semua Status</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>

                  {/* Sort Filter */}
                  <select
                    disabled={simulatedState === "loading"}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200/60 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 hover:bg-neutral-100/50 transition-all disabled:opacity-50"
                  >
                    <option value="latest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                    <option value="highest">Jumlah Terbesar</option>
                    <option value="lowest">Jumlah Terkecil</option>
                  </select>

                  {/* Reset Filter Button */}
                  {isFilterActive && (
                    <button
                      onClick={handleResetFilters}
                      className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Ledger Table */}
            {simulatedState === "loading" ? (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs font-semibold text-neutral-600">
                  <thead>
                    <tr className="border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      <th className="pb-3 pr-4">ID Transaksi</th>
                      <th className="pb-3 pr-4">Tanggal</th>
                      <th className="pb-3 pr-4">Sumber</th>
                      <th className="pb-3 pr-4">Deskripsi</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse border-b border-neutral-100">
                        <td className="py-4 pr-4"><div className="h-4.5 w-16 bg-neutral-200 rounded"></div></td>
                        <td className="py-4 pr-4"><div className="h-4.5 w-24 bg-neutral-200 rounded"></div></td>
                        <td className="py-4 pr-4"><div className="h-4.5 w-20 bg-neutral-200 rounded"></div></td>
                        <td className="py-4 pr-4"><div className="h-4.5 w-44 bg-neutral-200 rounded"></div></td>
                        <td className="py-4 pr-4"><div className="h-6 w-20 bg-neutral-200 rounded-full"></div></td>
                        <td className="py-4 text-right"><div className="h-4.5 w-24 bg-neutral-200 rounded ml-auto"></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : processedTransactions.length === 0 ? (
              <CreatorEmptyState
                title={simulatedState === "filter_empty" || isFilterActive ? "Transaksi tidak ditemukan" : "Buku Besar Kosong"}
                description={
                  simulatedState === "filter_empty" || isFilterActive
                    ? "Tidak ada catatan transaksi wallet yang memenuhi kriteria filter Anda."
                    : "Anda belum melakukan transaksi keuangan apapun di platform Marketiv."
                }
                actionButton={
                  isFilterActive ? (
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-full transition-all cursor-pointer"
                    >
                      Bersihkan Filter
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs font-semibold text-neutral-600">
                  <thead>
                    <tr className="border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      <th className="pb-3 pr-4">ID Transaksi</th>
                      <th className="pb-3 pr-4">Tanggal</th>
                      <th className="pb-3 pr-4">Sumber</th>
                      <th className="pb-3 pr-4">Deskripsi</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {processedTransactions.map((tx) => {
                      const isNegative = tx.type === "withdrawal";
                      return (
                        <tr
                          key={tx.id}
                          onClick={() => setSelectedTx(tx)}
                          className="hover:bg-neutral-50/50 cursor-pointer transition-colors group"
                        >
                          <td className="py-4 pr-4 font-mono font-bold text-neutral-400 group-hover:text-primary transition-colors">
                            {tx.id}
                          </td>
                          <td className="py-4 pr-4 font-medium text-neutral-500">
                            {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-4 pr-4">
                            <span className="font-extrabold text-neutral-800">
                              {tx.source || getTransactionTypeLabel(tx.type)}
                            </span>
                          </td>
                          <td className="py-4 pr-4 font-medium text-neutral-500 max-w-[280px] truncate">
                            {tx.description}
                          </td>
                          <td className="py-4 pr-4">
                            <CreatorStatusBadge status={tx.status} type="transaction" />
                          </td>
                          <td
                            className={cn(
                              "py-4 text-right font-black text-sm",
                              isNegative ? "text-red-600" : "text-green-600"
                            )}
                          >
                            {isNegative ? "-" : "+"} {formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Withdrawal Simulation Dual-Modal (Form -> Confirm -> Success) */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300 relative">
            
            {/* Form Step */}
            {withdrawStep === "form" && (
              <>
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-black text-neutral-950 leading-none">
                      Simulasi Tarik Saldo
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-extrabold mt-1.5 uppercase tracking-wider">
                      Saldo Tersedia: {formatCurrency(walletMetrics.balance)}
                    </p>
                  </div>
                  <button
                    onClick={resetWithdrawForm}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  {/* Destination Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      Tujuan Penarikan
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="mandiri">Bank Mandiri</option>
                      <option value="bca">Bank BCA</option>
                      <option value="bni">Bank BNI</option>
                      <option value="bri">Bank BRI</option>
                      <option value="gopay">GoPay (E-Wallet)</option>
                      <option value="ovo">OVO (E-Wallet)</option>
                    </select>
                  </div>

                  {/* Account Number or HP */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      {["gopay", "ovo"].includes(bankName) ? "Nomor HP E-Wallet" : "Nomor Rekening"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={["gopay", "ovo"].includes(bankName) ? "Contoh: 0812xxxxxxxx" : "Masukkan nomor rekening..."}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                    />
                  </div>

                  {/* Account Holder Name */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      Nama Pemilik Rekening / Akun
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap pemilik..."
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                    />
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      Jumlah Penarikan (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Nominal penarikan..."
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
                    />
                    
                    {/* Inline warnings */}
                    {isAmountTooLow && (
                      <span className="block text-[10px] text-red-500 font-bold mt-1">
                        ⚠️ Batas minimum penarikan adalah {formatCurrency(MIN_WITHDRAWAL)}
                      </span>
                    )}
                    {isAmountTooHigh && (
                      <span className="block text-[10px] text-red-500 font-bold mt-1">
                        ⚠️ Saldo tidak mencukupi (termasuk biaya admin {formatCurrency(ADMIN_FEE)})
                      </span>
                    )}
                    {!isAmountTooLow && !isAmountTooHigh && (
                      <span className="block text-[9px] text-neutral-400 font-bold mt-1">
                        * Batas minimum penarikan Rp50.000. Biaya admin Rp2.500 per transaksi.
                      </span>
                    )}
                  </div>

                  {/* Live Fee Breakdown Summary */}
                  {numericAmount > 0 && (
                    <div className="p-4 bg-neutral-50 border border-neutral-200/60 rounded-2xl space-y-2 mt-4">
                      <div className="flex justify-between items-center text-xs text-neutral-500 font-semibold">
                        <span>Nominal Penarikan:</span>
                        <span className="text-neutral-800 font-bold">{formatCurrency(numericAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-neutral-500 font-semibold">
                        <span>Biaya Admin Transaksi:</span>
                        <span className="text-neutral-800 font-bold">{formatCurrency(ADMIN_FEE)}</span>
                      </div>
                      <div className="border-t border-neutral-200/50 my-1.5"></div>
                      <div className="flex justify-between items-center text-xs font-black text-neutral-900">
                        <span>Total Pengurangan Saldo:</span>
                        <span className="text-primary">{formatCurrency(numericAmount + ADMIN_FEE)}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={resetWithdrawForm}
                      className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!isAmountValid}
                      className={cn(
                        "flex-1 py-3 font-bold text-xs rounded-full transition-all border shadow-md cursor-pointer",
                        !isAmountValid
                          ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed shadow-none"
                          : "bg-primary hover:bg-primary-600 text-white border-primary-600/10"
                      )}
                    >
                      Ajukan Withdrawal
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Confirmation Step */}
            {withdrawStep === "confirm" && (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-black text-neutral-900 leading-tight">
                    Konfirmasi Penarikan Saldo
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-bold mt-1 leading-relaxed">
                    Mohon verifikasi ulang data penerima sebelum melanjutkan pencairan.
                  </p>
                </div>

                <div className="space-y-3 bg-neutral-50 border border-neutral-200/50 rounded-2xl p-5 mb-6 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Instansi Penerima:</span>
                    <span className="font-extrabold text-neutral-800 uppercase">{getBankLabel(bankName)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Nomor Rekening/HP:</span>
                    <span className="font-mono font-bold text-neutral-800">{accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Nama Penerima:</span>
                    <span className="font-extrabold text-neutral-800 uppercase">{accountHolder}</span>
                  </div>
                  <div className="border-t border-neutral-200/60 my-2"></div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Nominal Penarikan:</span>
                    <span className="font-bold text-neutral-800">{formatCurrency(numericAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Biaya Administrasi:</span>
                    <span className="font-bold text-neutral-800">{formatCurrency(ADMIN_FEE)}</span>
                  </div>
                  <div className="border-t border-neutral-200/60 my-2"></div>
                  <div className="flex justify-between text-neutral-950 font-black">
                    <span>Total Potong Saldo:</span>
                    <span className="text-primary">{formatCurrency(numericAmount + ADMIN_FEE)}</span>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-[10px] text-red-700 font-bold leading-normal mb-6 flex gap-2">
                  <svg className="w-4.5 h-4.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Kesalahan pengisian data rekening sepenuhnya menjadi tanggung jawab kreator. Dana tidak dapat ditarik kembali jika sudah diproses bank.</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setWithdrawStep("form")}
                    className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleConfirmWithdrawal}
                    className="flex-1 py-3 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full transition-all border border-primary shadow-md cursor-pointer"
                  >
                    Konfirmasi & Tarik
                  </button>
                </div>
              </>
            )}

            {/* Success Step */}
            {withdrawStep === "success" && lastWithdrawalDetails && (
              <>
                <div className="text-center my-4 animate-in fade-in duration-500">
                  <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-500 mx-auto mb-4 shadow-sm">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-black text-neutral-900 leading-tight">
                    Pengajuan Penarikan Terkirim!
                  </h3>
                  <p className="text-xs text-neutral-400 font-bold mt-1.5 max-w-xs mx-auto leading-normal">
                    Dana sebesar <span className="text-neutral-800 font-black">{formatCurrency(lastWithdrawalDetails.amount)}</span> sedang diproses transfer oleh bank.
                  </p>
                </div>

                <div className="bg-neutral-50 border border-neutral-200/50 rounded-2xl p-5 mb-6 text-xs text-neutral-600 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-400">ID Transaksi:</span>
                    <span className="font-mono font-bold text-neutral-800">{lastWithdrawalDetails.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Tujuan:</span>
                    <span className="font-extrabold text-neutral-800 uppercase">{getBankLabel(lastWithdrawalDetails.bank)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Nomor Rekening/HP:</span>
                    <span className="font-mono font-bold text-neutral-800">{lastWithdrawalDetails.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Nama Penerima:</span>
                    <span className="font-extrabold text-neutral-800 uppercase">{lastWithdrawalDetails.holder}</span>
                  </div>
                  <div className="border-t border-neutral-200/50 my-1"></div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-neutral-400">Status Transaksi:</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 uppercase">
                      Processing
                    </span>
                  </div>
                </div>

                <button
                  onClick={resetWithdrawForm}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs rounded-full transition-all shadow-md cursor-pointer text-center"
                >
                  Selesai
                </button>
              </>
            )}

          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <h3 className="text-base font-black text-neutral-950 leading-none">
                  Detail Transaksi Wallet
                </h3>
                <p className="text-[9px] font-mono font-black text-neutral-400 mt-2 uppercase tracking-wider">
                  ID: {selectedTx.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Status and Big Amount */}
              <div className="text-center py-6 bg-neutral-50 rounded-2xl border border-neutral-200/50">
                <div className="mb-2">
                  <CreatorStatusBadge status={selectedTx.status} type="transaction" />
                </div>
                <h2 className={cn(
                  "text-2xl font-black tracking-tight",
                  selectedTx.type === "withdrawal" ? "text-red-600" : "text-green-600"
                )}>
                  {selectedTx.type === "withdrawal" ? "-" : "+"} {formatCurrency(selectedTx.amount)}
                </h2>
                <p className="text-[10px] text-neutral-400 font-extrabold uppercase mt-1">
                  Jumlah Transaksi
                </p>
              </div>

              {/* Data list */}
              <div className="space-y-3 text-xs text-neutral-600 px-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-neutral-400">Tanggal & Waktu:</span>
                  <span className="font-bold text-neutral-800">
                    {new Date(selectedTx.createdAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-semibold text-neutral-400">Sumber Transaksi:</span>
                  <span className="font-extrabold text-neutral-800 uppercase">
                    {selectedTx.source || getTransactionTypeLabel(selectedTx.type)}
                  </span>
                </div>

                {selectedTx.relatedName && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-semibold text-neutral-400 whitespace-nowrap">Nama Terkait:</span>
                    <span className="font-bold text-neutral-800 text-right">
                      {selectedTx.relatedName}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start gap-4">
                  <span className="font-semibold text-neutral-400 whitespace-nowrap">Deskripsi:</span>
                  <span className="font-medium text-neutral-700 text-right leading-relaxed">
                    {selectedTx.description}
                  </span>
                </div>

                {selectedTx.notes && (
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/50 mt-4 text-[11px] leading-relaxed text-neutral-500 font-semibold">
                    <span className="block text-[9px] font-black text-neutral-400 uppercase tracking-wide mb-1">Catatan Audit Wallet:</span>
                    {selectedTx.notes}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-4">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs rounded-full transition-all shadow-md cursor-pointer text-center"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
