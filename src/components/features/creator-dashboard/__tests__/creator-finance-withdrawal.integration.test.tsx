// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CreatorMetric } from "@/types/creator-dashboard";

const mocks = vi.hoisted(() => ({
  requestWithdrawal: vi.fn(),
  ensureCurrentConsent: vi.fn(),
}));

vi.mock("@/services/creator/creator-dashboard.service", () => ({
  requestWithdrawal: mocks.requestWithdrawal,
}));

vi.mock("@/components/providers/TosConsentProvider", () => ({
  useTosConsent: () => ({ ensureCurrentConsent: mocks.ensureCurrentConsent }),
}));

vi.mock("@/components/ui/responsive-modal", () => ({
  ResponsiveModal: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
  ResponsiveModalContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ResponsiveModalDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  ResponsiveModalHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ResponsiveModalTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectSeparator: () => <hr />,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => <span>Bank Mandiri</span>,
}));

vi.mock("@/components/features/dashboard/shared", () => ({
  SearchToolbar: () => <div data-testid="search-toolbar" />,
}));

const metrics: CreatorMetric = {
  availableJobsCount: 0,
  activeJobsCount: 0,
  pendingSubmissionsCount: 0,
  balance: 500_000,
  pendingPayouts: 0,
  validatedViewsCount: 0,
  activeRateCardsCount: 0,
  negotiationOrdersCount: 0,
  escrowBalance: 0,
  totalEarnings: 500_000,
  thisMonthEarnings: 500_000,
  campaignEarnings: 500_000,
  rateCardEarnings: 0,
};

let root: Root | undefined;
let host: HTMLDivElement;

async function renderFinance() {
  const { KeuanganView } = await import("../KeuanganView");
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(<KeuanganView metrics={metrics} initialTransactions={[]} />));
}

function button(label: string) {
  return [...document.querySelectorAll("button")].find((node) =>
    node.textContent?.includes(label)
  ) as HTMLButtonElement;
}

async function setInput(placeholder: string, value: string) {
  const node = document.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(node, value);
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function enterConfirmation() {
  await act(async () => button("Ajukan Penarikan").click());
  await setInput("Masukkan nomor rekening bank...", "1234567890");
  await setInput("Contoh: ANDI SURYA", "ANDI SURYA");
  await setInput("0", "100000");
  await act(async () => button("Lanjutkan").click());
}

async function confirmWithdrawal() {
  await act(async () => button("Konfirmasi & Ajukan").click());
}

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  mocks.ensureCurrentConsent.mockResolvedValue(true);
  vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("11111111-1111-4111-8111-111111111111");
});

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  vi.restoreAllMocks();
});

describe("creator manual withdrawal request", () => {
  it("keeps confirmation and request key when consent preflight rejects", async () => {
    mocks.ensureCurrentConsent.mockResolvedValue(false);
    await renderFinance();
    await enterConfirmation();
    await confirmWithdrawal();

    expect(mocks.requestWithdrawal).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Konfirmasi Penarikan Saldo");

    mocks.ensureCurrentConsent.mockResolvedValue(true);
    mocks.requestWithdrawal.mockResolvedValue({
      success: true,
      data: {
        withdrawalId: "wd-preflight",
        amount: 100_000,
        status: "requested",
        requestedAt: "2026-08-25T07:00:00.000Z",
        balanceAfter: 400_000,
        transactionId: "tx-preflight",
      },
    });
    await confirmWithdrawal();

    expect(mocks.requestWithdrawal).toHaveBeenCalledWith(expect.objectContaining({
      requestKey: "11111111-1111-4111-8111-111111111111",
    }));
  });

  it("keeps confirmation retryable when consent preflight errors", async () => {
    mocks.ensureCurrentConsent.mockRejectedValue(new Error("ToS unavailable"));
    await renderFinance();
    await enterConfirmation();
    await confirmWithdrawal();

    expect(mocks.requestWithdrawal).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Konfirmasi Penarikan Saldo");
    expect(button("Konfirmasi & Ajukan").disabled).toBe(false);
  });

  it("uses authoritative balanceAfter and shows a pending request, not payout success", async () => {
    mocks.requestWithdrawal.mockResolvedValue({
      success: true,
      data: {
        withdrawalId: "wd-1",
        amount: 100_000,
        status: "requested",
        requestedAt: "2026-08-25T07:00:00.000Z",
        balanceAfter: 123_456,
        transactionId: "tx-1",
      },
    });
    await renderFinance();
    await enterConfirmation();
    await confirmWithdrawal();

    const content = document.body.textContent ?? "";
    expect(content).toContain("Pengajuan Penarikan Terkirim");
    expect(content).toContain("Menunggu Diproses");
    expect(content).toContain("umumnya memproses penarikan dalam 1–2 hari kerja");
    expect(content.replace(/\s/g, "")).toContain("Rp123.456");
    expect(content).not.toContain("dana telah ditransfer");
    expect(content).not.toContain("diteruskan ke sistem bank");
    expect(content).not.toContain("Selesai");

    expect(mocks.requestWithdrawal).toHaveBeenCalledWith(expect.objectContaining({
      amount: 100_000,
      requestKey: "11111111-1111-4111-8111-111111111111",
    }));
    expect(content).toContain("tx-1");
    expect(content).toContain("25 Agu 2026");
  });

  it("keeps failure in confirmation and does not invent a successful transaction", async () => {
    mocks.requestWithdrawal.mockResolvedValue({
      success: false,
      data: null,
      code: "server",
      error: "Status reserve belum pasti. Ulangi dengan requestKey yang sama.",
    });
    await renderFinance();
    await enterConfirmation();
    await confirmWithdrawal();

    const content = document.body.textContent ?? "";
    expect(content).toContain("Status reserve belum pasti. Ulangi dengan requestKey yang sama.");
    expect(content).toContain("Konfirmasi Penarikan Saldo");
    expect(content).not.toContain("Pengajuan Penarikan Terkirim");
    expect(content).not.toContain("tx-1");
  });

  it("reuses requestKey on retry and waits for an accepted receipt before success UI", async () => {
    mocks.requestWithdrawal
      .mockResolvedValueOnce({
        success: false,
        data: null,
        code: "server",
        error: "Gangguan jaringan.",
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          withdrawalId: "wd-2",
          amount: 100_000,
          status: "requested",
          requestedAt: "2026-08-25T07:05:00.000Z",
          balanceAfter: 400_000,
          transactionId: null,
        },
      });
    await renderFinance();
    await enterConfirmation();
    await confirmWithdrawal();
    expect(document.body.textContent).not.toContain("Pengajuan Penarikan Terkirim");

    await confirmWithdrawal();

    expect(mocks.requestWithdrawal).toHaveBeenCalledTimes(2);
    expect(mocks.requestWithdrawal.mock.calls[0][0].requestKey).toBe(
      mocks.requestWithdrawal.mock.calls[1][0].requestKey
    );
    expect(document.body.textContent).toContain("Pengajuan Penarikan Terkirim");
  });
});
