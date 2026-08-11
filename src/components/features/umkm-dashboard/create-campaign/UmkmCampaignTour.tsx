"use client";

import { useEffect, useRef } from "react";
import { destroyUmkmOnboardingTour } from "@/lib/onboarding/umkm-driver";
import { startUmkmCampaignTourForSession } from "@/lib/onboarding/umkm-dashboard-tour-flow";
import { hasPendingUmkmCampaignHandoff } from "@/lib/onboarding/umkm-dashboard-tour-session";

interface UmkmCampaignTourProps {
  userId: string;
}

/** T04 mount point. Observer retries only while the handoff target is pending. */
export function UmkmCampaignTour({ userId }: UmkmCampaignTourProps) {
  const mountedRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const start = () => {
      if (startedRef.current) return true;
      startedRef.current = startUmkmCampaignTourForSession(userId);
      return startedRef.current;
    };

    if (start() || !hasPendingUmkmCampaignHandoff(userId)) {
      return () => {
        mountedRef.current = false;
        if (startedRef.current) queueMicrotask(() => {
          if (!mountedRef.current) destroyUmkmOnboardingTour();
        });
      };
    }

    const observer = new MutationObserver(() => {
      if (start()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      mountedRef.current = false;
      observer.disconnect();
      if (startedRef.current) queueMicrotask(() => {
        if (!mountedRef.current) destroyUmkmOnboardingTour();
      });
    };
  }, [userId]);

  return null;
}
