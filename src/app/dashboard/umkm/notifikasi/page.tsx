"use client";

import { useEffect, useState } from "react";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { NotificationView } from "@/components/features/shared/NotificationView";
import { getUmkmProfile } from "@/services/umkm/umkm-dashboard.service";

export default function NotifikasiPage() {
  const [businessName, setBusinessName] = useState("Dapur Sehat Sukabumi");

  useEffect(() => {
    getUmkmProfile()
      .then(res => {
        if (res.success && res.data?.businessName) {
          setBusinessName(res.data.businessName);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <UmkmDashboardChrome businessName={businessName}>
      <NotificationView theme="umkm" />
    </UmkmDashboardChrome>
  );
}
