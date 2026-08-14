import React from "react";
import { CampaignSubmissionDomain } from "../types";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRupiah, formatDateTime, formatViews } from "@/lib/admin/formatters";
import { Eye, ExternalLink, Store, Megaphone } from "lucide-react";

interface SubmissionCardProps {
  item: CampaignSubmissionDomain;
  onSelectSubmission: (submission: CampaignSubmissionDomain) => void;
}

export function SubmissionCard({
  item,
  onSelectSubmission,
}: SubmissionCardProps) {
  return (
    <Card className="p-4 bg-[#fffdf8] space-y-3.5 border-stone-200/90 shadow-xs rounded-2xl">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0c172b] text-xs font-black text-white shadow-2xs">
            {item.creator.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-stone-900 text-xs truncate">{item.creator.name}</p>
            <p className="text-[11px] text-stone-500 font-mono truncate">
              {item.creator.username || item.creator.tiktokHandle}
            </p>
          </div>
        </div>
        <SubmissionStatusBadge status={item.status} />
      </div>

      {/* Campaign Details Box */}
      <div className="space-y-1.5 rounded-xl bg-stone-50/90 p-3 text-xs border border-stone-200/60">
        <div className="flex items-center justify-between text-stone-500 text-[11px]">
          <span className="flex items-center gap-1 font-bold text-stone-700">
            <Megaphone className="h-3.5 w-3.5 text-[#f97316]" />
            Campaign
          </span>
          <span className="font-extrabold text-orange-700">
            {formatRupiah(item.campaign.rewardPer1000Views)} / 1k views
          </span>
        </div>
        <p className="font-extrabold text-stone-900 leading-snug">{item.campaign.title}</p>
        <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[11px] text-stone-500">
          <div className="flex items-center gap-1">
            <Store className="h-3 w-3 text-stone-400" />
            <span className="font-medium truncate max-w-[150px]">UMKM: {item.umkm.name}</span>
          </div>
          <a
            href={item.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#f97316] hover:underline font-mono font-bold"
          >
            <span>TikTok Link</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[11px] text-stone-400 font-mono">
          {formatDateTime(item.submittedAt)}
        </span>
        <Button
          size="sm"
          variant={item.status === "pending" ? "default" : "outline"}
          onClick={() => onSelectSubmission(item)}
          className={`text-xs font-extrabold gap-1.5 h-9 px-4 rounded-xl cursor-pointer ${
            item.status === "pending"
              ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white hover:opacity-95 shadow-xs"
              : "border-stone-200 text-stone-700 hover:bg-stone-100"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{item.status === "pending" ? "Periksa" : "Detail"}</span>
        </Button>
      </div>
    </Card>
  );
}
