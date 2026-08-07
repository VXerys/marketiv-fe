import { describe, expect, it } from "vitest";
import {
  resolveOAuthCallbackDecision,
  type OAuthCallbackInput,
} from "../../../src/services/auth/oauth-callback.service";

const baseInput: OAuthCallbackInput = {
  user: null,
  errorCode: "not_found",
};

describe("resolveOAuthCallbackDecision", () => {
  it("redirects existing user to next path", () => {
    expect(
      resolveOAuthCallbackDecision({
        user: {
          userId: "u1",
          email: "creator@example.com",
          role: "creator",
          status: "active",
          isProfileCompleted: false,
        },
        next: "/dashboard/kreator/rate-card",
      })
    ).toEqual({ action: "redirect", href: "/dashboard/kreator/rate-card" });
  });

  it("sends missing UMKM profile to OAuth completion form", () => {
    expect(
      resolveOAuthCallbackDecision({
        ...baseInput,
        role: "umkm",
      })
    ).toEqual({ action: "redirect", href: "/auth/oauth-complete?role=umkm" });
  });

  it("asks creator OAuth callback to provision when mirror is missing", () => {
    expect(
      resolveOAuthCallbackDecision({
        ...baseInput,
        role: "creator",
      })
    ).toEqual({ action: "provision_creator" });
  });

  it("keeps creator OAuth on recovery UI when provisioning fails", () => {
    expect(
      resolveOAuthCallbackDecision({
        ...baseInput,
        role: "creator",
        provisioningSucceeded: false,
      })
    ).toEqual({ action: "show_recovery" });
  });

  it("sends OAuth failures back to login with oauth error", () => {
    expect(
      resolveOAuthCallbackDecision({
        user: null,
        errorCode: "auth",
      })
    ).toEqual({ action: "redirect", href: "/login?error=oauth" });
  });
});
