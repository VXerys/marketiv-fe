// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CreatorActiveWork } from "@/types/creator-dashboard";
import { canUnclaimCreatorActiveWork } from "@/lib/creator-active-work";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  unclaimCampaign: vi.fn(),
  submitProof: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("next/link", () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock("next/image", () => ({ default: () => <span data-testid="next-image" /> }));
vi.mock("@/services/creator/creator-dashboard.service", () => ({
  unclaimCampaign: mocks.unclaimCampaign,
  submitProof: mocks.submitProof,
}));
vi.mock("sonner", () => ({ toast: { error: mocks.toastError, success: mocks.toastSuccess } }));
vi.mock("@/components/ui/responsive-modal", () => ({
  ResponsiveModal: ({ open, children }: { open: boolean; children: React.ReactNode }) => open ? <div>{children}</div> : null,
  ResponsiveModalContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ResponsiveModalDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  ResponsiveModalFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ResponsiveModalHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ResponsiveModalTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));
vi.mock("@/components/features/dashboard/shared", () => ({
  DashboardButton: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
  DashboardStateCard: ({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) => <section><h2>{title}</h2>{actionLabel && <button onClick={onAction}>{actionLabel}</button>}</section>,
}));

const baseWork: CreatorActiveWork = {
  id: "claim-1",
  campaignId: "campaign-1",
  title: "Campaign Aman",
  brandName: "Brand Aman",
  brandAvatar: "",
  brief: "Brief",
  ratePerThousandViews: 10000,
  status: "claimed",
  claimedAt: "2026-08-10T00:00:00.000Z",
  deadline: "2026-09-01T00:00:00.000Z",
  platform: "tiktok",
};

let root: Root | undefined;
let host: HTMLDivElement;

async function render(work: CreatorActiveWork | null) {
  const { ActiveWorkDetailView } = await import("../ActiveWorkDetailView");
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(<ActiveWorkDetailView work={work} />));
}

const button = (label: string) => Array.from(document.querySelectorAll("button")).find((node) => node.textContent?.includes(label)) as HTMLButtonElement;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  mocks.unclaimCampaign.mockResolvedValue({ success: true, data: null });
  mocks.submitProof.mockResolvedValue({ success: true, data: null });
});

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
});

describe("Creator Active Work unclaim eligibility", () => {
  it("uses one fail-closed rule for list and detail states", () => {
    expect(canUnclaimCreatorActiveWork(baseWork)).toBe(true);
    expect(canUnclaimCreatorActiveWork({ ...baseWork, submissionId: "submission-1" })).toBe(false);
    expect(canUnclaimCreatorActiveWork({ ...baseWork, status: "submitted" })).toBe(false);
    expect(canUnclaimCreatorActiveWork({ ...baseWork, submissionStatus: "pending" })).toBe(false);
    expect(canUnclaimCreatorActiveWork({ ...baseWork, status: "approved" })).toBe(false);
    expect(canUnclaimCreatorActiveWork({ ...baseWork, status: "rejected" })).toBe(false);
    expect(canUnclaimCreatorActiveWork({ ...baseWork, status: "expired" })).toBe(false);
    expect(canUnclaimCreatorActiveWork({ ...baseWork, status: undefined as never })).toBe(false);
  });

  it("shows detail Unclaim only for a claimed work without a submission", async () => {
    await render(baseWork);
    expect(button("Batalkan pekerjaan")).toBeTruthy();
  });

  it.each([
    { ...baseWork, submissionId: "submission-1" },
    { ...baseWork, status: "submitted" as const },
    { ...baseWork, submissionStatus: "pending" as const },
    { ...baseWork, status: "approved" as const },
    { ...baseWork, status: "rejected" as const },
    { ...baseWork, status: "expired" as const },
  ])("hides detail Unclaim for ineligible work", async (work) => {
    await render(work);
    expect(button("Batalkan pekerjaan")).toBeUndefined();
  });
});

describe("Creator Active Work detail unclaim interaction", () => {
  it("requires confirmation and cancellation does not call service", async () => {
    await render(baseWork);
    await act(async () => button("Batalkan pekerjaan")?.click());
    expect(document.body.textContent).toContain("Batalkan pekerjaan ini?");
    await act(async () => button("Kembali")?.click());
    expect(mocks.unclaimCampaign).not.toHaveBeenCalled();
  });

  it("calls P5 facade once, then replaces stale detail with active-work list", async () => {
    await render(baseWork);
    await act(async () => button("Batalkan pekerjaan")?.click());
    await act(async () => button("Batalkan Pekerjaan")?.click());

    expect(mocks.unclaimCampaign).toHaveBeenCalledOnce();
    expect(mocks.unclaimCampaign).toHaveBeenCalledWith("claim-1");
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/kreator/pekerjaan-aktif");
  });

  it("prevents repeated confirmation while trusted unclaim is pending", async () => {
    let resolve!: (result: { success: boolean; data: null }) => void;
    mocks.unclaimCampaign.mockReturnValue(new Promise((done) => { resolve = done; }));
    await render(baseWork);
    await act(async () => button("Batalkan pekerjaan")?.click());
    await act(async () => button("Batalkan Pekerjaan")?.click());
    await act(async () => button("Batalkan Pekerjaan")?.click());
    expect(mocks.unclaimCampaign).toHaveBeenCalledOnce();
    await act(async () => resolve({ success: true, data: null }));
  });

  it.each(["not_found", "validation"] as const)("keeps stale %s failure out of success navigation", async (code) => {
    mocks.unclaimCampaign.mockResolvedValue({ success: false, data: null, code, error: "Status pekerjaan sudah berubah." });
    await render(baseWork);
    await act(async () => button("Batalkan pekerjaan")?.click());
    await act(async () => button("Batalkan Pekerjaan")?.click());

    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledWith("Status pekerjaan sudah berubah.");
    expect(document.body.textContent).toContain("Batalkan pekerjaan ini?");
  });

  it("does not retry mutation when post-success navigation throws", async () => {
    mocks.replace.mockImplementation(() => { throw new Error("navigation failed"); });
    await render(baseWork);
    await act(async () => button("Batalkan pekerjaan")?.click());
    await act(async () => button("Batalkan Pekerjaan")?.click());

    expect(mocks.unclaimCampaign).toHaveBeenCalledOnce();
    expect(document.body.textContent).toContain("Pekerjaan dibatalkan");
  });
});
