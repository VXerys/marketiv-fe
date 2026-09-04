"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { dashboardByRole, isUserPortalRole, routes } from "@/lib/constants/routes";

interface LandingHeroActionsProps {
  ctaUmkm: string;
  ctaCreator: string;
}

export function LandingHeroActions({ ctaUmkm, ctaCreator }: LandingHeroActionsProps) {
  const { user, loading } = useAuth();
  const dashboardHref = user && isUserPortalRole(user.role) ? dashboardByRole[user.role] : null;

  if (loading) {
    return (
      <div
        aria-hidden="true"
        className="flex flex-col sm:flex-row gap-4 sm:gap-5"
      >
        <div className="h-11 w-full min-w-56 rounded-full bg-white/20" />
        <div className="h-11 w-full min-w-56 rounded-full bg-white/20" />
      </div>
    );
  }

  if (dashboardHref) {
    return (
      <Button variant="primary" size="xl" href={dashboardHref}>
        Buka Dashboard
      </Button>
    );
  }

  return (
    <>
      <Button variant="primary" size="xl" href={routes.registerWithRole("umkm")}>
        {ctaUmkm}
      </Button>
      <Button
        variant="outline"
        size="xl"
        href={routes.registerWithRole("creator")}
        className="!bg-white/20 !backdrop-blur-md !border-white/40 !text-white font-semibold hover:!bg-white/40 hover:!border-white/70 transition-all duration-300"
      >
        {ctaCreator}
      </Button>
    </>
  );
}
