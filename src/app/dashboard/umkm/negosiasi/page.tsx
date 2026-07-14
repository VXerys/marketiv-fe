"use client";

import { useEffect, useState } from "react";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { NegotiationListPage } from "@/components/features/umkm-dashboard/negotiation";
import { getUmkmProfile } from "@/services/umkm/umkm-dashboard.service";
import { UmkmProfile } from "@/types/umkm-dashboard.types";

export default function NegotiationPage() {
  const [profile, setProfile] = useState<UmkmProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getUmkmProfile();
        if (res.success && res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        console.warn("Failed to load profile", err);
      }
    }
    loadProfile();
  }, []);

  const businessName = profile?.businessName || "Dapur Sehat Sukabumi";

  return (
    <UmkmDashboardChrome businessName={businessName}>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <NegotiationListPage />
      </div>
    </UmkmDashboardChrome>
  );
}
