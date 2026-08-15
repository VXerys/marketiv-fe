import { afterEach, describe, expect, it, vi } from "vitest";

async function loadRoutes() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_ADMIN_APP_URL", "https://admin.example.test");
  return import("@/lib/constants/routes");
}

afterEach(() => vi.unstubAllEnvs());

describe("resolveSafePostLoginDestination", () => {
  it("accepts role-compatible dashboard destinations", async () => {
    const { resolveSafePostLoginDestination } = await loadRoutes();
    expect(resolveSafePostLoginDestination("umkm", "/dashboard/umkm")).toBe("/dashboard/umkm");
    expect(resolveSafePostLoginDestination("umkm", "/dashboard/umkm/campaign/123")).toBe("/dashboard/umkm/campaign/123");
    expect(resolveSafePostLoginDestination("creator", "/dashboard/kreator/pekerjaan-aktif")).toBe("/dashboard/kreator/pekerjaan-aktif");
  });

  it("falls back for cross-role, external, and malformed destinations", async () => {
    const { resolveSafePostLoginDestination } = await loadRoutes();
    const umkmFallback = "/dashboard/umkm";
    const creatorFallback = "/dashboard/kreator";

    for (const value of [
      "/dashboard/kreator",
      "https://example.com",
      "//example.com",
      "javascript:alert(1)",
      "data:text/html,unsafe",
      "\\example.com",
      "/%2f%2fevil.example",
      " /dashboard/umkm",
      "",
    ]) {
      expect(resolveSafePostLoginDestination("umkm", value)).toBe(umkmFallback);
    }
    expect(resolveSafePostLoginDestination("creator", "/dashboard/umkm")).toBe(creatorFallback);
  });
});
