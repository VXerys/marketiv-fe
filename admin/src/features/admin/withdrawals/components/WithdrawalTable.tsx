import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatRupiah } from "@/lib/admin/formatters";
import { AdminWithdrawal } from "../types";
import { maskAccountNumber } from "../utils";
import { WithdrawalStatusBadge } from "./WithdrawalStatusBadge";

interface WithdrawalTableProps {
  withdrawals: AdminWithdrawal[];
  onSelect: (withdrawal: AdminWithdrawal) => void;
}

export function WithdrawalTable({ withdrawals, onSelect }: WithdrawalTableProps) {
  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-stone-200/90 bg-[#fffdf8] shadow-xs">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[980px] w-full">
          <TableHeader className="border-b border-stone-200/80 bg-stone-50/90">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">ID</TableHead>
              <TableHead className="px-4 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">Kreator</TableHead>
              <TableHead className="px-4 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">Nominal</TableHead>
              <TableHead className="px-4 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">Tujuan</TableHead>
              <TableHead className="px-4 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">Rekening</TableHead>
              <TableHead className="px-4 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">Diminta</TableHead>
              <TableHead className="px-4 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">Status</TableHead>
              <TableHead className="px-4 py-3.5 text-right text-[11px] font-extrabold uppercase tracking-wider text-stone-500">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id} className="border-b border-stone-100 hover:bg-orange-50/30">
                <TableCell className="max-w-[130px] truncate px-4 py-3.5 font-mono text-[11px] text-stone-600" title={withdrawal.id}>
                  {withdrawal.id}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <p className="max-w-[160px] truncate text-xs font-extrabold text-stone-900">{withdrawal.creator.name}</p>
                  <p className="max-w-[160px] truncate font-mono text-[11px] text-stone-500">{withdrawal.creator.username || withdrawal.userId}</p>
                </TableCell>
                <TableCell className="px-4 py-3.5 whitespace-nowrap text-xs font-extrabold text-stone-900">{formatRupiah(withdrawal.amount)}</TableCell>
                <TableCell className="px-4 py-3.5">
                  <p className="text-xs font-bold text-stone-900">{withdrawal.providerName}</p>
                  <p className="text-[11px] text-stone-500">{withdrawal.payoutMethod}</p>
                </TableCell>
                <TableCell className="px-4 py-3.5 font-mono text-xs font-bold text-stone-700">
                  {maskAccountNumber(withdrawal.accountNumber)}
                </TableCell>
                <TableCell className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-stone-500">
                  {formatDateTime(withdrawal.requestedAt || "")}
                </TableCell>
                <TableCell className="px-4 py-3.5"><WithdrawalStatusBadge status={withdrawal.status} /></TableCell>
                <TableCell className="px-4 py-3.5 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelect(withdrawal)}
                    className="h-9 rounded-xl border-stone-200 px-3.5 text-xs font-extrabold text-stone-700 hover:bg-stone-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
