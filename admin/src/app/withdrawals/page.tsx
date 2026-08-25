"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  Landmark,
  Loader2,
  RefreshCw,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  canLoadProtectedAdminData,
  useAdminAuth,
} from "@/components/admin/AdminAuthBoundary";
import { WithdrawalCard } from "@/features/admin/withdrawals/components/WithdrawalCard";
import { WithdrawalDetailDialog } from "@/features/admin/withdrawals/components/WithdrawalDetailDialog";
import { WithdrawalTable } from "@/features/admin/withdrawals/components/WithdrawalTable";
import { getAdminWithdrawals } from "@/features/admin/withdrawals/services/withdrawal.service";
import {
  AdminWithdrawal,
  AdminWithdrawalQueue,
  WithdrawalFilter,
} from "@/features/admin/withdrawals/types";
import { matchesWithdrawalFilter } from "@/features/admin/withdrawals/utils";

const FILTERS: Array<{ value: WithdrawalFilter; label: string }> = [
  { value: "operational", label: "Operasional" },
  { value: "requested", label: "Diminta" },
  { value: "processing", label: "Diproses" },
  { value: "succeeded", label: "Berhasil" },
  { value: "reversed", label: "Dikembalikan" },
  { value: "all", label: "Semua" },
];

export default function AdminWithdrawalsPage() {
  const { state } = useAdminAuth();
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [activeFilter, setActiveFilter] = useState<WithdrawalFilter>("operational");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [staleMessage, setStaleMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!canLoadProtectedAdminData(state)) return;
    setIsLoading(true);
    try {
      const queue = await getAdminWithdrawals("all");
      setWithdrawals(queue.items);
      setLoadError(null);
      setStaleMessage(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Gagal memuat antrean penarikan.");
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  useEffect(() => {
    if (canLoadProtectedAdminData(state)) void Promise.resolve().then(loadData);
  }, [loadData, state]);

  const filteredWithdrawals = useMemo(
    () => withdrawals.filter((item) => matchesWithdrawalFilter(item.status, activeFilter)),
    [activeFilter, withdrawals],
  );
  const selectedWithdrawal = selectedId
    ? withdrawals.find((item) => item.id === selectedId) || null
    : null;

  const applyAuthoritativeQueue = (queue: AdminWithdrawalQueue) => {
    setWithdrawals(queue.items);
    setLoadError(null);
    setStaleMessage(null);
  };

  const countFor = (filter: WithdrawalFilter) =>
    withdrawals.filter((item) => matchesWithdrawalFilter(item.status, filter)).length;

  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0c172b] via-[#111e38] to-[#182747] p-6 text-white shadow-xl shadow-slate-900/10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f97316]/15 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-extrabold text-orange-400">
              <Landmark className="h-3.5 w-3.5" />
              Manual Withdrawal Queue
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Penarikan Dana</h1>
            <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              Proses antrean, lakukan transfer manual di luar Marketiv, lalu catat hasil melalui trusted Function.
            </p>
          </div>
          <Button onClick={loadData} disabled={isLoading} className="h-11 self-start rounded-2xl border border-white/15 bg-white/10 px-5 text-xs font-extrabold text-white hover:bg-white/20 md:self-auto">
            <RefreshCw className={`h-4 w-4 text-orange-400 ${isLoading ? "animate-spin" : ""}`} />
            Segarkan Data
          </Button>
        </div>
      </div>

      {staleMessage && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs font-bold">{staleMessage}</p>
          </div>
          <Button variant="outline" onClick={loadData} disabled={isLoading} className="h-9 rounded-xl border-amber-300 bg-white text-xs font-extrabold text-amber-900 hover:bg-amber-100">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Muat Ulang
          </Button>
        </div>
      )}

      <Card className="rounded-2xl border-stone-200/90 bg-[#fffdf8] p-4 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                activeFilter === filter.value
                  ? "bg-[#0c172b] text-white shadow-md shadow-[#0c172b]/15"
                  : "bg-stone-100/80 text-stone-700 hover:bg-stone-200/70"
              }`}
            >
              {filter.value === "operational" && <Clock3 className="h-3.5 w-3.5 text-orange-400" />}
              {filter.value === "succeeded" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              {filter.value === "reversed" && <RotateCcw className="h-3.5 w-3.5 text-stone-500" />}
              {filter.value === "all" && <Filter className="h-3.5 w-3.5 text-stone-400" />}
              {filter.label}
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${activeFilter === filter.value ? "bg-orange-500 text-white" : "bg-white text-stone-700"}`}>
                {isLoading ? "—" : countFor(filter.value)}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {isLoading ? (
        <Card className="flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border-stone-200/90 bg-[#fffdf8] text-stone-500 shadow-xs" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-xs font-bold">Memuat antrean penarikan...</p>
        </Card>
      ) : loadError ? (
        <Card className="flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-xs" role="alert">
          <XCircle className="h-10 w-10 text-red-400" />
          <p className="text-base font-extrabold">Antrean gagal dimuat</p>
          <p className="max-w-xl text-xs text-red-600">{loadError}</p>
          <Button variant="outline" onClick={loadData} className="mt-1 h-9 rounded-xl border-red-300 bg-white text-xs font-extrabold text-red-700 hover:bg-red-100">
            <RefreshCw className="h-3.5 w-3.5" />
            Coba Lagi
          </Button>
        </Card>
      ) : filteredWithdrawals.length === 0 ? (
        <Card className="flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border-stone-200/90 bg-[#fffdf8] p-6 text-center shadow-xs">
          <Landmark className="h-10 w-10 text-stone-300" />
          <p className="text-base font-extrabold text-stone-700">Tidak ada penarikan ditemukan</p>
          <p className="text-xs text-stone-500">Belum ada data pada filter {FILTERS.find((item) => item.value === activeFilter)?.label.toLowerCase()}.</p>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <WithdrawalTable withdrawals={filteredWithdrawals} onSelect={(item) => setSelectedId(item.id)} />
          </div>
          <div className="space-y-3 md:hidden">
            {filteredWithdrawals.map((withdrawal) => (
              <WithdrawalCard key={withdrawal.id} withdrawal={withdrawal} onSelect={(item) => setSelectedId(item.id)} />
            ))}
          </div>
        </>
      )}

      {selectedWithdrawal && (
        <WithdrawalDetailDialog
          withdrawal={selectedWithdrawal}
          isOpen
          onClose={() => setSelectedId(null)}
          onAuthoritativeRefresh={applyAuthoritativeQueue}
          onStale={setStaleMessage}
        />
      )}
    </div>
  );
}
