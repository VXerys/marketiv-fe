// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getTosStatus: vi.fn(),
  acceptCurrentTos: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/umkm",
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock("@/services/auth/session.service", () => ({
  getSession: mocks.getSession,
  logout: vi.fn(),
}));
vi.mock("@/services/auth/tos.service", () => ({
  getTosStatus: mocks.getTosStatus,
  acceptCurrentTos: mocks.acceptCurrentTos,
}));
vi.mock("@/components/ui/responsive-modal", () => ({
  ResponsiveModal: ({ open, children }: { open: boolean; children: React.ReactNode }) => open ? <div role="dialog">{children}</div> : null,
  ResponsiveModalContent: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  ResponsiveModalHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  ResponsiveModalTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  ResponsiveModalDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  ResponsiveModalFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
}));
vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => (
    <button role="checkbox" aria-checked={checked} onClick={() => onCheckedChange(!checked)} />
  ),
}));

let root: Root | undefined;
let host: HTMLDivElement;

async function render(element: React.ReactNode) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(element));
}

async function click(element: HTMLElement) {
  await act(async () => element.click());
}

function button(label: string) {
  return [...document.querySelectorAll("button")].find((element) => element.textContent === label) as HTMLButtonElement;
}

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  mocks.getSession
    .mockResolvedValueOnce({
      success: true,
      data: {
        userId: "umkm-1",
        email: "owner@usaha.id",
        role: "umkm",
        status: "active",
        emailVerified: true,
        isProfileCompleted: true,
      },
    })
    .mockResolvedValueOnce({ success: false, data: null, error: "Sesi belum dapat dimuat" })
    .mockResolvedValueOnce({
      success: true,
      data: {
        userId: "umkm-1",
        email: "owner@usaha.id",
        role: "umkm",
        status: "active",
        emailVerified: true,
        isProfileCompleted: true,
        tosVersion: "v3.1",
        tosAcceptedAt: "2026-09-03T00:00:00.000Z",
      },
    });
  mocks.getTosStatus.mockResolvedValue({
    success: true,
    data: { currentVersion: "v3.1", acceptedVersion: null, acceptedAt: null, needsConsent: true },
  });
  mocks.acceptCurrentTos.mockResolvedValue({
    success: true,
    data: { success: true, alreadyAccepted: false, tos_version: "v3.1" },
  });
});

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
});

describe("AuthProvider refresh for T&C consent", () => {
  it("keeps RoleGuard consent gate mounted when background refresh fails", async () => {
    const { AuthProvider } = await import("@/components/providers/AuthProvider");
    const { RoleGuard } = await import("@/components/auth/RoleGuard");
    await render(
      <AuthProvider>
        <RoleGuard role="umkm"><p data-testid="dashboard">Dashboard</p></RoleGuard>
      </AuthProvider>,
    );

    await click(document.querySelector('[role="checkbox"]') as HTMLElement);
    await click(button("Setujui & Lanjutkan"));

    expect(mocks.getSession).toHaveBeenCalledTimes(2);
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("belum bisa memverifikasi");
    expect(document.querySelector('[data-testid="dashboard"]')).toBeNull();
    expect(mocks.replace).not.toHaveBeenCalled();

    await click(button("Setujui & Lanjutkan"));
    expect(mocks.acceptCurrentTos).toHaveBeenCalledTimes(2);
    expect(document.querySelector('[data-testid="dashboard"]')).not.toBeNull();
  });
});
