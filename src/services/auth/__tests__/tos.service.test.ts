import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  executeFunction: vi.fn(),
  mockDelay: vi.fn(),
  useMockData: false,
}));

vi.mock("@/lib/appwrite/functions", () => ({
  FUNCTION_IDS: { acceptTos: "accept-tos" },
  executeFunction: mocks.executeFunction,
}));

vi.mock("@/config/data-source.config", () => ({
  DATA_SOURCE_CONFIG: {
    get useMockData() {
      return mocks.useMockData;
    },
  },
}));

vi.mock("@/lib/mock-delay", () => ({ mockDelay: mocks.mockDelay }));

describe("T&C service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.useMockData = false;
  });

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

  it("returns accepted mock T&C status without calling Function", async () => {
    mocks.useMockData = true;
    const { getTosStatus } = await import("../tos.service");

    const result = await getTosStatus();

    expect(result).toMatchObject({
      success: true,
      data: {
        acceptedVersion: result.data?.currentVersion,
        acceptedAt: expect.any(String),
        needsConsent: false,
      },
    });
    expect(mocks.executeFunction).not.toHaveBeenCalled();
  });

  it("accepts current mock T&C without calling Function", async () => {
    mocks.useMockData = true;
    const { acceptCurrentTos, getTosStatus } = await import("../tos.service");
    const status = await getTosStatus();

    const result = await acceptCurrentTos(status.data?.currentVersion ?? "");

    expect(result).toMatchObject({
      success: true,
      data: { alreadyAccepted: true, tos_version: status.data?.currentVersion },
    });
    expect(mocks.executeFunction).not.toHaveBeenCalled();
  });
});
