// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  login: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));
vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("@/components/providers/AuthProvider", () => ({
  useAuth: () => ({ refresh: mocks.refresh, logout: mocks.logout }),
}));
vi.mock("@/services/auth/auth.service", () => ({ login: mocks.login }));
vi.mock("@/components/auth/AuthSplit", () => ({ AuthSplit: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/auth/AuthRoleTabs", () => ({
  AuthRoleTabs: ({ activeRole, onRoleChange }: { activeRole: string; onRoleChange: (role: "umkm" | "creator") => void }) => (
    <button type="button" data-testid="role-tab" onClick={() => onRoleChange(activeRole === "umkm" ? "creator" : "umkm")}>{activeRole}</button>
  ),
}));
vi.mock("@/components/auth/AuthField", () => ({
  AuthField: ({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => <label>{label}<input aria-label={label} name={name} {...props} /></label>,
  PasswordField: ({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => <label>{label}<input aria-label={label} name={name} {...props} /></label>,
  AuthErrorBanner: ({ message }: { message: string }) => <p role="alert">{message}</p>,
}));
vi.mock("@/components/features/auth/GoogleButton", () => ({ GoogleButton: () => null }));

let root: Root | undefined;
let host: HTMLDivElement;

async function render(element: React.ReactNode) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(element));
}

async function input(label: string, value: string) {
  const node = document.querySelector(`[aria-label="${label}"]`) as HTMLInputElement;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(node, value);
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function submit() {
  await input("Email", "person@example.com");
  await input("Password", "rahasia-aman");
  await act(async () => {
    document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubEnv("NEXT_PUBLIC_ADMIN_APP_URL", "https://admin.example.test");
  vi.clearAllMocks();
  mocks.refresh.mockResolvedValue({ success: true, data: { userId: "user-1" } });
  mocks.logout.mockResolvedValue({ success: true, data: null });
});

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  vi.unstubAllEnvs();
});

describe("LoginForm portal role boundary", () => {
  it("redirects matching UMKM credentials to role-safe next", async () => {
    mocks.login.mockResolvedValue({ success: true, data: { role: "umkm" } });
    const { LoginForm } = await import("../LoginForm");
    await render(<LoginForm next="/dashboard/umkm/campaign/123" role="umkm" />);
    await submit();

    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(mocks.logout).not.toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/umkm/campaign/123");
  });

  it("redirects matching Creator credentials to Creator dashboard", async () => {
    mocks.login.mockResolvedValue({ success: true, data: { role: "creator" } });
    const { LoginForm } = await import("../LoginForm");
    await render(<LoginForm role="creator" />);
    await submit();

    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/kreator");
  });

  it.each([
    ["umkm", "creator", "Akun ini terdaftar sebagai Kreator"],
    ["creator", "umkm", "Akun ini terdaftar sebagai UMKM"],
    ["umkm", "admin", "Akun Admin tidak dapat masuk melalui portal ini"],
  ] as const)("cleans session and never redirects for %s portal with %s account", async (portal, actualRole, message) => {
    mocks.login.mockResolvedValue({ success: true, data: { role: actualRole } });
    const { LoginForm } = await import("../LoginForm");
    await render(<LoginForm role={portal} />);
    await submit();

    expect(mocks.logout).toHaveBeenCalledOnce();
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(document.querySelector('[role="alert"]')?.textContent).toContain(message);
    expect(mocks.login.mock.invocationCallOrder[0]).toBeLessThan(mocks.logout.mock.invocationCallOrder[0]);
  });

  it("fails closed without redirect when mismatch cleanup fails", async () => {
    mocks.login.mockResolvedValue({ success: true, data: { role: "creator" } });
    mocks.logout.mockResolvedValue({ success: false, data: null, error: "Gagal keluar dari sesi." });
    const { LoginForm } = await import("../LoginForm");
    await render(<LoginForm role="umkm" />);
    await submit();

    expect(mocks.replace).not.toHaveBeenCalled();
    expect(document.querySelector('[role="alert"]')?.textContent).toContain("tidak dapat mengakhiri sesi");
  });

  it("rejects cross-role and external next values", async () => {
    mocks.login.mockResolvedValue({ success: true, data: { role: "umkm" } });
    const { LoginForm } = await import("../LoginForm");
    await render(<LoginForm role="umkm" next="https://example.com" />);
    await submit();

    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/umkm");
  });
});
