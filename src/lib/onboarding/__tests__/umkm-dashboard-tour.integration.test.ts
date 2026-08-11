import { beforeEach, describe, expect, it, vi } from "vitest";

type DriverConfig = {
  steps: Array<{ element: string; popover: { title: string } }>;
  onDestroyed?: () => void;
  onPopoverRender?: (popover: { footerButtons: { prepend: (button: FakeButton) => void } }) => void;
};

type FakeButton = {
  textContent: string;
  className: string;
  addEventListener: (_event: string, listener: () => void) => void;
  click: () => void;
};

const driverMock = vi.fn();
vi.mock("driver.js", () => ({ driver: driverMock }));

const { destroyUmkmOnboardingTour } = await import("../umkm-driver");
const { startUmkmDashboardTourForSession } = await import("../umkm-dashboard-tour-flow");
const { resetUmkmDashboardTourSessionForTest } = await import("../umkm-dashboard-tour-session");

function installDom(initialAnchors: string[]) {
  const storage = new Map<string, string>();
  const buttons: FakeButton[] = [];
  let anchors = initialAnchors;

  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  });
  vi.stubGlobal("document", {
    querySelector: (selector: string) =>
      anchors.some((anchor) => selector === `[data-onboarding=\"${anchor}\"]`) ? {} : null,
    createElement: () => {
      let listener: (() => void) | undefined;
      const button: FakeButton = {
        textContent: "",
        className: "",
        addEventListener: (_event, nextListener) => { listener = nextListener; },
        click: () => listener?.(),
      };
      buttons.push(button);
      return button;
    },
  });

  return { buttons, setAnchors: (nextAnchors: string[]) => { anchors = nextAnchors; } };
}

function configureDriver() {
  let active = false;
  driverMock.mockImplementation((config: DriverConfig) => ({
    drive: () => { active = true; },
    isActive: () => active,
    destroy: () => {
      active = false;
      config.onDestroyed?.();
    },
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  configureDriver();
  destroyUmkmOnboardingTour();
});

describe("UMKM Dashboard first-run tour", () => {
  it("starts one eligible Dashboard tour with T01 anchors in order", () => {
    installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);

    expect(startUmkmDashboardTourForSession("umkm-1")).toBe(true);
    expect(driverMock).toHaveBeenCalledTimes(1);
    const config = driverMock.mock.calls[0][0] as DriverConfig;
    expect(config.steps.map((step) => step.element)).toEqual([
      '[data-onboarding="dashboard-overview"]',
      '[data-onboarding="campaign-nav"]',
      '[data-onboarding="create-campaign"]',
    ]);
  });

  it("keeps Next and Back sequence declarative in Driver.js step order", () => {
    installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    startUmkmDashboardTourForSession("umkm-2");

    const config = driverMock.mock.calls[0][0] as DriverConfig;
    const visit = [config.steps[0], config.steps[1], config.steps[0]];
    expect(visit.map((step) => step.popover.title)).toEqual([
      "Dashboard UMKM", "Campaign", "Dashboard UMKM",
    ]);
  });

  it("Skip destroys active tour and does not reopen it in this session", () => {
    const { buttons } = installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    startUmkmDashboardTourForSession("umkm-3");
    const config = driverMock.mock.calls[0][0] as DriverConfig;
    config.onPopoverRender?.({ footerButtons: { prepend: (button) => buttons.push(button) } });

    expect(buttons.at(-1)?.textContent).toBe("Lewati");
    buttons.at(-1)?.click();
    expect(startUmkmDashboardTourForSession("umkm-3")).toBe(false);
    expect(driverMock).toHaveBeenCalledTimes(1);
  });

  it("Close cleanup prevents duplicate tours across rerender and remount attempts", () => {
    installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    startUmkmDashboardTourForSession("umkm-4");
    destroyUmkmOnboardingTour();

    expect(startUmkmDashboardTourForSession("umkm-4")).toBe(false);
    expect(driverMock).toHaveBeenCalledTimes(1);
  });

  it("skips missing anchors without crashing Dashboard", () => {
    installDom(["dashboard-overview", "create-campaign"]);
    expect(startUmkmDashboardTourForSession("umkm-5")).toBe(true);

    const config = driverMock.mock.calls[0][0] as DriverConfig;
    expect(config.steps.map((step) => step.element)).toEqual([
      '[data-onboarding="dashboard-overview"]',
      '[data-onboarding="create-campaign"]',
    ]);
  });

  it("retries safely when Dashboard targets render after an initial absence", () => {
    const dom = installDom([]);
    expect(startUmkmDashboardTourForSession("umkm-absent")).toBe(false);

    dom.setAnchors(["dashboard-overview", "campaign-nav", "create-campaign"]);
    expect(startUmkmDashboardTourForSession("umkm-absent")).toBe(true);
    expect(driverMock).toHaveBeenCalledTimes(1);
  });

  it("does not start for an already handled or ineligible session", () => {
    installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    resetUmkmDashboardTourSessionForTest("umkm-6");

    expect(startUmkmDashboardTourForSession("")).toBe(false);
    expect(startUmkmDashboardTourForSession("umkm-6")).toBe(true);
    expect(startUmkmDashboardTourForSession("umkm-6")).toBe(false);
    expect(driverMock).toHaveBeenCalledTimes(1);
  });
});
