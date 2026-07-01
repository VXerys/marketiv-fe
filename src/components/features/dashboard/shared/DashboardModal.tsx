"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

import { DashboardButton } from "./DashboardButton";

interface DashboardModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose: () => void;
  variant?: "default" | "danger";
  className?: string;
}

export function DashboardModal({
  isOpen,
  title,
  description,
  children,
  footer,
  confirmLabel,
  cancelLabel = "Tutup",
  onConfirm,
  onClose,
  variant = "default",
  className,
}: DashboardModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 px-4 py-4 sm:items-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Tutup modal" onClick={onClose} />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)]",
          "max-h-[calc(100dvh-2rem)] overflow-y-auto",
          className,
        )}
      >
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-neutral-950">{title}</h2>
          {description ? <p className="text-sm leading-6 text-neutral-500">{description}</p> : null}
        </div>
        {children ? <div className="mt-5">{children}</div> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {footer ?? (
            <>
              <DashboardButton type="button" variant="outline" onClick={onClose} fullWidthOnMobile>
                {cancelLabel}
              </DashboardButton>
              {confirmLabel && onConfirm ? (
                <DashboardButton
                  type="button"
                  variant={variant === "danger" ? "danger" : "primary"}
                  onClick={onConfirm}
                  fullWidthOnMobile
                >
                  {confirmLabel}
                </DashboardButton>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
