"use client";

import { useEffect, useRef } from "react";
import type { NegotiationStage } from "@/types/domain";
import {
  getNegotiationPollDelay,
  isTerminalNegotiationStage,
  AWAITING_ORDER_POLL_TIMEOUT_MS,
  PAYMENT_RETURN_TIMEOUT_MS,
} from "./room-sync";

type Options = {
  stage?: NegotiationStage;
  enabled: boolean;
  paymentVerification?: boolean;
  reload: () => Promise<unknown>;
  onPaymentVerificationTimeout?: () => void;
};

/**
 * Realtime tetap khusus messages. State bisnis dibaca dari DTO server dengan
 * timer berantai supaya tidak ada request tumpang tindih.
 */
export function useNegotiationRoomSync({
  stage,
  enabled,
  paymentVerification = false,
  reload,
  onPaymentVerificationTimeout,
}: Options): void {
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!enabled || isTerminalNegotiationStage(stage)) return;

    let disposed = false;
    const startedAt = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let verificationTimer: ReturnType<typeof setTimeout> | undefined;

    const refresh = async () => {
      if (disposed || document.hidden || inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        await reload();
      } finally {
        inFlightRef.current = false;
      }
    };

    const schedule = () => {
      const delay = getNegotiationPollDelay(stage, paymentVerification);
      if (disposed || document.hidden || delay === null) return;
      if (
        stage === "awaiting_order" &&
        !paymentVerification &&
        Date.now() - startedAt >= AWAITING_ORDER_POLL_TIMEOUT_MS
      ) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        timer = undefined;
        await refresh();
        schedule();
      }, delay);
    };

    const refreshOnVisible = () => {
      if (!document.hidden) {
        if (timer) clearTimeout(timer);
        timer = undefined;
        void refresh().then(schedule);
      }
    };

    window.addEventListener("focus", refreshOnVisible);
    document.addEventListener("visibilitychange", refreshOnVisible);
    schedule();

    if (paymentVerification && onPaymentVerificationTimeout) {
      verificationTimer = setTimeout(onPaymentVerificationTimeout, PAYMENT_RETURN_TIMEOUT_MS);
    }

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      if (verificationTimer) clearTimeout(verificationTimer);
      window.removeEventListener("focus", refreshOnVisible);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, [enabled, onPaymentVerificationTimeout, paymentVerification, reload, stage]);
}
