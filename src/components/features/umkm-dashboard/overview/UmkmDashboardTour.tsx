"use client";

import { useEffect, useRef } from "react";
import { destroyUmkmOnboardingTour } from "@/lib/onboarding/umkm-driver";
import { startUmkmDashboardTourForSession } from "@/lib/onboarding/umkm-dashboard-tour-flow";

interface UmkmDashboardTourProps {
  userId: string;
}

/** T03 mount point. Role eligibility remains enforced by the UMKM route guard. */
export function UmkmDashboardTour({ userId }: UmkmDashboardTourProps) {
  const startedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (startedForUserRef.current === userId) return;

    startedForUserRef.current = userId;
    startUmkmDashboardTourForSession(userId);

    return () => {
      destroyUmkmOnboardingTour();
    };
  }, [userId]);

  return null;
}
