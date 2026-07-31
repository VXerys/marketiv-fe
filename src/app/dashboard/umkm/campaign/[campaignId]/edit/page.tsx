"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { CreateCampaignWizard, CampaignWizardSkeleton } from "@/components/features/umkm-dashboard/create-campaign";
import { CampaignNotFoundState } from "@/components/features/umkm-dashboard/campaign/detail/CampaignNotFoundState";
import { UmkmPageWrapper } from "@/components/features/umkm-dashboard/shared/UmkmPageWrapper";
import { getUmkmProfile, getCampaignDraftForEdit } from "@/services/umkm/umkm-dashboard.service";
import { rehydrateWizard, type RehydratedWizard } from "@/components/features/umkm-dashboard/create-campaign/create-campaign.rehydrate";
import { UmkmProfile } from "@/types/umkm-dashboard.types";
import { toast } from "sonner";

export default function CampaignEditPage() {
  const params = useParams();
  const campaignId = typeof params.campaignId === "string" ? params.campaignId : "";

  const [profile, setProfile] = useState<UmkmProfile | null>(null);
  const [rehydrated, setRehydrated] = useState<RehydratedWizard | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) { setNotFound(true); setLoading(false); return; }

    async function load() {
      try {
        const [profileRes, draftRes] = await Promise.all([
          getUmkmProfile(),
          getCampaignDraftForEdit(campaignId),
        ]);
        if (profileRes.success && profileRes.data) setProfile(profileRes.data);
        if (!draftRes.success || !draftRes.data) {
          setNotFound(true);
          return;
        }
        const rh = rehydrateWizard(draftRes.data);
        // Tampilkan peringatan rehydrate hanya bila ada data yang benar-benar hilang
        rh.warnings.forEach((w) => toast.warning(w));
        setRehydrated(rh);
      } catch (err) {
        console.warn("Failed to load draft for edit", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId]);

  const businessName = profile?.businessName ?? "";

  return (
    <UmkmDashboardChrome businessName={businessName}>
      <UmkmPageWrapper maxWidth={1440}>
        {loading ? (
          <CampaignWizardSkeleton />
        ) : notFound ? (
          <CampaignNotFoundState />
        ) : (
          <CreateCampaignWizard
            campaignId={campaignId}
            initialState={rehydrated?.state}
            initialMeta={rehydrated?.meta}
          />
        )}
      </UmkmPageWrapper>
    </UmkmDashboardChrome>
  );
}
