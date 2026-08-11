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
  const startedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    const start = () => {
      if (startedForUserRef.current === userId) return true;

      // Auth can change without this route unmounting. Do not let User A's
      // active Driver instance or mount guard suppress User B's session.
      if (startedForUserRef.current) {
        destroyUmkmOnboardingTour();
        startedForUserRef.current = null;
      }

      const started = startUmkmCampaignTourForSession(userId);
      if (started) startedForUserRef.current = userId;
      return started;
    };

    if (start() || !hasPendingUmkmCampaignHandoff(userId)) {
      return () => {
        mountedRef.current = false;
        if (startedForUserRef.current === userId) queueMicrotask(() => {
          if (!mountedRef.current && startedForUserRef.current === userId) {
            destroyUmkmOnboardingTour();
            startedForUserRef.current = null;
          }
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
      if (startedForUserRef.current === userId) queueMicrotask(() => {
        if (!mountedRef.current && startedForUserRef.current === userId) {
          destroyUmkmOnboardingTour();
          startedForUserRef.current = null;
        }
      });
    };
  }, [userId]);

  return null;
}
