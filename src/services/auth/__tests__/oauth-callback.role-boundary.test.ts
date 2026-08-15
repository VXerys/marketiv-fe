import { afterEach, describe, expect, it, vi } from "vitest";

async function loadResolver() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_ADMIN_APP_URL", "https://admin.example.test");
  return import("../oauth-callback.service");
}

afterEach(() => vi.unstubAllEnvs());

const user = (role: "umkm" | "creator" | "admin") => ({
  userId: "user-1",
  email: "user@example.com",
  role,
  status: "active" as const,
  emailVerified: true,
  isProfileCompleted: true,
});

describe("OAuth callback portal boundary", () => {
  it("rejects authenticated role mismatches before navigation", async () => {
    const { resolveOAuthCallbackDecision } = await loadResolver();
    expect(resolveOAuthCallbackDecision({ user: user("creator"), role: "umkm" })).toEqual({
      action: "role_mismatch",
      actualRole: "creator",
    });
    expect(resolveOAuthCallbackDecision({ user: user("admin"), role: "creator" })).toEqual({
      action: "role_mismatch",
      actualRole: "admin",
    });
  });

  it("uses only role-safe next for a matching account", async () => {
    const { resolveOAuthCallbackDecision } = await loadResolver();
    expect(resolveOAuthCallbackDecision({
      user: user("creator"),
      role: "creator",
      next: "/dashboard/umkm/campaign",
    })).toEqual({ action: "redirect", href: "/dashboard/kreator" });
  });
});
