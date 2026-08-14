"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Trash2,
  User,
  Megaphone,
  Store,
  DollarSign,
  BellRing,
} from "lucide-react";
import { formatRupiah } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

export interface AdminNotification {
  id: string;
  title: string;
  desc: string;
  fullContent: string;
  category: "submission" | "reward" | "campaign" | "system" | "security";
  time: string;
  timestamp: string;
  unread: boolean;
  link?: string;
  metadata?: {
    submissionId?: string;
    creatorName?: string;
    creatorUsername?: string;
    brandName?: string;
    amount?: number;
  };
}

interface NotificationDetailDialogProps {
  notification: AdminNotification | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onActionClick: (link?: string) => void;
}

export function NotificationDetailDialog({
  notification,
  isOpen,
  onClose,
  onDelete,
  onActionClick,
}: NotificationDetailDialogProps) {
  if (!notification) return null;

  const getCategoryConfig = (category: AdminNotification["category"]) => {
    switch (category) {
      case "submission":
        return {
          label: "Submission Baru",
          badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
          icon: Clock,
          iconColor: "text-orange-500",
        };
      case "reward":
        return {
          label: "Reward & Balance",
          badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: CheckCircle2,
          iconColor: "text-emerald-500",
        };
      case "campaign":
        return {
          label: "Status Campaign",
          badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Megaphone,
          iconColor: "text-blue-500",
        };
      case "security":
        return {
          label: "Peringatan Keamanan",
          badgeClass: "bg-red-100 text-red-800 border-red-200",
          icon: AlertTriangle,
          iconColor: "text-red-500",
        };
      default:
        return {
          label: "Sistem Ops",
          badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
          icon: Sparkles,
          iconColor: "text-purple-500",
        };
    }
  };

  const config = getCategoryConfig(notification.category);
  const CategoryIcon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-5 sm:p-6 bg-[#fffdf8] border-stone-200/90 rounded-2xl shadow-2xl">
        <DialogHeader className="pr-8 space-y-2 border-b border-stone-200/70 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border", config.badgeClass)}>
              <CategoryIcon className={`h-3 w-3 ${config.iconColor}`} />
              <span>{config.label}</span>
            </div>
            <span className="text-[11px] font-mono text-stone-400">
              {notification.time}
            </span>
          </div>

          <DialogTitle className="text-base sm:text-lg font-black text-[#0c172b] tracking-tight">
            {notification.title}
          </DialogTitle>
        </DialogHeader>

        {/* Modal Body */}
        <div className="space-y-4 py-3 text-xs">
          {/* Main Description Card */}
          <div className="rounded-xl border border-stone-200/80 bg-white p-4 space-y-2 shadow-2xs">
            <p className="text-stone-700 text-xs leading-relaxed">
              {notification.fullContent}
            </p>
          </div>

          {/* Metadata Grid (if exists) */}
          {notification.metadata && (
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-3.5 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                Metadata Notifikasi Operasional
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {notification.metadata.submissionId && (
                  <div className="space-y-0.5">
                    <span className="text-stone-500 font-medium text-[11px]">Submission ID:</span>
                    <p className="font-mono font-bold text-stone-900">{notification.metadata.submissionId}</p>
                  </div>
                )}
                {notification.metadata.creatorName && (
                  <div className="space-y-0.5">
                    <span className="text-stone-500 font-medium text-[11px]">Content Creator:</span>
                    <p className="font-bold text-stone-900">{notification.metadata.creatorName}</p>
                  </div>
                )}
                {notification.metadata.brandName && (
                  <div className="space-y-0.5">
                    <span className="text-stone-500 font-medium text-[11px]">Brand UMKM:</span>
                    <p className="font-bold text-stone-900">{notification.metadata.brandName}</p>
                  </div>
                )}
                {notification.metadata.amount !== undefined && (
                  <div className="space-y-0.5">
                    <span className="text-stone-500 font-medium text-[11px]">Nilai Reward:</span>
                    <p className="font-bold text-emerald-600 font-mono text-sm">
                      {formatRupiah(notification.metadata.amount)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-stone-200/80">
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onDelete(notification.id);
              onClose();
            }}
            className="w-full sm:w-auto h-9 text-xs font-bold gap-1.5 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus Notifikasi</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto h-9 text-xs font-bold border-stone-200 text-stone-700 hover:bg-stone-100"
            >
              Tutup
            </Button>

            {notification.link && (
              <Button
                type="button"
                onClick={() => {
                  onActionClick(notification.link);
                  onClose();
                }}
                className="w-full sm:w-auto h-9 text-xs font-extrabold gap-1.5 bg-[#f97316] text-white hover:bg-[#ea580c] shadow-xs cursor-pointer"
              >
                <span>Buka Halaman Terkait</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
