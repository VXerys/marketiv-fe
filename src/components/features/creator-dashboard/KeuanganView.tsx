"use client";

import { useState } from "react";
import {
  Wallet,
  Clock,
  TrendingUp,
  Calendar,
  Megaphone,
  BadgeDollarSign,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  ArrowDownToLine,
  AlertTriangle,
  CheckCircle2,
  Landmark,
  ReceiptText,
  SlidersHorizontal,
} from "lucide-react";
import { CreatorMetric, CreatorTransaction } from "@/types/creator-dashboard";
import { CreatorStatusBadge } from "./CreatorStatusBadge";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { MINIMUM_WITHDRAW } from "@/types/domain";
import {
  withdrawalRequestSchema,
  PAYOUT_PROVIDERS,
  type PayoutMethod,
} from "@/lib/validations/withdrawal.schema";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import { requestWithdrawal } from "@/services/creator/creator-dashboard.service";

interface KeuanganViewProps {
  metrics: CreatorMetric;
  initialTransactions: CreatorTransaction[];
}

/* ---------------------------------- */
/* Summary card — konsisten dengan CampaignSummaryCards / NegotiationSummaryCards */
/* ---------------------------------- */
interface SummaryCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  note: string;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
}

function SummaryCard({ icon: Icon, label, value, note, iconBg, iconColor, iconBorder }: SummaryCardProps) {
  return (
    <div className="relative min-w-0 p-3.5 sm:p-4.5 border border-neutral-200/80 rounded-2xl sm:rounded-[22px] bg-gradient-to-b from-white to-neutral-50/50 shadow-3xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary-500/20 group">
      <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3.5">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[14px] grid place-items-center border shadow-3xs transition-transform duration-300 group-hover:scale-105"
          style={{ background: iconBg, borderColor: iconBorder, color: iconColor }}
        >
          <div className="block sm:hidden"><Icon size={14} /></div>
          <div className="hidden sm:block"><Icon size={18} /></div>
        </div>
      </div>
      <div className="text-[0.66rem] sm:text-[0.74rem] font-extrabold text-neutral-500 tracking-wide uppercase">
        {label}
      </div>
      <div className="font-display text-[1.2rem] sm:text-[1.35rem] lg:text-[1.5rem] font-black text-neutral-900 tracking-tight leading-none mt-1 sm:mt-1.5 break-all">
        {value}
      </div>
      <div className="text-[0.68rem] sm:text-[0.74rem] text-neutral-400 font-semibold mt-1 sm:mt-1.5 leading-none">
        {note}
      </div>
    </div>
  );
}

