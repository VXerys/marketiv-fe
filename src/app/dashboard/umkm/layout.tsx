import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { UmkmIdentityProvider } from "@/components/features/dashboard/UmkmIdentityContext";

/**
 * Boundary guard segment UMKM.
 * Chrome dashboard tetap dirender per-page; layout ini menegakkan role dan menyediakan UmkmIdentityProvider.
 */
export default function UmkmDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="umkm">
      <UmkmIdentityProvider>{children}</UmkmIdentityProvider>
    </RoleGuard>
  );
}
