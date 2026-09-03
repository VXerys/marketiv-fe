import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  accountGet: vi.fn(),
  listDocuments: vi.fn(),
}));

vi.mock("@/config/data-source.config", () => ({
  DATA_SOURCE_CONFIG: { useMockData: false },
}));

vi.mock("@/lib/appwrite/account", () => ({
  account: { get: mocks.accountGet },
}));

vi.mock("@/lib/appwrite/databases", () => ({
  databases: { listDocuments: mocks.listDocuments },
}));

describe("session T&C fields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.accountGet.mockResolvedValue({
      $id: "user-1",
      email: "user@example.com",
      name: "User",
      emailVerification: true,
    });
    mocks.listDocuments.mockResolvedValueOnce({
      documents: [{
        role: "creator",
        status: "active",
        tos_version: "v3.1",
        tos_accepted_at: "2026-09-01T00:00:00.000Z",
      }],
    }).mockResolvedValueOnce({ documents: [{ isProfileCompleted: true }] });
  });

  it("maps T&C version and acceptance time from authoritative user document", async () => {
    const { getSession } = await import("../session.service");

    const result = await getSession();

    expect(result.data).toMatchObject({
      tosVersion: "v3.1",
      tosAcceptedAt: "2026-09-01T00:00:00.000Z",
    });
  });

  it("omits blank T&C fields from session", async () => {
    mocks.listDocuments.mockReset();
    mocks.listDocuments.mockResolvedValueOnce({
      documents: [{ role: "creator", status: "active", tos_version: "", tos_accepted_at: "" }],
    }).mockResolvedValueOnce({ documents: [{ isProfileCompleted: true }] });
    const { getSession } = await import("../session.service");

    const result = await getSession();

    expect(result.data).not.toHaveProperty("tosVersion");
    expect(result.data).not.toHaveProperty("tosAcceptedAt");
  });
});
