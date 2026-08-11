import { beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../constants/routes";

type DriverConfig = {
  steps: Array<{ element: string; popover: { title: string; description: string } }>;
  onDestroyed?: () => void;
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
  beginUmkmCampaignHandoffForSession,
  navigateUmkmCampaignForOnboarding,
  startUmkmCampaignTourForSession,
  startUmkmDashboardTourForSession,
} = await import("../umkm-dashboard-tour-flow");
const {
  getUmkmDashboardTourPhase,
  resetUmkmDashboardTourSessionForTest,
} = await import("../umkm-dashboard-tour-session");
const { umkmCampaignTourSteps } = await import("../umkm-campaign-tour");

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

function beginDashboardHandoff(userId: string) {
  expect(startUmkmDashboardTourForSession(userId)).toBe(true);
  expect(beginUmkmCampaignHandoffForSession(userId)).toBe(true);
}

beforeEach(() => {
  vi.clearAllMocks();
  configureDriver();
  destroyUmkmOnboardingTour();
});

describe("UMKM Dashboard to Campaign onboarding handoff", () => {
  it("records handoff before exactly one existing Campaign route request", () => {
    installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    expect(startUmkmDashboardTourForSession("handoff-1")).toBe(true);
    const navigate = vi.fn();
    navigateUmkmCampaignForOnboarding("handoff-1", navigate);

    expect(getUmkmDashboardTourPhase("handoff-1")).toBe("campaign-handoff");
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(routes.umkmCreateCampaign);
    expect(routes.umkmCreateCampaign).toBe("/dashboard/umkm/campaign/buat");
  });

  it("resumes Campaign Driver once after destination anchor mounts", () => {
    installDom(["dashboard-overview", "campaign-nav", "create-campaign", "campaign-create-heading"]);
    beginDashboardHandoff("handoff-2");

    expect(startUmkmCampaignTourForSession("handoff-2")).toBe(true);
    expect(driverMock).toHaveBeenCalledTimes(2);
    expect((driverMock.mock.calls[1][0] as DriverConfig).steps.map((step) => step.element)).toEqual([
      '[data-onboarding="campaign-create-heading"]',
    ]);
    expect(getUmkmDashboardTourPhase("handoff-2")).toBe("campaign-resumed");
  });

  it("waits safely for delayed Campaign anchor without duplicate Driver", () => {
    const dom = installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    beginDashboardHandoff("handoff-delayed");

    expect(startUmkmCampaignTourForSession("handoff-delayed")).toBe(false);
    expect(getUmkmDashboardTourPhase("handoff-delayed")).toBe("campaign-handoff");

    dom.setAnchors(["campaign-create-heading"]);
    expect(startUmkmCampaignTourForSession("handoff-delayed")).toBe(true);
    expect(startUmkmCampaignTourForSession("handoff-delayed")).toBe(false);
    expect(driverMock).toHaveBeenCalledTimes(2);
  });

  it("fails safely when Campaign target never exists", () => {
    installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    beginDashboardHandoff("handoff-missing");

    expect(startUmkmCampaignTourForSession("handoff-missing")).toBe(false);
    expect(getUmkmDashboardTourPhase("handoff-missing")).toBe("campaign-handoff");
    expect(driverMock).toHaveBeenCalledTimes(1);
  });

  it("prevents rerender, remount, and refresh-like duplicate resume", () => {
    installDom(["dashboard-overview", "campaign-nav", "create-campaign", "campaign-create-heading"]);
    beginDashboardHandoff("handoff-rerender");

    expect(startUmkmCampaignTourForSession("handoff-rerender")).toBe(true);
    expect(startUmkmCampaignTourForSession("handoff-rerender")).toBe(false);
    expect(startUmkmCampaignTourForSession("handoff-rerender")).toBe(false);
    expect(driverMock).toHaveBeenCalledTimes(2);
  });

  it("Skip and Close handle Campaign session without navigation or reopen", () => {
    const { buttons } = installDom(["dashboard-overview", "campaign-nav", "create-campaign", "campaign-create-heading"]);
    beginDashboardHandoff("handoff-skip");
    expect(startUmkmCampaignTourForSession("handoff-skip")).toBe(true);
    const config = driverMock.mock.calls[1][0] as DriverConfig;
    config.onPopoverRender?.({ footerButtons: { prepend: (button) => buttons.push(button) } });

    expect(buttons.at(-1)?.textContent).toBe("Lewati");
    buttons.at(-1)?.click();
    expect(getUmkmDashboardTourPhase("handoff-skip")).toBe("handled");
    expect(startUmkmCampaignTourForSession("handoff-skip")).toBe(false);

    beginDashboardHandoff("handoff-close");
    expect(startUmkmCampaignTourForSession("handoff-close")).toBe(true);
    destroyUmkmOnboardingTour();
    expect(getUmkmDashboardTourPhase("handoff-close")).toBe("handled");
    expect(startUmkmCampaignTourForSession("handoff-close")).toBe(false);
  });

  it("keeps Rate Card routes and steps out of Campaign handoff", () => {
    expect(routes.umkmCreateCampaign).not.toContain("rate-card");
    expect(JSON.stringify(umkmCampaignTourSteps)).not.toContain("Rate Card");
  });

  it("does not re-open an already handled Dashboard session", () => {
    installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    beginDashboardHandoff("handoff-reset");
    resetUmkmDashboardTourSessionForTest("handoff-reset");
    expect(getUmkmDashboardTourPhase("handoff-reset")).toBeNull();
  });
});
