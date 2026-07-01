"use client";

import { useEffect, useState } from "react";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { CreateCampaignWizard, CampaignWizardSkeleton } from "@/components/features/umkm-dashboard/create-campaign";
import { getUmkmProfile } from "@/services/umkm/umkm-dashboard.service";
import { UmkmProfile } from "@/types/umkm-dashboard.types";

export default function CampaignCreatePage() {
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
        // Mock a slight delay for realistic skeleton presentation
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    }
    loadProfile();
  }, []);

  const businessName = profile?.businessName || "Dapur Sehat Sukabumi";

  return (
    <UmkmDashboardChrome businessName={businessName}>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {loading ? <CampaignWizardSkeleton /> : <CreateCampaignWizard />}
      </div>
    </UmkmDashboardChrome>
  );
}

