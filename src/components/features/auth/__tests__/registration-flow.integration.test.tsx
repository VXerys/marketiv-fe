// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  registerUmkm: vi.fn(),
  registerCreator: vi.fn(),
  requestEmailOtp: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));
vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("@/components/providers/AuthProvider", () => ({ useAuth: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/services/auth/auth.service", () => ({
  registerUmkm: mocks.registerUmkm,
  registerCreator: mocks.registerCreator,
  requestEmailOtp: mocks.requestEmailOtp,
}));
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
vi.mock("@/components/features/auth/EmailVerificationPending", () => ({
  EmailVerificationPending: ({ email, onContinue }: { email: string; onContinue: () => void }) => <button type="button" data-testid="otp-screen" onClick={onContinue}>OTP {email}</button>,
}));
vi.mock("@/components/features/auth/GoogleButton", () => ({ GoogleButton: () => <button type="button">Google</button> }));

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

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
});

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  mocks.registerUmkm.mockResolvedValue({ success: true, data: { user: { userId: "umkm-1" } } });
  mocks.registerCreator.mockResolvedValue({ success: true, data: { user: { userId: "creator-1" } } });
  mocks.requestEmailOtp.mockResolvedValue({ success: true, data: null });
  mocks.refresh.mockResolvedValue({ success: true, data: { userId: "umkm-1" } });
});

describe("registration flow", () => {
  it("renders UMKM account fields only, validates account payload, then enters OTP", async () => {
    const { RegisterUmkmForm } = await import("../RegisterUmkmForm");
    await render(<RegisterUmkmForm />);

    expect(document.querySelector('[aria-label="Nama Usaha"]')).toBeNull();
    expect(document.querySelector('[aria-label="Kategori Usaha"]')).toBeNull();
    expect(document.querySelector('[aria-label="Email"]')).not.toBeNull();
    expect(document.querySelector('[aria-label="Nomor WhatsApp"]')).not.toBeNull();
    expect(document.querySelector('[aria-label="Password"]')).not.toBeNull();

    await input("Email", "owner@usaha.id");
    await input("Nomor WhatsApp", "08123456789");
    await input("Password", "rahasia-aman");
    await act(async () => {
      document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(mocks.registerUmkm).toHaveBeenCalledWith({ email: "owner@usaha.id", phone: "08123456789", password: "rahasia-aman" });
    expect(mocks.requestEmailOtp).toHaveBeenCalledWith({ userId: "umkm-1", email: "owner@usaha.id" });
    expect(document.querySelector('[data-testid="otp-screen"]')?.textContent).toContain("owner@usaha.id");
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("sends verified UMKM from OTP continuation to onboarding", async () => {
    const { RegisterUmkmForm } = await import("../RegisterUmkmForm");
    await render(<RegisterUmkmForm />);
    await input("Email", "owner@usaha.id");
    await input("Nomor WhatsApp", "08123456789");
    await input("Password", "rahasia-aman");
    await act(async () => document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    await act(async () => (document.querySelector('[data-testid="otp-screen"]') as HTMLButtonElement).click());

    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith("/onboarding");
  });

  it("keeps Creator contract and role switch", async () => {
    const { RegisterCreatorForm } = await import("../RegisterCreatorForm");
    await render(<RegisterCreatorForm />);

    expect(document.querySelector('[aria-label="Nama Lengkap"]')).not.toBeNull();
    expect(document.querySelector('[aria-label="Email"]')).not.toBeNull();
    expect(document.querySelector('[aria-label="Password"]')).not.toBeNull();
    expect(document.querySelector('[aria-label="Nomor WhatsApp"]')).toBeNull();
    expect(document.querySelector('[aria-label="Nama Usaha"]')).toBeNull();

    await act(async () => (document.querySelector('[data-testid="role-tab"]') as HTMLButtonElement).click());
    expect(mocks.push).toHaveBeenCalledWith("/register?role=umkm", { scroll: false });
  });
});
