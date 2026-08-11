import { startUmkmOnboardingTour } from "./umkm-driver";
import { umkmDashboardTourSteps } from "./umkm-dashboard-tour";
import {
  abandonUmkmDashboardTourSession,
  beginUmkmDashboardTourSession,
} from "./umkm-dashboard-tour-session";

/** Single T03 seam from eligible UMKM Dashboard session into T02 adapter. */
export function startUmkmDashboardTourForSession(userId: string): boolean {
  if (!beginUmkmDashboardTourSession(userId)) return false;

  const tour = startUmkmOnboardingTour(umkmDashboardTourSteps);
  if (!tour) abandonUmkmDashboardTourSession(userId);
  return tour !== null;
}