export function KeuanganView({ metrics, initialTransactions }: KeuanganViewProps) {
  // Fallback 0, bukan angka contoh: ini nominal uang yang dibaca kreator.
  const [walletMetrics, setWalletMetrics] = useState<CreatorMetric>({
    ...metrics,
    totalEarnings: metrics.totalEarnings ?? 0,
    thisMonthEarnings: metrics.thisMonthEarnings ?? 0,
    campaignEarnings: metrics.campaignEarnings ?? 0,
    rateCardEarnings: metrics.rateCardEarnings ?? 0,
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
  const [requestKey, setRequestKey] = useState("");
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest"); // "latest" | "oldest" | "highest" | "lowest"
  const [filterOpen, setFilterOpen] = useState(false);

  // Tidak ada biaya admin: Function request-withdrawal mendebit tepat `amount`
  // dan tidak menulis baris fee. ADMIN_FEE Rp2.500 sebelumnya karangan frontend.
  const numericAmount = Number(amount) || 0;
  const isAmountTooLow = numericAmount > 0 && numericAmount < MINIMUM_WITHDRAW;
  const isAmountTooHigh = numericAmount > 0 && numericAmount > walletMetrics.balance;
  const isAmountValid =
    numericAmount >= MINIMUM_WITHDRAW && numericAmount <= walletMetrics.balance;
  const maxWithdrawable = Math.max(0, walletMetrics.balance);

  const isWithdrawDisabled = walletMetrics.balance < MINIMUM_WITHDRAW;

  const selectedProvider = PAYOUT_PROVIDERS.find((p) => p.id === bankName);
  const isEwallet = selectedProvider?.method === "ewallet";

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAmountValid) return;
    // Kunci idempotensi dibuat SEKALI saat masuk langkah konfirmasi, sehingga
    // retry setelah error jaringan tidak menarik saldo dua kali.
    setRequestKey(crypto.randomUUID());
    setWithdrawError(null);
    setWithdrawStep("confirm");
  };

  const handleConfirmWithdrawal = async () => {
    const withdrawAmt = Number(amount);
    const method: PayoutMethod = isEwallet ? "ewallet" : "bank";

    // Pra-validasi Zod: feedback instan + satu-satunya sumber code "validation"
    // yang andal di klien.
    const parsed = parseOrErrors(withdrawalRequestSchema(walletMetrics.balance), {
      amount: withdrawAmt,
      payoutMethod: method,
      providerName: selectedProvider?.label ?? bankName,
      accountNumber,
      accountName: accountHolder,
    });
    if (!parsed.ok) {
      setWithdrawError(Object.values(parsed.errors)[0] ?? "Periksa kembali data penarikan.");
      return;
    }

    setWithdrawError(null);
    setIsSubmittingWithdraw(true);
    const res = await requestWithdrawal({ ...parsed.data, requestKey });
    setIsSubmittingWithdraw(false);

    if (!res.success || !res.data) {
      setWithdrawError(
        res.code === "auth"
          ? "Sesi berakhir, silakan login kembali."
          : res.error ?? "Gagal memproses penarikan."
      );
      return;
    }

    const receipt = res.data;

    // Withdrawal langsung `processed` (ADR-008) — hanya balance yang turun,
    // pendingPayouts TIDAK bertambah karena ini bukan payout tertunda.
    setWalletMetrics((prev) => ({
      ...prev,
      balance: receipt.balanceAfter,
    }));

    const providerLabel = selectedProvider?.label ?? bankName;
    const newTx: CreatorTransaction = {
      id: receipt.transactionId ?? receipt.withdrawalId,
      type: "withdrawal",
      amount: withdrawAmt,
      // Nilai yang benar-benar ditulis Function ke transactions.status.
      status: "completed",
      description: `Penarikan saldo wallet ke ${providerLabel} (${accountNumber})`,
      createdAt: receipt.processedAt,
      source: "Withdrawal",
      notes: `Dana diteruskan ke ${providerLabel} (${accountNumber}).`
    };

    setTransactions([newTx, ...transactions]);

    setLastWithdrawalDetails({
      id: receipt.withdrawalId,
      bank: bankName,
      number: accountNumber,
      holder: accountHolder,
      amount: withdrawAmt,
      fee: 0,
      total: withdrawAmt,
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
    setWithdrawError(null);
    setRequestKey("");
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

  const getBankLabel = (code: string) =>
    PAYOUT_PROVIDERS.find((p) => p.id === code)?.label ?? code.toUpperCase();

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
      <div className="max-w-[1280px] mx-auto space-y-6">

        {/* Header — konsisten dengan gaya Campaign/Negosiasi */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 text-orange-600 text-[.74rem] font-[900] tracking-[.12em] uppercase mb-1.5">
              <span className="block w-[18px] h-0.5 rounded-full bg-orange-500" />
              Keuangan Kreator
            </div>
            <h2 className="font-display text-[clamp(1.5rem,2.8vw,2.1rem)] font-bold tracking-[-0.065em] text-ink-950 m-0 mb-1.5 leading-none">
              Keuangan &amp; Dompet
            </h2>
            <p className="text-ink-500 text-[.88rem] m-0 max-w-xl">
              Pantau seluruh saldo, riwayat pencairan, pendapatan campaign, dan transaksi escrow Rate Card Anda.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
            <button
              onClick={() => {
                setIsWithdrawOpen(true);
                setWithdrawStep("form");
              }}
              disabled={isWithdrawDisabled}
              className={cn(
                "inline-flex items-center gap-2 min-h-[46px] px-[22px] rounded-xl font-[800] text-[.9rem] tracking-[-0.012em] transition-all duration-200 cursor-pointer whitespace-nowrap",
                isWithdrawDisabled
                  ? "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                  : "border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white shadow-[0_14px_34px_rgba(234,88,12,.22),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_18px_40px_rgba(234,88,12,.30)] hover:-translate-y-px"
              )}
            >
              <ArrowDownToLine size={17} />
              Ajukan Withdrawal
            </button>
          </div>
        </div>

            {/* ===== Metrics Grid: 2 cols mobile → 3 cols sm+ ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <>
                  {/* Saldo Tersedia — hero card, full width on mobile */}
                  <div className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-2xl sm:rounded-[22px] border border-orange-900/20 bg-gradient-to-br from-[#fb7a18] to-primary-600 p-5 sm:p-6 text-white shadow-[0_14px_34px_rgba(234,88,12,.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(234,88,12,.30)] group">
                    <div
                      className="absolute inset-0 pointer-events-none opacity-70"
                      style={{
                        background:
                          "radial-gradient(circle at 85% 15%, rgba(255,255,255,.22) 0 22%, transparent 23%)," +
                          "radial-gradient(circle at 100% 65%, rgba(255,255,255,.12) 0 30%, transparent 31%)",
                      }}
                    />
                    <div className="relative">
                      <div className="flex items-center justify-between gap-3 mb-3.5">
                        <div className="w-10 h-10 rounded-[14px] grid place-items-center bg-white/15 border border-white/20 shadow-3xs transition-transform duration-300 group-hover:scale-105">
                          <Wallet size={18} />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-[.68rem] font-extrabold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0" />
                          Siap Ditarik
                        </span>
                      </div>
                      <div className="text-[.74rem] font-extrabold text-white/70 tracking-wide uppercase">
                        Saldo Tersedia
                      </div>
                      <div className="font-display text-[1.55rem] sm:text-[1.75rem] font-black tracking-tight leading-none mt-1.5 break-all">
                        {formatCurrency(walletMetrics.balance)}
                      </div>
                      <div className="text-[.72rem] text-white/70 font-semibold mt-2 leading-none">
                        Min. penarikan {formatCurrency(MINIMUM_WITHDRAW)} &bull; Tanpa biaya admin
                      </div>
                    </div>
                  </div>

                  <SummaryCard
                    icon={Clock}
                    label="Pending Payout"
                    value={formatCurrency(walletMetrics.pendingPayouts)}
                    note="Menunggu audit/validasi views"
                    iconBg="#fffbeb"
                    iconColor="#d97706"
                    iconBorder="rgba(217,119,6,.18)"
                  />
                  <SummaryCard
                    icon={TrendingUp}
                    label="Total Pendapatan"
                    value={formatCurrency(walletMetrics.totalEarnings || 0)}
                    note="Akumulasi seluruh pendapatan"
                    iconBg="#f1fbf5"
                    iconColor="#16a34a"
                    iconBorder="rgba(22,163,74,.18)"
                  />
                  <SummaryCard
                    icon={Calendar}
                    label="Pendapatan Bulan Ini"
                    value={formatCurrency(walletMetrics.thisMonthEarnings || 0)}
                    note="Bulan berjalan"
                    iconBg="#f0f6ff"
                    iconColor="#2563eb"
                    iconBorder="rgba(37,99,235,.18)"
                  />
                  <SummaryCard
                    icon={Megaphone}
                    label="Pendapatan Campaign"
                    value={formatCurrency(walletMetrics.campaignEarnings || 0)}
                    note="Dari marketing pay-per-view"
                    iconBg="#fff7ed"
                    iconColor="#ea580c"
                    iconBorder="rgba(234,88,12,.18)"
                  />
                  <SummaryCard
                    icon={BadgeDollarSign}
                    label="Pendapatan Rate Card"
                    value={formatCurrency(walletMetrics.rateCardEarnings || 0)}
                    note="Dari negosiasi premium"
                    iconBg="#f7f3ff"
                    iconColor="#7c3aed"
                    iconBorder="rgba(124,58,237,.18)"
                  />
                </>
            </div>

            {/* ===== Ledger Workspace ===== */}
            <div className="bg-white border border-neutral-200/80 shadow-3xs rounded-2xl sm:rounded-[22px] p-4 sm:p-6">
              {/* Header + Toolbar */}
              <div className="flex flex-col gap-4 border-b border-neutral-100 pb-5 mb-5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-lg grid place-items-center bg-neutral-50 border border-neutral-200/60 text-neutral-500">
                    <ReceiptText size={15} />
                  </div>
                  <h3 className="font-display font-black text-neutral-900 text-[.95rem] tracking-tight">
                    Riwayat Transaksi Wallet
                  </h3>
                  <span className="inline-flex items-center justify-center min-w-[22px] h-[20px] rounded-full bg-neutral-100 text-neutral-500 text-[10px] font-extrabold px-1.5">
                    {processedTransactions.length}
                  </span>
                </div>

                {/* Toolbar filters */}
                <div className="flex flex-col gap-2.5">
                  {/* Row 1: Search + mobile filter toggle */}
                  <div className="flex gap-2.5 items-center">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="Cari ID, deskripsi, atau campaign..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-3xs disabled:opacity-50"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                          aria-label="Hapus pencarian"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    {/* Mobile filter toggle */}
                    <button
                      onClick={() => setFilterOpen((o) => !o)}
                      className={`md:hidden shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                        filterOpen || isFilterActive
                          ? "bg-primary-50 text-primary-600 border-primary-200"
                          : "bg-white text-neutral-600 border-neutral-200"
                      }`}
                    >
                      <SlidersHorizontal size={14} />
                      Filter
                      {isFilterActive && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />}
                    </button>
                  </div>

                  {/* Row 2: Filter selects — always on md+, collapsible on mobile */}
                  <div className={`items-center gap-2 flex-wrap ${filterOpen ? "flex" : "hidden md:flex"}`}>
                    <div className="relative">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="appearance-none bg-white border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer shadow-3xs disabled:opacity-50"
                      >
                        <option value="all">Semua Sumber</option>
                        <option value="campaign">Campaign</option>
                        <option value="rate card">Rate Card</option>
                        <option value="withdrawal">Withdrawal</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                    </div>

                    <div className="relative">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none bg-white border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer shadow-3xs disabled:opacity-50"
                      >
                        <option value="all">Semua Status</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="failed">Failed</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                    </div>

                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-white border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer shadow-3xs disabled:opacity-50"
                      >
                        <option value="latest">Terbaru</option>
                        <option value="oldest">Terlama</option>
                        <option value="highest">Jumlah Terbesar</option>
                        <option value="lowest">Jumlah Terkecil</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                    </div>

                    {isFilterActive && (
                      <button
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-3xs"
                      >
                        <X size={12} /> Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Ledger Table */}
              {processedTransactions.length === 0 ? (
                <CreatorEmptyState
                  title={isFilterActive ? "Transaksi tidak ditemukan" : "Buku Besar Kosong"}
                  description={
                    isFilterActive
                      ? "Tidak ada catatan transaksi wallet yang memenuhi kriteria filter Anda."
                      : "Anda belum melakukan transaksi keuangan apapun di platform Marketiv."
                  }
                  actionButton={
                    isFilterActive ? (
                      <button
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-3xs"
                      >
                        <X size={12} /> Bersihkan Filter
                      </button>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[768px] text-left border-collapse text-xs font-semibold text-neutral-600">
                      <thead>
                        <tr className="border-b border-neutral-200 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                          <th className="pb-3 pr-4">ID Transaksi</th>
                          <th className="pb-3 pr-4">Tanggal</th>
                          <th className="pb-3 pr-4">Sumber</th>
                          <th className="pb-3 pr-4">Deskripsi</th>
                          <th className="pb-3 pr-4">Status</th>
                          <th className="pb-3 pr-4 text-right">Jumlah</th>
                          <th className="pb-3 w-6" aria-hidden="true"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {processedTransactions.map((tx) => {
                          const isNegative = tx.type === "withdrawal";
                          return (
                            <tr
                              key={tx.id}
                              onClick={() => setSelectedTx(tx)}
                              className="hover:bg-orange-50/30 cursor-pointer transition-colors group"
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
                                  "py-4 pr-4 text-right font-black text-sm tracking-tight whitespace-nowrap",
                                  isNegative ? "text-red-600" : "text-emerald-600"
                                )}
                              >
                                {isNegative ? "−" : "+"} {formatCurrency(tx.amount)}
                              </td>
                              <td className="py-4 text-neutral-300 group-hover:text-primary transition-colors">
                                <ChevronRight size={14} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table footer info */}
                  <div className="flex items-center justify-between gap-3 pt-4 mt-1 border-t border-neutral-100">
                    <span className="text-[11px] font-bold text-neutral-400">
                      Menampilkan {processedTransactions.length} dari {transactions.length} transaksi
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-400 hidden sm:inline">
                      Klik baris untuk melihat rincian transaksi
                    </span>
                  </div>
                </>
              )}
            </div>

        {/* Withdrawal Simulation Dual-Modal (Form -> Confirm -> Success) */}
        {isWithdrawOpen && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[26px] border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300 relative max-h-[90vh] overflow-y-auto">

              {/* Form Step */}
              {withdrawStep === "form" && (
                <>
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-[14px] grid place-items-center bg-orange-50 border border-orange-200/60 text-orange-600 shrink-0">
                        <ArrowDownToLine size={18} />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-black text-neutral-950 leading-tight tracking-tight">
                          Tarik Saldo Wallet
                        </h3>
                        <p className="text-[10px] text-neutral-400 font-extrabold mt-1 uppercase tracking-wider">
                          Saldo Tersedia: {formatCurrency(walletMetrics.balance)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={resetWithdrawForm}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                      aria-label="Tutup"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                    {/* Destination Dropdown */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">
                        Tujuan Penarikan
                      </label>
                      <div className="relative">
                        <select
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full appearance-none pl-4 pr-9 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-3xs"
                        >
                          {PAYOUT_PROVIDERS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                      </div>
                    </div>

                    {/* Account Number or HP */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">
                        {isEwallet ? "Nomor HP E-Wallet" : "Nomor Rekening"}
                      </label>
                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        placeholder={isEwallet ? "Contoh: 0812xxxxxxxx" : "Masukkan nomor rekening..."}
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-semibold text-neutral-800 placeholder:text-neutral-400 shadow-3xs"
                      />
                    </div>

                    {/* Account Holder Name */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">
                        Nama Pemilik Rekening / Akun
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama lengkap pemilik..."
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-semibold text-neutral-800 placeholder:text-neutral-400 shadow-3xs"
                      />
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">
                        Jumlah Penarikan
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-xs font-extrabold text-neutral-400">
                          Rp
                        </span>
                        <input
                          type="number"
                          required
                          placeholder="Nominal penarikan..."
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-semibold text-neutral-800 placeholder:text-neutral-400 shadow-3xs"
                        />
                      </div>

                      {/* Quick amount chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[100000, 250000, 500000].map((quick) => (
                          <button
                            key={quick}
                            type="button"
                            disabled={quick > walletMetrics.balance}
                            onClick={() => setAmount(String(quick))}
                            className={cn(
                              "px-2.5 py-1 rounded-full border text-[10px] font-extrabold transition-all cursor-pointer",
                              quick > walletMetrics.balance
                                ? "bg-neutral-50 border-neutral-200/60 text-neutral-300 cursor-not-allowed"
                                : Number(amount) === quick
                                  ? "bg-primary-50 border-primary-500/30 text-primary-600 shadow-3xs"
                                  : "bg-white border-neutral-200/80 text-neutral-500 hover:border-primary-300 hover:text-primary-600"
                            )}
                          >
                            {formatCurrency(quick)}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={maxWithdrawable < MINIMUM_WITHDRAW}
                          onClick={() => setAmount(String(maxWithdrawable))}
                          className={cn(
                            "px-2.5 py-1 rounded-full border text-[10px] font-extrabold transition-all cursor-pointer",
                            maxWithdrawable < MINIMUM_WITHDRAW
                              ? "bg-neutral-50 border-neutral-200/60 text-neutral-300 cursor-not-allowed"
                              : Number(amount) === maxWithdrawable
                                ? "bg-primary-50 border-primary-500/30 text-primary-600 shadow-3xs"
                                : "bg-white border-neutral-200/80 text-neutral-500 hover:border-primary-300 hover:text-primary-600"
                          )}
                        >
                          Tarik Semua
                        </button>
                      </div>

                      {/* Inline warnings */}
                      {isAmountTooLow && (
                        <span className="flex items-center gap-1.5 text-[10px] text-red-600 font-bold mt-1">
                          <AlertTriangle size={12} className="shrink-0" />
                          Batas minimum penarikan adalah {formatCurrency(MINIMUM_WITHDRAW)}
                        </span>
                      )}
                      {isAmountTooHigh && (
                        <span className="flex items-center gap-1.5 text-[10px] text-red-600 font-bold mt-1">
                          <AlertTriangle size={12} className="shrink-0" />
                          Nominal melebihi saldo yang tersedia
                        </span>
                      )}
                      {!isAmountTooLow && !isAmountTooHigh && (
                        <span className="block text-[10px] text-neutral-400 font-semibold mt-1">
                          Batas minimum penarikan {formatCurrency(MINIMUM_WITHDRAW)}. Tidak ada biaya admin.
                        </span>
                      )}
                    </div>

                    {/* Live Fee Breakdown Summary */}
                    {numericAmount > 0 && (
                      <div className="p-4 bg-gradient-to-b from-neutral-50 to-white border border-neutral-200/60 rounded-2xl space-y-2 mt-4">
                        <div className="flex justify-between items-center text-xs text-neutral-500 font-semibold">
                          <span>Nominal Penarikan</span>
                          <span className="text-neutral-800 font-bold">{formatCurrency(numericAmount)}</span>
                        </div>
                        <div className="border-t border-dashed border-neutral-200 my-1.5"></div>
                        <div className="flex justify-between items-center text-xs font-black text-neutral-900">
                          <span>Total Pengurangan Saldo</span>
                          <span className="font-display text-sm text-primary tracking-tight">{formatCurrency(numericAmount)}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={resetWithdrawForm}
                        className="flex-1 min-h-[44px] border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={!isAmountValid}
                        className={cn(
                          "flex-1 min-h-[44px] font-[800] text-xs rounded-xl transition-all duration-200 cursor-pointer",
                          !isAmountValid
                            ? "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                            : "border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white shadow-[0_10px_24px_rgba(234,88,12,.22)] hover:shadow-[0_14px_30px_rgba(234,88,12,.30)] hover:-translate-y-px"
                        )}
                      >
                        Lanjutkan
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Confirmation Step */}
              {withdrawStep === "confirm" && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 grid place-items-center text-amber-500 mx-auto mb-4">
                      <AlertTriangle size={26} />
                    </div>
                    <h3 className="font-display text-base font-black text-neutral-900 leading-tight tracking-tight">
                      Konfirmasi Penarikan Saldo
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-bold mt-1.5 leading-relaxed">
                      Mohon verifikasi ulang data penerima sebelum melanjutkan pencairan.
                    </p>
                  </div>

                  <div className="space-y-3 bg-gradient-to-b from-neutral-50 to-white border border-neutral-200/60 rounded-2xl p-5 mb-5 text-xs text-neutral-600">
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-semibold text-neutral-400 inline-flex items-center gap-1.5">
                        <Landmark size={12} className="shrink-0" /> Instansi Penerima
                      </span>
                      <span className="font-extrabold text-neutral-800 uppercase">{getBankLabel(bankName)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-semibold text-neutral-400">Nomor Rekening/HP</span>
                      <span className="font-mono font-bold text-neutral-800">{accountNumber}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-semibold text-neutral-400">Nama Penerima</span>
                      <span className="font-extrabold text-neutral-800 uppercase">{accountHolder}</span>
                    </div>
                    <div className="border-t border-dashed border-neutral-200 my-2"></div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-semibold text-neutral-400">Nominal Penarikan</span>
                      <span className="font-bold text-neutral-800">{formatCurrency(numericAmount)}</span>
                    </div>
                    <div className="border-t border-dashed border-neutral-200 my-2"></div>
                    <div className="flex justify-between items-center gap-4 text-neutral-950 font-black">
                      <span>Total Potong Saldo</span>
                      <span className="font-display text-sm text-primary tracking-tight">{formatCurrency(numericAmount)}</span>
                    </div>
                  </div>

                  <div className="bg-red-50/70 border border-red-200/60 rounded-2xl p-4 text-[10px] text-red-700 font-bold leading-relaxed mb-6 flex gap-2.5">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <span>Kesalahan pengisian data rekening sepenuhnya menjadi tanggung jawab kreator. Dana tidak dapat ditarik kembali jika sudah diproses bank.</span>
                  </div>

                  {withdrawError && (
                    <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 text-[11px] font-bold text-red-700">
                      {withdrawError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setWithdrawStep("form")}
                      disabled={isSubmittingWithdraw}
                      className="flex-1 min-h-[44px] border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={handleConfirmWithdrawal}
                      disabled={isSubmittingWithdraw}
                      className="flex-1 min-h-[44px] border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white font-[800] text-xs rounded-xl transition-all duration-200 shadow-[0_10px_24px_rgba(234,88,12,.22)] hover:shadow-[0_14px_30px_rgba(234,88,12,.30)] hover:-translate-y-px cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                    >
                      {isSubmittingWithdraw ? "Memproses…" : "Konfirmasi & Tarik"}
                    </button>
                  </div>
                </>
              )}

              {/* Success Step */}
              {withdrawStep === "success" && lastWithdrawalDetails && (
                <>
                  <div className="text-center my-4 animate-in fade-in duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/60 grid place-items-center text-emerald-500 mx-auto mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="font-display text-base font-black text-neutral-900 leading-tight tracking-tight">
                      Pengajuan Penarikan Terkirim!
                    </h3>
                    <p className="text-xs text-neutral-400 font-bold mt-1.5 max-w-xs mx-auto leading-relaxed">
                      Dana sebesar <span className="text-neutral-800 font-black">{formatCurrency(lastWithdrawalDetails.amount)}</span> sedang diproses transfer oleh bank.
                    </p>
                  </div>

                  <div className="bg-gradient-to-b from-neutral-50 to-white border border-neutral-200/60 rounded-2xl p-5 mb-6 text-xs text-neutral-600 space-y-2.5">
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-semibold text-neutral-400">ID Transaksi</span>
                      <span className="font-mono font-bold text-neutral-800">{lastWithdrawalDetails.id}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-semibold text-neutral-400">Tujuan</span>
                      <span className="font-extrabold text-neutral-800 uppercase">{getBankLabel(lastWithdrawalDetails.bank)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-semibold text-neutral-400">Nomor Rekening/HP</span>
                      <span className="font-mono font-bold text-neutral-800">{lastWithdrawalDetails.number}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-semibold text-neutral-400">Nama Penerima</span>
                      <span className="font-extrabold text-neutral-800 uppercase">{lastWithdrawalDetails.holder}</span>
                    </div>
                    <div className="border-t border-dashed border-neutral-200 my-1"></div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-semibold text-neutral-400">Status Transaksi</span>
                      {/* ADR-008: withdrawal langsung processed, tanpa review admin —
                          UI tidak boleh menyiratkan queue yang tidak ada. */}
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Selesai
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={resetWithdrawForm}
                    className="w-full min-h-[44px] bg-ink-950 hover:bg-primary text-white font-[800] text-xs rounded-xl transition-all duration-200 shadow-md hover:shadow-[0_10px_24px_rgba(234,88,12,.22)] hover:-translate-y-px cursor-pointer text-center"
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
            <div className="bg-white rounded-[26px] border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start gap-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[14px] grid place-items-center bg-neutral-50 border border-neutral-200/60 text-neutral-500 shrink-0">
                    <ReceiptText size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-black text-neutral-950 leading-tight tracking-tight">
                      Detail Transaksi Wallet
                    </h3>
                    <p className="text-[9px] font-mono font-black text-neutral-400 mt-1.5 uppercase tracking-wider">
                      ID: {selectedTx.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status and Big Amount */}
                <div className="text-center py-6 bg-gradient-to-b from-neutral-50 to-white rounded-2xl border border-neutral-200/60">
                  <div className="mb-2.5">
                    <CreatorStatusBadge status={selectedTx.status} type="transaction" />
                  </div>
                  <h2 className={cn(
                    "font-display text-2xl font-black tracking-tight",
                    selectedTx.type === "withdrawal" ? "text-red-600" : "text-emerald-600"
                  )}>
                    {selectedTx.type === "withdrawal" ? "−" : "+"} {formatCurrency(selectedTx.amount)}
                  </h2>
                  <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider mt-1">
                    Jumlah Transaksi
                  </p>
                </div>

                {/* Data list */}
                <div className="space-y-3 text-xs text-neutral-600 px-1">
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-semibold text-neutral-400 whitespace-nowrap">Tanggal &amp; Waktu</span>
                    <span className="font-bold text-neutral-800 text-right">
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

                  <div className="flex justify-between items-center gap-4">
                    <span className="font-semibold text-neutral-400">Sumber Transaksi</span>
                    <span className="font-extrabold text-neutral-800 uppercase">
                      {selectedTx.source || getTransactionTypeLabel(selectedTx.type)}
                    </span>
                  </div>

                  {selectedTx.relatedName && (
                    <div className="flex justify-between items-start gap-4">
                      <span className="font-semibold text-neutral-400 whitespace-nowrap">Nama Terkait</span>
                      <span className="font-bold text-neutral-800 text-right">
                        {selectedTx.relatedName}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-start gap-4">
                    <span className="font-semibold text-neutral-400 whitespace-nowrap">Deskripsi</span>
                    <span className="font-medium text-neutral-700 text-right leading-relaxed">
                      {selectedTx.description}
                    </span>
                  </div>

                  {selectedTx.notes && (
                    <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/50 mt-4 text-[11px] leading-relaxed text-neutral-500 font-semibold">
                      <span className="block text-[9px] font-black text-amber-600/80 uppercase tracking-wide mb-1">Catatan Audit Wallet</span>
                      {selectedTx.notes}
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="pt-4">
                  <button
                    onClick={() => setSelectedTx(null)}
                    className="w-full min-h-[44px] bg-ink-950 hover:bg-primary text-white font-[800] text-xs rounded-xl transition-all duration-200 shadow-md hover:shadow-[0_10px_24px_rgba(234,88,12,.22)] hover:-translate-y-px cursor-pointer text-center"
                  >
                    Tutup Rincian
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
