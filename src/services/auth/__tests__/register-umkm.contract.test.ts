import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  createEmailPasswordSession: vi.fn(),
  updatePrefs: vi.fn(),
  get: vi.fn(),
  executeFunction: vi.fn(),
}));

vi.mock("@/lib/appwrite/account", () => ({
  account: {
    create: mocks.create,
    createEmailPasswordSession: mocks.createEmailPasswordSession,
    updatePrefs: mocks.updatePrefs,
    get: mocks.get,
  },
}));

vi.mock("@/lib/appwrite/functions", () => ({
  FUNCTION_IDS: { createUserProfile: "create-user-profile" },
  FunctionExecutionError: class FunctionExecutionError extends Error {},
  executeFunction: mocks.executeFunction,
}));

vi.mock("@/services/auth/session.service", () => ({
  getSession: vi.fn(),
  getMockSessionUser: vi.fn(),
  setMockRole: vi.fn(),
}));

describe("registerUmkm contract", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.create.mockResolvedValue({ $id: "user-1" });
    mocks.createEmailPasswordSession.mockResolvedValue({ $id: "session-1" });
    mocks.updatePrefs.mockResolvedValue({});
    mocks.get.mockResolvedValue({
      $id: "user-1",
      email: "owner@usaha.id",
      name: "",
      phone: "",
      prefs: { role: "umkm", phone: "08123456789" },
    });
    mocks.executeFunction.mockResolvedValue({});
    const session = await import("@/services/auth/session.service");
    vi.mocked(session.getSession).mockResolvedValue({
      success: true,
      data: {
        userId: "user-1",
        email: "owner@usaha.id",
        role: "umkm",
        status: "active",
        emailVerified: false,
        isProfileCompleted: false,
      },
    });
  });

  it("accepts account-only UMKM input and never writes business placeholders", async () => {
    const { registerUmkm } = await import("@/services/auth/auth.service");

    const result = await registerUmkm({
      email: "owner@usaha.id",
      phone: "08123456789",
      password: "rahasia-aman",
    });

    expect(result.success).toBe(true);
    expect(mocks.create).toHaveBeenCalledWith({
      userId: expect.any(String),
      email: "owner@usaha.id",
      password: "rahasia-aman",
    });
    expect(mocks.updatePrefs).toHaveBeenCalledWith({
      prefs: { role: "umkm", phone: "08123456789" },
    });
  }, 15000);

  it("does not require businessName or category", async () => {
    const { registerUmkmSchema } = await import("@/lib/validations/auth.schema");

    expect(registerUmkmSchema.safeParse({
      email: "owner@usaha.id",
      phone: "08123456789",
      password: "rahasia-aman",
    }).success).toBe(true);
  });
});
