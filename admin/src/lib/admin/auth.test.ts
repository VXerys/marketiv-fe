import { describe, expect, it, vi } from "vitest";
import {
  AdminAuthError,
  logoutAdminSession,
  resolveAdminSession,
} from "./auth";
import { canLoadProtectedAdminData } from "@/components/admin/AdminAuthBoundary";

function dependencies(options: {
  account?: () => Promise<unknown>;
  user?: Record<string, unknown> | undefined;
  missingUser?: boolean;
} = {}) {
  const accountGet = vi.fn(options.account ?? (async () => ({ $id: "admin-1", email: "admin@example.test" })));
  const deleteSession = vi.fn(async () => undefined);
  const listDocuments = vi.fn(async () => ({
    documents: options.missingUser
      ? []
      : [options.user ?? { role: "admin", status: "active" }],
  }));
  return {
    account: { get: accountGet, deleteSession },
    databases: { listDocuments },
  } as unknown as NonNullable<Parameters<typeof resolveAdminSession>[0]>;
}

async function expectFailure(
  subject: Promise<unknown>,
  kind: AdminAuthError["kind"],
) {
  await expect(subject).rejects.toMatchObject({ kind });
}

describe("Admin authorization service", () => {
  it("fails closed for anonymous sessions", async () => {
    await expectFailure(resolveAdminSession(dependencies({ account: async () => { throw { code: 401 }; } })), "unauthenticated");
  });

  it("denies UMKM and Creator roles", async () => {
    await expectFailure(resolveAdminSession(dependencies({ user: { role: "umkm", status: "active" } })), "forbidden");
    await expectFailure(resolveAdminSession(dependencies({ user: { role: "creator", status: "active" } })), "forbidden");
  });

  it("denies suspended Admins and missing Marketiv users", async () => {
    await expectFailure(resolveAdminSession(dependencies({ user: { role: "admin", status: "suspended" } })), "suspended");
    await expectFailure(resolveAdminSession(dependencies({ missingUser: true })), "error");
  });

  it("fails closed for Appwrite failures", async () => {
    await expectFailure(resolveAdminSession(dependencies({ account: async () => { throw new Error("offline"); } })), "error");
  });

  it("allows active Admins only", async () => {
    await expect(resolveAdminSession(dependencies())).resolves.toMatchObject({
      userId: "admin-1",
      email: "admin@example.test",
      role: "admin",
      status: "active",
    });
  });

  it("deletes the Appwrite current session on logout", async () => {
    const deps = dependencies() as NonNullable<Parameters<typeof logoutAdminSession>[0]>;
    await logoutAdminSession(deps);
    expect(deps.account.deleteSession).toHaveBeenCalledWith("current");
  });

  it("allows protected loads only after active Admin authorization", () => {
    expect(canLoadProtectedAdminData("authenticated")).toBe(true);
    expect(canLoadProtectedAdminData("loading")).toBe(false);
    expect(canLoadProtectedAdminData("unauthenticated")).toBe(false);
    expect(canLoadProtectedAdminData("forbidden")).toBe(false);
    expect(canLoadProtectedAdminData("suspended")).toBe(false);
    expect(canLoadProtectedAdminData("error")).toBe(false);
  });
});
