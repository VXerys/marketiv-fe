import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  executeFunction: vi.fn(),
}));

vi.mock("@/lib/appwrite/functions", () => ({
  FUNCTION_IDS: { acceptTos: "accept-tos" },
  executeFunction: mocks.executeFunction,
}));

describe("T&C service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requests status from accept-tos", async () => {
    mocks.executeFunction.mockResolvedValue({
      currentVersion: "v3.1",
      acceptedVersion: null,
      acceptedAt: null,
      needsConsent: true,
    });
    const { getTosStatus } = await import("../tos.service");

    const result = await getTosStatus();

    expect(mocks.executeFunction).toHaveBeenCalledWith("accept-tos", { action: "status" });
    expect(result.data?.needsConsent).toBe(true);
  });

  it("accepts backend-returned version", async () => {
    mocks.executeFunction.mockResolvedValue({
      success: true,
      alreadyAccepted: false,
      tos_version: "v3.1",
    });
    const { acceptCurrentTos } = await import("../tos.service");

    await acceptCurrentTos("v3.1");

    expect(mocks.executeFunction).toHaveBeenCalledWith("accept-tos", {
      action: "accept",
      tos_version: "v3.1",
    });
  });
});
