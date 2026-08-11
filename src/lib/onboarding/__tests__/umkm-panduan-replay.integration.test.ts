import { beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../constants/routes";

type DriverConfig = { onDestroyed?: () => void };

const driverMock = vi.fn();
vi.mock("driver.js", () => ({ driver: driverMock }));

const { destroyUmkmOnboardingTour } = await import("../umkm-driver");
const {
  beginUmkmCampaignHandoffForSession,
  replayUmkmDashboardOnboarding,
  startUmkmCampaignTourForSession,
  startUmkmDashboardTourForSession,
} = await import("../umkm-dashboard-tour-flow");
const {
  getUmkmDashboardTourPhase,
  markUmkmDashboardTourHandled,
} = await import("../umkm-dashboard-tour-session");
const { umkmCampaignTourSteps } = await import("../umkm-campaign-tour");

function installDom(anchors = ["dashboard-overview", "campaign-nav", "create-campaign"]) {
  const storage = new Map<string, string>();
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
    createElement: () => ({
      type: "button",
      className: "",
      textContent: "",
      addEventListener: vi.fn(),
    }),
  });
}

function configureDriver() {
  let active = false;
  driverMock.mockImplementation((config: DriverConfig) => ({
    drive: () => { active = true; },
    isActive: () => active,
    destroy: () => { active = false; config.onDestroyed?.(); },
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  installDom();
  configureDriver();
  destroyUmkmOnboardingTour();
});

describe("UMKM Panduan onboarding replay", () => {
  it("keeps a normal Panduan visit side-effect free", () => {
    expect(startUmkmDashboardTourForSession("panduan-visit")).toBe(true);
    markUmkmDashboardTourHandled("panduan-visit");
    const navigate = vi.fn();

    expect(getUmkmDashboardTourPhase("panduan-visit")).toBe("handled");
    expect(navigate).not.toHaveBeenCalled();
    expect(driverMock).toHaveBeenCalledOnce();
  });

  it("prepares handled replay before one canonical Dashboard navigation", () => {
    expect(startUmkmDashboardTourForSession("panduan-handled")).toBe(true);
    markUmkmDashboardTourHandled("panduan-handled");
    const navigate = vi.fn(() => {
      expect(getUmkmDashboardTourPhase("panduan-handled")).toBe("dashboard-replay");
    });

    expect(replayUmkmDashboardOnboarding("panduan-handled", navigate)).toBe(true);
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(routes.dashboardUmkm);
  });

  it("restarts Dashboard once after Skip or handled completion", () => {
    expect(startUmkmDashboardTourForSession("panduan-skip")).toBe(true);
    destroyUmkmOnboardingTour();
    expect(getUmkmDashboardTourPhase("panduan-skip")).toBe("handled");

    expect(replayUmkmDashboardOnboarding("panduan-skip", vi.fn())).toBe(true);
    expect(startUmkmDashboardTourForSession("panduan-skip")).toBe(true);
    expect(startUmkmDashboardTourForSession("panduan-skip")).toBe(false);
    expect(driverMock).toHaveBeenCalledTimes(2);
  });

  it("restarts from Dashboard after Campaign completion and retains T04 handoff", () => {
    expect(startUmkmDashboardTourForSession("panduan-campaign")).toBe(true);
    expect(beginUmkmCampaignHandoffForSession("panduan-campaign")).toBe(true);
    expect(startUmkmCampaignTourForSession("panduan-campaign")).toBe(false);
    expect(getUmkmDashboardTourPhase("panduan-campaign")).toBe("campaign-handoff");

    expect(replayUmkmDashboardOnboarding("panduan-campaign", vi.fn())).toBe(true);
    expect(getUmkmDashboardTourPhase("panduan-campaign")).toBe("dashboard-replay");
    expect(startUmkmDashboardTourForSession("panduan-campaign")).toBe(true);
    expect(beginUmkmCampaignHandoffForSession("panduan-campaign")).toBe(true);
    expect(getUmkmDashboardTourPhase("panduan-campaign")).toBe("campaign-handoff");
  });

  it("makes rapid replay requests idempotent and keeps Rate Card isolated", () => {
    expect(startUmkmDashboardTourForSession("panduan-rapid")).toBe(true);
    markUmkmDashboardTourHandled("panduan-rapid");
    const navigate = vi.fn();

    expect(replayUmkmDashboardOnboarding("panduan-rapid", navigate)).toBe(true);
    expect(replayUmkmDashboardOnboarding("panduan-rapid", navigate)).toBe(false);
    expect(navigate).toHaveBeenCalledOnce();
    expect(JSON.stringify(umkmCampaignTourSteps)).not.toContain("Rate Card");
  });
});
