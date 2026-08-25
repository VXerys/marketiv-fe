import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime, formatRupiah } from "@/lib/admin/formatters";
import { AdminWithdrawal } from "../types";
import { maskAccountNumber } from "../utils";
import { WithdrawalStatusBadge } from "./WithdrawalStatusBadge";

interface WithdrawalCardProps {
  withdrawal: AdminWithdrawal;
  onSelect: (withdrawal: AdminWithdrawal) => void;
}

export function WithdrawalCard({ withdrawal, onSelect }: WithdrawalCardProps) {
  return (
    <Card className="space-y-3 rounded-2xl border-stone-200/90 bg-[#fffdf8] p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold text-stone-900">{withdrawal.creator.name}</p>
          <p className="truncate font-mono text-[11px] text-stone-500">{withdrawal.creator.username || withdrawal.userId}</p>
        </div>
        <WithdrawalStatusBadge status={withdrawal.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-stone-200/70 bg-stone-50/80 p-3 text-xs">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Nominal</p>
          <p className="mt-1 font-extrabold text-stone-900">{formatRupiah(withdrawal.amount)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Tujuan</p>
          <p className="mt-1 truncate font-bold text-stone-900">{withdrawal.providerName}</p>
          <p className="font-mono text-[11px] text-stone-500">{maskAccountNumber(withdrawal.accountNumber)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] text-stone-400" title={withdrawal.id}>{withdrawal.id}</p>
          <p className="text-[11px] text-stone-500">{formatDateTime(withdrawal.requestedAt || "")}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => onSelect(withdrawal)} className="h-11 rounded-xl border-stone-200 px-3.5 text-xs font-extrabold">
          <Eye className="h-3.5 w-3.5" />
          Detail
        </Button>
      </div>
    </Card>
  );
}
