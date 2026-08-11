// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ confirm: vi.fn(), request: vi.fn(), continue: vi.fn() }));

vi.mock("lucide-react", () => ({ MailCheck: () => <span />, RefreshCcw: () => <span />, ArrowRight: () => <span /> }));
vi.mock("@/services/auth/auth.service", () => ({ confirmEmailOtp: mocks.confirm, requestEmailOtp: mocks.request }));
vi.mock("@/components/auth/AuthCard", () => ({ AuthCard: ({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) => <main>{children}{footer}</main> }));
vi.mock("@/components/auth/AuthField", () => ({ AuthErrorBanner: ({ message }: { message: string }) => <p role="alert">{message}</p> }));
vi.mock("@/components/ui/input-otp", () => ({
  InputOTP: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => <input aria-label="Kode Verifikasi 6 Digit" value={value} onChange={(event) => onChange(event.target.value)} />,
  InputOTPGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InputOTPSlot: () => null,
  InputOTPSeparator: () => null,
}));

let root: Root | undefined;
let host: HTMLDivElement;

async function render(element: React.ReactNode) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(element));
}

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
});

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  mocks.confirm.mockResolvedValue({ success: true, data: null });
});

describe("email OTP", () => {
  it("confirms six-digit OTP once, then continues parent registration flow", async () => {
    const { EmailVerificationPending } = await import("../EmailVerificationPending");
    await render(<EmailVerificationPending email="owner@usaha.id" userId="umkm-1" password="rahasia-aman" onContinue={mocks.continue} />);
    const input = document.querySelector('[aria-label="Kode Verifikasi 6 Digit"]') as HTMLInputElement;

    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "123456");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mocks.confirm).toHaveBeenCalledWith({ userId: "umkm-1", email: "owner@usaha.id", password: "rahasia-aman", code: "123456" });
    expect(mocks.continue).toHaveBeenCalledOnce();
  });
});
