import { beforeEach, describe, expect, it, vi } from "vitest";

const destroyMock = vi.fn();
const startMock = vi.fn(() => true);
const hasPendingMock = vi.fn(() => true);
const refs: Array<{ current: unknown }> = [];
let refIndex = 0;
let pendingEffect: (() => void | (() => void)) | undefined;

vi.mock("react", () => ({
  useEffect: (effect: () => void | (() => void)) => { pendingEffect = effect; },
  useRef: <T,>(initialValue: T) => {
    const ref = refs[refIndex] ?? { current: initialValue };
    refs[refIndex] = ref;
    refIndex += 1;
    return ref as { current: T };
  },
}));
vi.mock("@/lib/onboarding/umkm-driver", () => ({ destroyUmkmOnboardingTour: destroyMock }));
vi.mock("@/lib/onboarding/umkm-dashboard-tour-flow", () => ({
  startUmkmCampaignTourForSession: startMock,
}));
vi.mock("@/lib/onboarding/umkm-dashboard-tour-session", () => ({
  hasPendingUmkmCampaignHandoff: hasPendingMock,
}));

const { UmkmCampaignTour } = await import("../../../components/features/umkm-dashboard/create-campaign/UmkmCampaignTour");

function render(userId: string, previousCleanup?: () => void) {
  refIndex = 0;
  UmkmCampaignTour({ userId });
  previousCleanup?.();
  return pendingEffect?.();
}

beforeEach(() => {
  vi.clearAllMocks();
  refs.length = 0;
  refIndex = 0;
  pendingEffect = undefined;
  startMock.mockClear();
  destroyMock.mockClear();
  hasPendingMock.mockClear();
});

describe("UMKM Campaign onboarding account transition", () => {
  it("does not let User A's mounted Campaign tour suppress User B", async () => {
    const cleanupA = render("user-a") as (() => void);
    expect(startMock).toHaveBeenCalledExactlyOnceWith("user-a");

    const cleanupB = render("user-b", cleanupA) as (() => void);
    await Promise.resolve();

    expect(startMock).toHaveBeenNthCalledWith(2, "user-b");
    expect(destroyMock).toHaveBeenCalledOnce();
    cleanupB();
    await Promise.resolve();
    expect(destroyMock).toHaveBeenCalledTimes(2);
  });
});
