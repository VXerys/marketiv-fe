"use client";

import { useEffect, useState } from "react";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { CreateCampaignWizard, CampaignWizardSkeleton } from "@/components/features/umkm-dashboard/create-campaign";
import { getUmkmProfile } from "@/services/umkm/umkm-dashboard.service";
import { UmkmProfile } from "@/types/umkm-dashboard.types";
import { UmkmPageWrapper } from "@/components/features/umkm-dashboard/shared/UmkmPageWrapper";
import { useAuth } from "@/components/providers/AuthProvider";
import { UmkmCampaignTour } from "@/components/features/umkm-dashboard/create-campaign/UmkmCampaignTour";

export default function CampaignCreatePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UmkmProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getUmkmProfile();
        if (res.success && res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        console.warn("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const businessName = profile?.businessName ?? "";

  return (
    <UmkmDashboardChrome businessName={businessName}>
      <UmkmPageWrapper maxWidth={1440}>
        {loading ? <CampaignWizardSkeleton /> : <>
          {user?.role === "umkm" ? <UmkmCampaignTour userId={user.userId} /> : null}
          <CreateCampaignWizard />
        </>}
      </UmkmPageWrapper>
    </UmkmDashboardChrome>
  );
}

