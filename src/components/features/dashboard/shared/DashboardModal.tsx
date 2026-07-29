"use client";

import type { ReactNode } from "react";
import * as React from "react";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
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
  titleClassName?: string;
  hideFooter?: boolean;
}

/**
 * @deprecated Use Dialog from @/components/ui/dialog instead or ResponsiveModal from @/components/ui/responsive-modal.
 */
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
  titleClassName,
  hideFooter = false,
}: DashboardModalProps) {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <ResponsiveModalContent className={cn("max-w-lg rounded-t-3xl sm:rounded-3xl", className)}>
        <ResponsiveModalHeader className="space-y-2 text-left">
          <ResponsiveModalTitle className={cn("text-xl font-bold text-neutral-950", titleClassName)}>{title}</ResponsiveModalTitle>
          {description ? (
            <ResponsiveModalDescription className="text-sm leading-6 text-neutral-500">
              {description}
            </ResponsiveModalDescription>
          ) : null}
        </ResponsiveModalHeader>

        {children ? <div className="mt-2">{children}</div> : null}

        {!hideFooter ? (
          <ResponsiveModalFooter className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
          </ResponsiveModalFooter>
        ) : null}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
