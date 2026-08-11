import { beforeEach, describe, expect, it, vi } from "vitest";

type DriverConfig = {
  onDoneClick?: (_element: unknown, _step: unknown, opts: { driver: { destroy: () => void } }) => void;
  onPopoverRender?: (popover: { footerButtons: { prepend: (button: FakeButton) => void } }) => void;
};

type FakeButton = {
  textContent: string;
  addEventListener: (_event: string, listener: () => void) => void;
  click: () => void;
};

const driverMock = vi.fn();
vi.mock("driver.js", () => ({ driver: driverMock }));

const { destroyUmkmOnboardingTour } = await import("../umkm-driver");
const {
  navigateUmkmCampaignForOnboarding,
  replayUmkmDashboardOnboarding,
  startUmkmCampaignTourForSession,
  startUmkmDashboardTourForSession,
} = await import("../umkm-dashboard-tour-flow");
const {
  getUmkmOnboardingStorageKeyForTest,
  readUmkmOnboardingPersistence,
  resetUmkmOnboardingPersistenceForTest,
  UMKM_ONBOARDING_VERSION,
  writeUmkmOnboardingPersistence,
} = await import("../umkm-onboarding-persistence");
const { resetUmkmDashboardTourSessionForTest } = await import("../umkm-dashboard-tour-session");

function installDom(
  anchors = ["dashboard-overview", "campaign-nav", "create-campaign", "campaign-create-heading"],
  options: { getThrows?: boolean; setThrows?: boolean } = {}
) {
  const local = new Map<string, string>();
  const session = new Map<string, string>();
  const buttons: FakeButton[] = [];
  const localStorage = {
    getItem: vi.fn((key: string) => {
      if (options.getThrows) throw new Error("storage unavailable");
      return local.get(key) ?? null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      if (options.setThrows) throw new Error("storage unavailable");
      local.set(key, value);
    }),
    removeItem: vi.fn((key: string) => local.delete(key)),
  };
  vi.stubGlobal("window", {
    localStorage,
    sessionStorage: {
      getItem: (key: string) => session.get(key) ?? null,
      setItem: (key: string, value: string) => session.set(key, value),
      removeItem: (key: string) => session.delete(key),
    },
  });
  vi.stubGlobal("document", {
    querySelector: (selector: string) =>
      anchors.some((anchor) => selector === `[data-onboarding=\"${anchor}\"]`) ? {} : null,
    createElement: () => {
      let listener: (() => void) | undefined;
      const button: FakeButton = {
        textContent: "",
        addEventListener: (_event, nextListener) => { listener = nextListener; },
        click: () => listener?.(),
      };
      buttons.push(button);
      return button;
    },
  });
  return { local, localStorage, buttons };
}

