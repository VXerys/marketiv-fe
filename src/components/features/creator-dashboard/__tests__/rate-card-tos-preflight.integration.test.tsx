// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  acceptOffer: vi.fn(),
  rejectOffer: vi.fn(),
  getCreatorNegotiationById: vi.fn(),
  getMessagesByConversationId: vi.fn(),
  sendMessage: vi.fn(),
  ensureCurrentConsent: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock("@/services/creator/creator-dashboard.service", () => ({
  acceptOffer: mocks.acceptOffer,
  rejectOffer: mocks.rejectOffer,
  getCreatorNegotiationById: mocks.getCreatorNegotiationById,
  getMessagesByConversationId: mocks.getMessagesByConversationId,
  sendMessage: mocks.sendMessage,
}));
vi.mock("@/services/shared/deliverable.service", () => ({
  getDeliverables: vi.fn(),
  uploadDeliverable: vi.fn(),
}));
vi.mock("@/services/shared/conversation.service", () => ({ markConversationRead: vi.fn() }));
vi.mock("@/services/shared/user-file.service", () => ({
  uploadUserFile: vi.fn(),
  MAX_USER_FILE_BYTES: 10_000_000,
}));
vi.mock("@/components/providers/TosConsentProvider", () => ({
  useTosConsent: () => ({ ensureCurrentConsent: mocks.ensureCurrentConsent }),
}));
vi.mock("@/config/data-source.config", () => ({ DATA_SOURCE_CONFIG: { useMockData: true } }));
vi.mock("@/lib/negotiation/use-negotiation-room-sync", () => ({ useNegotiationRoomSync: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

let root: Root | undefined;
let host: HTMLDivElement;

function button(label: string) {
  return [...document.querySelectorAll("button")].find((node) =>
    node.textContent?.includes(label)
  ) as HTMLButtonElement;
}

async function renderRoom() {
  const { NegosiasiRoomView } = await import("../NegosiasiRoomView");
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(<NegosiasiRoomView conversationId="conversation-1" />));
}

async function acceptOffer() {
  await act(async () => button("Terima Penawaran").click());
}

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.clearAllMocks();
  mocks.getCreatorNegotiationById.mockResolvedValue({
    success: true,
    data: {
      id: "conversation-1",
      conversationId: "conversation-1",
      stage: "offer_pending",
      umkmId: "umkm-1",
      umkmName: "UMKM Satu",
      umkmAvatarUrl: "",
      lastMessage: "Halo",
      lastMessageAt: "2026-09-03T00:00:00.000Z",
      unreadCount: 0,
      isArchived: false,
      offerId: "offer-1",
      offerStatus: "pending",
      projectTitle: "Konten Produk",
      scope: "Satu video",
      deadline: "2026-09-10T00:00:00.000Z",
      finalPrice: 100_000,
      platformFee: 2_000,
      totalAmount: 98_000,
    },
  });
  mocks.getMessagesByConversationId.mockResolvedValue({
    success: true,
    data: [{ id: "message-1", senderRole: "system", content: "Penawaran masuk", createdAt: "2026-09-03T00:00:00.000Z", type: "system" }],
  });
  mocks.acceptOffer.mockResolvedValue({ success: true, data: null });
});

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  vi.restoreAllMocks();
});

describe("creator offer ToS preflight", () => {
  it("does not mutate an offer when consent preflight rejects", async () => {
    const { toast } = await import("sonner");
    mocks.ensureCurrentConsent.mockResolvedValue(false);
    await renderRoom();

    await acceptOffer();

    expect(mocks.acceptOffer).not.toHaveBeenCalled();
    expect(mocks.rejectOffer).not.toHaveBeenCalled();
    expect(button("Terima Penawaran").disabled).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Gagal memverifikasi status persetujuan Syarat & Ketentuan. Coba lagi."
    );
  });

  it("does not mutate an offer when consent preflight errors", async () => {
    const { toast } = await import("sonner");
    mocks.ensureCurrentConsent.mockRejectedValue(new Error("ToS unavailable"));
    await renderRoom();

    await acceptOffer();

    expect(mocks.acceptOffer).not.toHaveBeenCalled();
    expect(button("Terima Penawaran").disabled).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Gagal memverifikasi status persetujuan Syarat & Ketentuan. Coba lagi."
    );
  });

  it("accepts only after consent preflight succeeds", async () => {
    mocks.ensureCurrentConsent.mockResolvedValue(true);
    await renderRoom();

    await acceptOffer();

    expect(mocks.ensureCurrentConsent).toHaveBeenCalledOnce();
    expect(mocks.acceptOffer).toHaveBeenCalledWith("offer-1");
  });
});
