import { startUmkmOnboardingTour } from "./umkm-driver";
import { umkmDashboardTourSteps } from "./umkm-dashboard-tour";
import {
  abandonUmkmDashboardTourSession,
  beginUmkmDashboardTourSession,
  beginUmkmCampaignHandoff,
  claimUmkmCampaignTour,
  markUmkmCampaignTourHandled,
  markUmkmDashboardTourHandled,
  restoreUmkmCampaignHandoff,
} from "./umkm-dashboard-tour-session";
import { umkmCampaignTourSteps } from "./umkm-campaign-tour";
import { routes } from "../constants/routes";

/** Single T03 seam from eligible UMKM Dashboard session into T02 adapter. */
export function startUmkmDashboardTourForSession(userId: string): boolean {
  if (!beginUmkmDashboardTourSession(userId)) return false;

  const tour = startUmkmOnboardingTour(umkmDashboardTourSteps, {
    onDestroyed: () => markUmkmDashboardTourHandled(userId),
  });
  if (!tour) abandonUmkmDashboardTourSession(userId);
  return tour !== null;
}

/** Call only from existing user-triggered Dashboard Campaign navigation. */
export function beginUmkmCampaignHandoffForSession(userId: string): boolean {
  return beginUmkmCampaignHandoff(userId);
}

/** Reuses existing route; navigation occurs only from a user event handler. */
export function navigateUmkmCampaignForOnboarding(
  userId: string | undefined,
  navigate: (href: string) => void
): void {
  if (userId) beginUmkmCampaignHandoffForSession(userId);
  navigate(routes.umkmCreateCampaign);
}

/** Campaign-side continuation. It never performs navigation. */
export function startUmkmCampaignTourForSession(userId: string): boolean {
  if (!claimUmkmCampaignTour(userId)) return false;

  const tour = startUmkmOnboardingTour(umkmCampaignTourSteps, {
    onDestroyed: () => markUmkmCampaignTourHandled(userId),
  });

  if (!tour) restoreUmkmCampaignHandoff(userId);
  return tour !== null;
}
