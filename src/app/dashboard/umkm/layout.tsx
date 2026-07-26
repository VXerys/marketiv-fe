import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";

/**
 * Boundary guard segment UMKM.
 * Chrome dashboard tetap dirender per-page; layout ini hanya menegakkan role.
 */
export default function UmkmDashboardLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="umkm">{children}</RoleGuard>;
}
