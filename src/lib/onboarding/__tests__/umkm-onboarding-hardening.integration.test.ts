import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DriverConfig = {
  animate: boolean;
  allowClose: boolean;
  allowKeyboardControl: boolean;
  smoothScroll: boolean;
  steps: Array<{ element: string }>;
  onDestroyed?: () => void;
  onPopoverRender?: (popover: FakePopover) => void;
};

type FakeButton = {
  type: string;
  className: string;
  textContent: string;
  attributes: Map<string, string>;
  setAttribute: (name: string, value: string) => void;
  addEventListener: (_event: string, listener: () => void) => void;
  click: () => void;
};

type FakePopover = {
  closeButton: FakeButton;
  footerButtons: { prepend: (button: FakeButton) => void };
};

class FakeMutationObserver {
  static instances: FakeMutationObserver[] = [];
  disconnected = false;
  constructor(private readonly callback: () => void) {
    FakeMutationObserver.instances.push(this);
  }
  observe() {}
  disconnect() { this.disconnected = true; }
  trigger() { this.callback(); }
}

const driverMock = vi.fn();
vi.mock("driver.js", () => ({ driver: driverMock }));

const { destroyUmkmOnboardingTour, startUmkmOnboardingTour } = await import("../umkm-driver");
const { startUmkmDashboardTourForSession } = await import("../umkm-dashboard-tour-flow");
const { getUmkmDashboardTourPhase } = await import("../umkm-dashboard-tour-session");
const { umkmDashboardTourSteps } = await import("../umkm-dashboard-tour");

function button(): FakeButton {
  let listener: (() => void) | undefined;
  const attributes = new Map<string, string>();
  return {
    type: "",
    className: "",
    textContent: "",
    attributes,
    setAttribute: (name, value) => attributes.set(name, value),
    addEventListener: (_event, nextListener) => { listener = nextListener; },
    click: () => listener?.(),
  };
}

function installDom(anchors: string[], reducedMotion = false) {
  const activeElement = {
    isConnected: true,
    focus: vi.fn(),
  };
  let currentAnchors = anchors;
  const storage = new Map<string, string>();
  const buttons: FakeButton[] = [];
  vi.stubGlobal("HTMLElement", class {});
  vi.stubGlobal("MutationObserver", FakeMutationObserver);
  vi.stubGlobal("window", {
    matchMedia: vi.fn().mockReturnValue({ matches: reducedMotion }),
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
      removeItem: (key: string) => { storage.delete(key); },
    },
  });
  vi.stubGlobal("document", {
    body: {},
    activeElement,
    querySelector: (selector: string) => currentAnchors.includes(selector.match(/"(.+)"/)?.[1] ?? "") ? {} : null,
    querySelectorAll: (selector: string) => {
      const anchor = selector.match(/"(.+)"/)?.[1] ?? "";
      return currentAnchors.filter((item) => item === anchor).map(() => ({}));
    },
    createElement: () => {
      const next = button();
      buttons.push(next);
      return next;
    },
  });
  return { activeElement, buttons, setAnchors: (next: string[]) => { currentAnchors = next; } };
}

function configureDriver() {
  driverMock.mockImplementation((config: DriverConfig) => {
    let active = false;
    return {
      drive: () => { active = true; },
      isActive: () => active,
      getActiveStep: () => config.steps[0],
      refresh: vi.fn(),
      destroy: () => {
        active = false;
        config.onDestroyed?.();
      },
    };
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  FakeMutationObserver.instances = [];
  configureDriver();
});

afterEach(() => {
  destroyUmkmOnboardingTour();
  vi.unstubAllGlobals();
});

describe("UMKM onboarding T07 hardening", () => {
  it("uses Driver keyboard, close, scroll, and resize integration without custom handlers", () => {
    installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    startUmkmOnboardingTour(umkmDashboardTourSteps);
    const config = driverMock.mock.calls[0][0] as DriverConfig;

    expect(config.allowKeyboardControl).toBe(true);
    expect(config.allowClose).toBe(true);
    expect(config.smoothScroll).toBe(true);
    expect(typeof driverMock.mock.results[0].value.refresh).toBe("function");
  });

  it("keeps ESC/close cleanup in Driver lifecycle without persisting completion", () => {
    installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    expect(startUmkmDashboardTourForSession("escape")).toBe(true);
    driverMock.mock.results[0].value.destroy();

    expect(getUmkmDashboardTourPhase("escape")).toBe("handled");
    expect(startUmkmDashboardTourForSession("escape")).toBe(false);
  });

  it("renders named native skip and close controls through Driver public popover hook", () => {
    const { buttons } = installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    startUmkmOnboardingTour(umkmDashboardTourSteps);
    const config = driverMock.mock.calls[0][0] as DriverConfig;
    const closeButton = button();
    config.onPopoverRender?.({ closeButton, footerButtons: { prepend: (next) => buttons.push(next) } });

    expect(closeButton.attributes.get("aria-label")).toBe("Tutup panduan");
    expect(buttons.at(-1)?.type).toBe("button");
    expect(buttons.at(-1)?.attributes.get("aria-label")).toBe("Lewati panduan");
  });

  it("restores prior application focus after tour destroy", async () => {
    const { activeElement } = installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    // Make the test focus target pass the runtime HTMLElement guard.
    vi.stubGlobal("HTMLElement", class { isConnected = true; focus = activeElement.focus; });
    const focusTarget = new (globalThis.HTMLElement as typeof HTMLElement)();
    (document as { activeElement: unknown }).activeElement = focusTarget;

    const tour = startUmkmOnboardingTour(umkmDashboardTourSteps);
    tour?.destroy();
    await Promise.resolve();
    expect(activeElement.focus).toHaveBeenCalledOnce();
  });

  it("destroys safely when active target disappears and disconnects observer", () => {
    const dom = installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    const tour = startUmkmOnboardingTour(umkmDashboardTourSteps);
    dom.setAnchors(["campaign-nav", "create-campaign"]);
    FakeMutationObserver.instances[0].trigger();

    expect(tour?.isActive()).toBe(false);
    expect(FakeMutationObserver.instances[0].disconnected).toBe(true);
  });

  it("rejects duplicate anchors instead of selecting arbitrary target", () => {
    installDom(["dashboard-overview", "dashboard-overview"]);
    expect(startUmkmOnboardingTour([umkmDashboardTourSteps[0]])).toBeNull();
    expect(driverMock).not.toHaveBeenCalled();
  });

  it("disables Driver animation and keeps mobile-sized startup valid for reduced motion", () => {
    installDom(["dashboard-overview"], true);
    const tour = startUmkmOnboardingTour([umkmDashboardTourSteps[0]]);
    expect(tour).not.toBeNull();
    expect((driverMock.mock.calls[0][0] as DriverConfig).animate).toBe(false);
  });

  it("does not create a duplicate Driver instance when start path repeats", () => {
    installDom(["dashboard-overview", "campaign-nav", "create-campaign"]);
    startUmkmOnboardingTour(umkmDashboardTourSteps);
    startUmkmOnboardingTour(umkmDashboardTourSteps);
    expect(driverMock).toHaveBeenCalledTimes(2);
    expect(driverMock.mock.results[0].value.isActive()).toBe(false);
    expect(driverMock.mock.results[1].value.isActive()).toBe(true);
  });
});
