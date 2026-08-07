import type { ServiceErrorCode, UserRole } from "@/types/domain";
import type { SessionUser } from "./session.service";

export interface OAuthCallbackInput {
  user: SessionUser | null;
  errorCode?: ServiceErrorCode | null;
  role?: "umkm" | "creator";
  next?: string;
  provisioningSucceeded?: boolean;
}

export type OAuthCallbackDecision =
  | { action: "redirect"; href: string }
  | { action: "provision_creator" }
  | { action: "show_recovery" };

const dashboardByRole: Record<UserRole, string> = {
  umkm: "/dashboard/umkm",
  creator: "/dashboard/kreator",
  admin: "/admin",
};

export function resolveOAuthCallbackDecision(
  input: OAuthCallbackInput
): OAuthCallbackDecision {
  if (input.user) {
    return { action: "redirect", href: input.next || dashboardByRole[input.user.role] };
  }

  if (input.errorCode !== "not_found") {
    return { action: "redirect", href: "/login?error=oauth" };
  }

  if (input.role === "umkm") {
    return { action: "redirect", href: "/auth/oauth-complete?role=umkm" };
  }

  if (input.role === "creator") {
    if (input.provisioningSucceeded === false) return { action: "show_recovery" };
    if (input.provisioningSucceeded === true) {
      return { action: "redirect", href: "/onboarding" };
    }
    return { action: "provision_creator" };
  }

  return { action: "redirect", href: "/register?error=profile_missing" };
}
