import React from "react";
import { CampaignSubmissionDomain } from "../types";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatRupiah, formatDateTime, formatViews } from "@/lib/admin/formatters";
import { Eye, ExternalLink } from "lucide-react";

interface SubmissionTableProps {
  submissions: CampaignSubmissionDomain[];
  onSelectSubmission: (submission: CampaignSubmissionDomain) => void;
}

export function SubmissionTable({
  submissions,
  onSelectSubmission,
}: SubmissionTableProps) {
  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-stone-200/90 bg-[#fffdf8] shadow-xs">
      {/* Scrollable inner wrapper for wide table content on smaller screens */}
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[850px] w-full">
          <TableHeader className="bg-stone-50/90 border-b border-stone-200/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider text-stone-500 w-[22%]">
                Kreator TikTok
              </TableHead>
              <TableHead className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider text-stone-500 w-[25%]">
                Judul Campaign
              </TableHead>
              <TableHead className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider text-stone-500 w-[18%]">
                Partner UMKM
              </TableHead>
              <TableHead className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider text-stone-500 w-[13%]">
                Post Tautan
              </TableHead>
              <TableHead className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider text-stone-500 w-[12%]">
                Dikirim Pada
              </TableHead>
              <TableHead className="py-3.5 px-4 font-extrabold text-[11px] uppercase tracking-wider text-stone-500 w-[15%]">
                Status Audit
              </TableHead>
              <TableHead className="py-3.5 px-4 text-right font-extrabold text-[11px] uppercase tracking-wider text-stone-500 w-[10%]">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-orange-50/30 transition-colors border-b border-stone-100 last:border-0"
              >
                {/* Kreator */}
                <TableCell className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0c172b] font-black text-white text-xs shadow-xs">
                      {item.creator.name.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-stone-900 text-xs truncate max-w-[150px]">
                        {item.creator.name}
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono truncate max-w-[150px]">
                        {item.creator.username || item.creator.tiktokHandle || "-"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Campaign */}
                <TableCell className="py-3.5 px-4">
                  <div className="flex flex-col max-w-xs space-y-0.5">
                    <span className="font-bold text-stone-900 text-xs line-clamp-1" title={item.campaign.title}>
                      {item.campaign.title}
                    </span>
                    <span className="text-[11px] font-extrabold text-orange-700">
                      {formatRupiah(item.campaign.rewardPer1000Views)} / 1.000 views
                    </span>
                  </div>
                </TableCell>

                {/* UMKM */}
                <TableCell className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-900 text-xs truncate max-w-[130px]" title={item.umkm.name}>
                      {item.umkm.name}
                    </span>
                    <span className="text-[11px] text-stone-400 truncate max-w-[130px]">
                      {item.umkm.ownerName || "Owner"}
                    </span>
                  </div>
                </TableCell>

                {/* Platform */}
                <TableCell className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-stone-900 text-white text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider shrink-0">
                      {item.platform}
                    </span>
                    <a
                      href={item.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-orange-600 hover:underline font-mono truncate max-w-[110px]"
                      title={item.postUrl}
                    >
                      <ExternalLink className="h-3 w-3 shrink-0 text-stone-400" />
                      <span>Link TikTok</span>
                    </a>
                  </div>
                </TableCell>

                {/* Dikirim */}
                <TableCell className="py-3.5 px-4 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                  {formatDateTime(item.submittedAt)}
                </TableCell>

                {/* Status */}
                <TableCell className="py-3.5 px-4">
                  <div className="flex flex-col items-start gap-1">
                    <SubmissionStatusBadge status={item.status} />
                    {item.status === "approved" && item.verifiedViews !== undefined && (
                      <span className="text-[10px] font-mono text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 whitespace-nowrap">
                        {formatViews(item.verifiedViews)} views • {formatRupiah(item.finalReward || 0)}
                      </span>
                    )}
                    {item.status === "rejected" && item.rejectionReason && (
                      <span className="text-[10px] text-red-600 truncate max-w-[130px] italic" title={item.rejectionReason}>
                        &ldquo;{item.rejectionReason}&rdquo;
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Aksi */}
                <TableCell className="py-3.5 px-4 text-right">
                  <Button
                    size="sm"
                    variant={item.status === "pending" ? "default" : "outline"}
                    onClick={() => onSelectSubmission(item)}
                    className={`text-xs font-extrabold gap-1.5 h-9 px-3.5 rounded-xl cursor-pointer ${
                      item.status === "pending"
                        ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white hover:opacity-95 shadow-xs"
                        : "border-stone-200 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{item.status === "pending" ? "Periksa" : "Detail"}</span>
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
