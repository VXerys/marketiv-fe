// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getTosStatus: vi.fn(),
  acceptCurrentTos: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/components/providers/AuthProvider", () => ({
  useAuth: () => ({ refresh: mocks.refresh }),
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

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
});

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  mocks.getTosStatus.mockResolvedValue({
    success: true,
    data: { currentVersion: "v3.1", acceptedVersion: null, acceptedAt: null, needsConsent: true },
  });
  mocks.acceptCurrentTos.mockResolvedValue({
    success: true,
    data: { success: true, alreadyAccepted: false, tos_version: "v3.1" },
  });
  mocks.refresh.mockResolvedValue({
    success: true,
    data: { tosVersion: "v3.1", tosAcceptedAt: "2026-09-03T00:00:00.000Z" },
  });
});

describe("TosConsentGate", () => {
  it.each([
    { acceptedVersion: null, acceptedAt: null },
    { acceptedVersion: "v3.0", acceptedAt: "2026-08-01T00:00:00.000Z" },
  ])("blocks new or outdated consent until explicit checkbox approval", async ({ acceptedVersion, acceptedAt }) => {
    mocks.getTosStatus.mockResolvedValueOnce({
      success: true,
      data: { currentVersion: "v3.1", acceptedVersion, acceptedAt, needsConsent: true },
    });
    const { TosConsentGate } = await import("@/components/providers/TosConsentProvider");

    await render(<TosConsentGate><p data-testid="dashboard">Dashboard</p></TosConsentGate>);

    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="dashboard"]')).toBeNull();
    expect(button("Setujui & Lanjutkan").disabled).toBe(true);
    expect(document.querySelector('a[href="/syarat-ketentuan"]')?.getAttribute("target")).toBe("_blank");

    await click(document.querySelector('[role="checkbox"]') as HTMLElement);
    expect(button("Setujui & Lanjutkan").disabled).toBe(false);
  });

  it("accepts current server version then unlocks only after authoritative refresh", async () => {
    const { TosConsentGate } = await import("@/components/providers/TosConsentProvider");
    await render(<TosConsentGate><p data-testid="dashboard">Dashboard</p></TosConsentGate>);

    await click(document.querySelector('[role="checkbox"]') as HTMLElement);
    await click(button("Setujui & Lanjutkan"));

    expect(mocks.acceptCurrentTos).toHaveBeenCalledWith("v3.1");
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(document.querySelector('[data-testid="dashboard"]')).not.toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("passes through when backend reports current consent", async () => {
    mocks.getTosStatus.mockResolvedValueOnce({
      success: true,
      data: { currentVersion: "v3.1", acceptedVersion: "v3.1", acceptedAt: "2026-09-01T00:00:00.000Z", needsConsent: false },
    });
    const { TosConsentGate } = await import("@/components/providers/TosConsentProvider");
    await render(<TosConsentGate><p data-testid="dashboard">Dashboard</p></TosConsentGate>);

    expect(document.querySelector('[data-testid="dashboard"]')).not.toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("keeps dashboard blocked after status failure until retry succeeds", async () => {
    mocks.getTosStatus
      .mockResolvedValueOnce({ success: false, data: null, error: "Server tidak tersedia" })
      .mockResolvedValueOnce({
        success: true,
        data: { currentVersion: "v3.1", acceptedVersion: "v3.1", acceptedAt: "2026-09-01T00:00:00.000Z", needsConsent: false },
      });
    const { TosConsentGate } = await import("@/components/providers/TosConsentProvider");
    await render(<TosConsentGate><p data-testid="dashboard">Dashboard</p></TosConsentGate>);

    expect(document.querySelector('[data-testid="dashboard"]')).toBeNull();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Server tidak tersedia");
    await click(button("Coba Lagi"));

    expect(mocks.getTosStatus).toHaveBeenCalledTimes(2);
    expect(document.querySelector('[data-testid="dashboard"]')).not.toBeNull();
  });

  it("allows accept retry after accept failure", async () => {
    mocks.acceptCurrentTos
      .mockResolvedValueOnce({ success: false, data: null, error: "Gagal menyimpan persetujuan" })
      .mockResolvedValueOnce({ success: true, data: { success: true, alreadyAccepted: false, tos_version: "v3.1" } });
    const { TosConsentGate } = await import("@/components/providers/TosConsentProvider");
    await render(<TosConsentGate><p data-testid="dashboard">Dashboard</p></TosConsentGate>);

    await click(document.querySelector('[role="checkbox"]') as HTMLElement);
    await click(button("Setujui & Lanjutkan"));
    expect(document.querySelector('[role="alert"]')?.textContent).toContain("Gagal menyimpan persetujuan");

    await click(button("Setujui & Lanjutkan"));
    expect(mocks.acceptCurrentTos).toHaveBeenCalledTimes(2);
    expect(document.querySelector('[data-testid="dashboard"]')).not.toBeNull();
  });

  it("keeps gate closed when refresh returns stale consent fields", async () => {
    mocks.refresh.mockResolvedValueOnce({ success: true, data: { tosVersion: "v3.0", tosAcceptedAt: null } });
    const { TosConsentGate } = await import("@/components/providers/TosConsentProvider");
    await render(<TosConsentGate><p data-testid="dashboard">Dashboard</p></TosConsentGate>);

    await click(document.querySelector('[role="checkbox"]') as HTMLElement);
    await click(button("Setujui & Lanjutkan"));

    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(document.querySelector('[data-testid="dashboard"]')).toBeNull();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("belum bisa memverifikasi");
  });
});
