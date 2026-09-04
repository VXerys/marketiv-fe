// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  auth: {
    user: null as unknown,
    loading: false,
    errorCode: null as unknown,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock("@/components/providers/AuthProvider", () => ({
  useAuth: () => mocks.auth,
}));

const baseUser = {
  userId: "user-1",
  email: "person@example.com",
  status: "active" as const,
  emailVerified: true,
  isProfileCompleted: true,
};

let root: Root | undefined;
let host: HTMLDivElement;

function mockAuth(state: { user: unknown; loading: boolean; errorCode: unknown }) {
  mocks.auth.user = state.user;
  mocks.auth.loading = state.loading;
  mocks.auth.errorCode = state.errorCode;
}

async function render(element: React.ReactNode) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(element));
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_ADMIN_APP_URL", "https://admin.example.test");
  vi.clearAllMocks();
  mockAuth({ user: null, loading: false, errorCode: "auth" });
});

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  vi.unstubAllEnvs();
});

describe("RedirectIfAuthenticated", () => {
  it("replaces valid UMKM session with UMKM dashboard", async () => {
    const { RedirectIfAuthenticated } = await import("@/components/auth/RedirectIfAuthenticated");
    mockAuth({ user: { ...baseUser, role: "umkm" }, loading: false, errorCode: null });
    await render(<RedirectIfAuthenticated><div>login form</div></RedirectIfAuthenticated>);

    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/umkm");
    expect(document.body.textContent).not.toContain("login form");
  });

  it("replaces valid Creator session with Creator dashboard", async () => {
    const { RedirectIfAuthenticated } = await import("@/components/auth/RedirectIfAuthenticated");
    mockAuth({ user: { ...baseUser, role: "creator" }, loading: false, errorCode: null });
    await render(<RedirectIfAuthenticated><div>login form</div></RedirectIfAuthenticated>);

    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/kreator");
  });

  it("redirects profile-incomplete user to onboarding", async () => {
    const { RedirectIfAuthenticated } = await import("@/components/auth/RedirectIfAuthenticated");
    mockAuth({ user: { ...baseUser, role: "umkm", isProfileCompleted: false }, loading: false, errorCode: null });
    await render(<RedirectIfAuthenticated><div>login form</div></RedirectIfAuthenticated>);

    expect(mocks.replace).toHaveBeenCalledWith("/onboarding");
    expect(document.body.textContent).not.toContain("login form");
  });

  it("does not render auth form while session resolution is pending", async () => {
    const { RedirectIfAuthenticated } = await import("@/components/auth/RedirectIfAuthenticated");
    mockAuth({ user: null, loading: true, errorCode: null });
    await render(<RedirectIfAuthenticated><div>login form</div></RedirectIfAuthenticated>);

    expect(document.body.textContent).not.toContain("login form");
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("keeps auth form accessible for resolved guest", async () => {
    const { RedirectIfAuthenticated } = await import("@/components/auth/RedirectIfAuthenticated");
    mockAuth({ user: null, loading: false, errorCode: "auth" });
    await render(<RedirectIfAuthenticated><div>login form</div></RedirectIfAuthenticated>);

    expect(document.body.textContent).toContain("login form");
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("keeps unverified user on existing verification flow", async () => {
    const { RedirectIfAuthenticated } = await import("@/components/auth/RedirectIfAuthenticated");
    mockAuth({ user: { ...baseUser, role: "umkm", emailVerified: false }, loading: false, errorCode: null });
    await render(<RedirectIfAuthenticated><div>verification flow</div></RedirectIfAuthenticated>);

    expect(document.body.textContent).toContain("verification flow");
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("keeps profile-missing recovery accessible", async () => {
    const { RedirectIfAuthenticated } = await import("@/components/auth/RedirectIfAuthenticated");
    mockAuth({ user: null, loading: false, errorCode: "not_found" });
    await render(<RedirectIfAuthenticated><div>profile recovery</div></RedirectIfAuthenticated>);

    expect(document.body.textContent).toContain("profile recovery");
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("keeps a safe role-scoped next destination", async () => {
    const { RedirectIfAuthenticated } = await import("@/components/auth/RedirectIfAuthenticated");
    mockAuth({ user: { ...baseUser, role: "umkm" }, loading: false, errorCode: null });
    await render(
      <RedirectIfAuthenticated next="/dashboard/umkm/campaign/123">
        <div>login form</div>
      </RedirectIfAuthenticated>,
    );

    expect(mocks.replace).toHaveBeenCalledWith("/dashboard/umkm/campaign/123");
  });
});
