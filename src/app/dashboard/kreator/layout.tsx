import { ReactNode } from "react";
import { CreatorDashboardChrome } from "@/components/features/creator-dashboard";
import { RoleGuard } from "@/components/auth/RoleGuard";

interface CreatorLayoutProps {
  children: ReactNode;
}

export default function CreatorLayout({ children }: CreatorLayoutProps) {
  return (
    <RoleGuard role="creator">
      <CreatorDashboardChrome>{children}</CreatorDashboardChrome>
    </RoleGuard>
  );
}
