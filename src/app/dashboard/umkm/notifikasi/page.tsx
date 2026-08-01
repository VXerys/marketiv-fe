import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { NotificationView } from "@/components/features/shared/NotificationView";

export default function NotifikasiPage() {
  return (
    <UmkmDashboardChrome>
      <NotificationView theme="umkm" />
    </UmkmDashboardChrome>
  );
}
