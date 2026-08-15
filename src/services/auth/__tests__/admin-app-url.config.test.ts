import { afterEach, describe, expect, it, vi } from "vitest";

async function loadRoutes() {
  vi.resetModules();
  return import("@/lib/constants/routes");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Admin cross-app URL configuration", () => {
  it("fails explicitly when the Admin origin is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_ADMIN_APP_URL", "");

    await expect(loadRoutes()).rejects.toThrow(
      "NEXT_PUBLIC_ADMIN_APP_URL is required",
    );
  });

  it("rejects non-http Admin origins", async () => {
    vi.stubEnv("NEXT_PUBLIC_ADMIN_APP_URL", "javascript:alert(1)");

    await expect(loadRoutes()).rejects.toThrow("must use http or https");
  });

  it("rejects staging Admin origin in production", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_ADMIN_APP_URL", "https://admin-staging.marketiv.id");

    await expect(loadRoutes()).rejects.toThrow(
      "production cannot use a staging Admin origin",
    );
  });

  it("uses an explicit Admin origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "staging");
    vi.stubEnv("NEXT_PUBLIC_ADMIN_APP_URL", "https://admin.example.test/");

    await expect(loadRoutes()).resolves.toMatchObject({
      adminAppUrl: "https://admin.example.test",
    });
  });
});
