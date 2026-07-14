import { ReactNode } from "react";
import { CreatorDashboardChrome } from "@/components/features/creator-dashboard";

interface CreatorLayoutProps {
  children: ReactNode;
}

export default function CreatorLayout({ children }: CreatorLayoutProps) {
  return <CreatorDashboardChrome>{children}</CreatorDashboardChrome>;
}