function configureDriver() {
  let active = false;
  driverMock.mockImplementation(() => ({
    drive: () => { active = true; },
    isActive: () => active,
    destroy: () => { active = false; },
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  installDom();
  configureDriver();
  destroyUmkmOnboardingTour();
});

describe("UMKM versioned onboarding persistence", () => {
  it("accepts fresh user, scopes state by user, and avoids duplicate transition writes", () => {
    const { localStorage } = installDom();

    expect(startUmkmDashboardTourForSession("user-a")).toBe(true);
    expect(readUmkmOnboardingPersistence("user-a")).toEqual({
      version: UMKM_ONBOARDING_VERSION, status: "in-progress", phase: "dashboard",
    });
    expect(startUmkmDashboardTourForSession("user-a")).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    expect(startUmkmDashboardTourForSession("user-b")).toBe(true);
  });

  it("does not auto-start current-version completed or skipped onboarding after remount", () => {
    installDom();
    writeUmkmOnboardingPersistence("completed", "completed", "campaign");
    writeUmkmOnboardingPersistence("skipped", "skipped", "dashboard");

    expect(startUmkmDashboardTourForSession("completed")).toBe(false);
    expect(startUmkmDashboardTourForSession("skipped")).toBe(false);
    expect(driverMock).not.toHaveBeenCalled();
  });

  it("resumes Dashboard once and Campaign once without navigation after runtime refresh", () => {
    installDom();
    writeUmkmOnboardingPersistence("dashboard", "in-progress", "dashboard");
    expect(startUmkmDashboardTourForSession("dashboard")).toBe(true);
    resetUmkmDashboardTourSessionForTest("dashboard");
    expect(startUmkmDashboardTourForSession("dashboard")).toBe(true);
    expect(startUmkmDashboardTourForSession("dashboard")).toBe(false);

    writeUmkmOnboardingPersistence("campaign", "in-progress", "campaign");
    const navigate = vi.fn();
    expect(startUmkmCampaignTourForSession("campaign")).toBe(true);
    expect(startUmkmCampaignTourForSession("campaign")).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("persists Dashboard-to-Campaign handoff at its domain boundary", () => {
    installDom();
    expect(startUmkmDashboardTourForSession("handoff")).toBe(true);
    const navigate = vi.fn();
    navigateUmkmCampaignForOnboarding("handoff", navigate);

    expect(readUmkmOnboardingPersistence("handoff")).toEqual({
      version: UMKM_ONBOARDING_VERSION, status: "in-progress", phase: "campaign",
    });
    expect(navigate).toHaveBeenCalledOnce();
  });

  it("writes skipped only for explicit Skip, then lets replay run without erasing history", () => {
    const { buttons } = installDom();
    expect(startUmkmDashboardTourForSession("skip")).toBe(true);
    const config = driverMock.mock.calls[0][0] as DriverConfig;
    config.onPopoverRender?.({ footerButtons: { prepend: (button) => buttons.push(button) } });
    buttons.at(-1)?.click();

    expect(readUmkmOnboardingPersistence("skip")?.status).toBe("skipped");
    expect(replayUmkmDashboardOnboarding("skip", vi.fn())).toBe(true);
    expect(readUmkmOnboardingPersistence("skip")?.status).toBe("skipped");
    expect(startUmkmDashboardTourForSession("skip")).toBe(true);
  });

  it("writes completed only at real Campaign completion, including after replay", () => {
    installDom();
    writeUmkmOnboardingPersistence("complete", "skipped", "dashboard");
    expect(replayUmkmDashboardOnboarding("complete", vi.fn())).toBe(true);
    expect(startUmkmDashboardTourForSession("complete")).toBe(true);
    navigateUmkmCampaignForOnboarding("complete", vi.fn());
    expect(startUmkmCampaignTourForSession("complete")).toBe(true);

    const config = driverMock.mock.calls.at(-1)?.[0] as DriverConfig;
    const destroy = vi.fn();
    config.onDoneClick?.(undefined, undefined, { driver: { destroy } });
    expect(destroy).toHaveBeenCalledOnce();
    expect(readUmkmOnboardingPersistence("complete")).toEqual({
      version: UMKM_ONBOARDING_VERSION, status: "completed", phase: "campaign",
    });
  });

  it("rejects malformed, structurally invalid, old, and future payloads without suppressing onboarding", () => {
    const { local } = installDom();
    const cases = [
      "{bad json",
      JSON.stringify({ version: "1", status: "completed" }),
      JSON.stringify({ version: UMKM_ONBOARDING_VERSION, status: "unknown", phase: "dashboard" }),
      JSON.stringify({ version: UMKM_ONBOARDING_VERSION - 1, status: "completed", phase: "dashboard" }),
      JSON.stringify({ version: UMKM_ONBOARDING_VERSION + 1, status: "completed", phase: "dashboard" }),
    ];

    for (const [index, raw] of cases.entries()) {
      const userId = `invalid-${index}`;
      local.set(getUmkmOnboardingStorageKeyForTest(userId), raw);
      expect(readUmkmOnboardingPersistence(userId)).toBeNull();
      expect(startUmkmDashboardTourForSession(userId)).toBe(true);
      resetUmkmDashboardTourSessionForTest(userId);
      destroyUmkmOnboardingTour();
    }
  });

  it("continues safely when localStorage reads or writes throw", () => {
    installDom(undefined, { getThrows: true });
    expect(readUmkmOnboardingPersistence("read-failure")).toBeNull();
    expect(startUmkmDashboardTourForSession("read-failure")).toBe(true);

    destroyUmkmOnboardingTour();
    installDom(undefined, { setThrows: true });
    expect(startUmkmDashboardTourForSession("write-failure")).toBe(true);
    expect(startUmkmDashboardTourForSession("write-failure")).toBe(false);
  });

  it("keeps persistence limited to UMKM Dashboard-to-Campaign scope", () => {
    installDom();
    resetUmkmOnboardingPersistenceForTest("rate-card");
    expect(getUmkmOnboardingStorageKeyForTest("rate-card")).toBe("marketiv:onboarding:umkm:rate-card");
    expect(getUmkmOnboardingStorageKeyForTest("rate-card")).not.toContain("rate-card-onboarding");
  });
});
