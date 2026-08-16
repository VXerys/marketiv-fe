import { describe, expect, it, vi } from "vitest";
import {
  AdminAuthError,
  logoutAdminSession,
  resolveAdminSession,
  signInAdminSession,
} from "./auth";
import { canLoadProtectedAdminData } from "@/components/admin/AdminAuthBoundary";

function dependencies(options: {
  account?: () => Promise<unknown>;
  createSession?: () => Promise<unknown>;
  user?: Record<string, unknown> | undefined;
  missingUser?: boolean;
} = {}) {
  const accountGet = vi.fn(options.account ?? (async () => ({ $id: "admin-1", email: "admin@example.test" })));
  const createEmailPasswordSession = vi.fn(options.createSession ?? (async () => ({ $id: "session-1" })));
  const deleteSession = vi.fn(async () => undefined);
  const listDocuments = vi.fn(async () => ({
    documents: options.missingUser
      ? []
      : [options.user ?? { role: "admin", status: "active" }],
  }));
  return {
    account: { createEmailPasswordSession, get: accountGet, deleteSession },
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

  it("denies suspended Admins and missing Marketiv users without admin label", async () => {
    await expectFailure(resolveAdminSession(dependencies({ user: { role: "admin", status: "suspended" } })), "suspended");
    await expectFailure(resolveAdminSession(dependencies({ missingUser: true })), "forbidden");
  });

  it("fails closed for Appwrite failures", async () => {
    await expectFailure(resolveAdminSession(dependencies({ account: async () => { throw new Error("offline"); } })), "error");
  });

  it("allows active Admins with database record", async () => {
    await expect(resolveAdminSession(dependencies())).resolves.toMatchObject({
      userId: "admin-1",
      email: "admin@example.test",
      role: "admin",
      status: "active",
    });
  });

  it("allows active Admins from Appwrite Auth labels directly", async () => {
    const deps = dependencies({
      account: async () => ({ $id: "admin-2", email: "ops@marketiv.id", labels: ["admin"] }),
      missingUser: true,
    });
    await expect(resolveAdminSession(deps)).resolves.toMatchObject({
      userId: "admin-2",
      email: "ops@marketiv.id",
      role: "admin",
      status: "active",
    });
  });

  it("allows active Admins from Appwrite Auth prefs directly", async () => {
    const deps = dependencies({
      account: async () => ({ $id: "admin-3", email: "ops@marketiv.id", prefs: { role: "admin" } }),
      missingUser: true,
    });
    await expect(resolveAdminSession(deps)).resolves.toMatchObject({
      userId: "admin-3",
      email: "ops@marketiv.id",
      role: "admin",
      status: "active",
    });
  });

  it("handles case-insensitive role values in database", async () => {
    const deps = dependencies({
      user: { role: "ADMIN", status: "ACTIVE" },
    });
    await expect(resolveAdminSession(deps)).resolves.toMatchObject({
      userId: "admin-1",
      role: "admin",
      status: "active",
    });
  });

  it("creates then validates an Admin session before allowing access", async () => {
    const deps = dependencies();

    await expect(signInAdminSession(" admin@example.test ", "secret", deps)).resolves.toMatchObject({
      userId: "admin-1",
      isAdmin: true,
    });
    expect(deps.account.createEmailPasswordSession).toHaveBeenCalledWith({
      email: "admin@example.test",
      password: "secret",
    });
  });

  it("removes a newly-created session if its account is not an active Admin", async () => {
    const deps = dependencies({ user: { role: "creator", status: "active" } });

    await expectFailure(signInAdminSession("creator@example.test", "secret", deps), "forbidden");
    expect(deps.account.deleteSession).toHaveBeenCalledWith("current");
  });

  it("does not expose credential details when Appwrite rejects sign-in", async () => {
    const deps = dependencies({ createSession: async () => { throw { code: 401 }; } });

    await expect(signInAdminSession("admin@example.test", "wrong", deps)).rejects.toMatchObject({
      kind: "unauthenticated",
      message: "Email atau kata sandi salah, atau akun tidak dapat masuk.",
    });
    expect(deps.account.deleteSession).not.toHaveBeenCalled();
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
