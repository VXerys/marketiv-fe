# Returning User Auth-Aware Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make public landing CTAs and auth pages respond to restored Appwrite sessions without adding session persistence.

**Architecture:** Keep `AuthProvider → getSession() → account.get()` authoritative. Add one small client hero-actions boundary, make Navbar consume `useAuth()`, and make `RedirectIfAuthenticated` render a stable loading state before redirect decisions.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, jsdom, existing Tailwind/UI components.

## Global Constraints

- `/` remains public.
- Do not create another AuthProvider or auth/session persistence mechanism.
- Appwrite session remains authoritative through `AuthProvider → getSession() → account.get()`.
- Preserve email verification, `not_found`, onboarding, suspended-account, role validation, T&C, and safe `next` rules.
- Use `router.replace` for automatic auth redirects.
- Preserve desktop/mobile guest navigation and existing visual language.
- No unrelated refactor or Appwrite configuration change.

---

### Task 1: Add failing auth-aware landing and redirect tests

**Files:**
- Create: `src/components/features/landing/__tests__/landing-auth-visibility.test.tsx`
- Create: `src/components/features/auth/__tests__/redirect-if-authenticated.test.tsx`

**Interfaces:**
- Consumes: current `useAuth()` context shape, `dashboardByRole`, `RedirectIfAuthenticated` children.
- Produces: executable regression cases for guest/authenticated/loading UI and role-specific `router.replace` destinations.

- [ ] **Step 1: Write failing landing tests**

Mock `@/components/providers/AuthProvider`, render `Navbar` and the eventual `LandingHeroActions`, and assert:

```tsx
it("shows guest auth links in desktop and mobile menu", async () => {
  mockAuth({ user: null, loading: false });
  render(<Navbar />);
  expect(screen.getAllByRole("link", { name: "Masuk" })).toHaveLength(2);
  expect(screen.getByRole("link", { name: "Daftar" })).toHaveAttribute("href", "/register");

  await userEvent.click(screen.getByRole("button", { name: /toggle navigation/i }));
  expect(screen.getByRole("link", { name: "Daftar Sekarang" })).toHaveAttribute("href", "/register");
});

it("shows one UMKM dashboard link in both navbar surfaces", () => {
  mockAuth({ user: umkmUser, loading: false });
  render(<Navbar />);
  expect(screen.getAllByRole("link", { name: "Dashboard" })).toHaveLength(2);
  expect(screen.getAllByRole("link", { name: "Dashboard" })[0]).toHaveAttribute("href", "/dashboard/umkm");
  expect(screen.queryByRole("link", { name: "Masuk" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Daftar" })).not.toBeInTheDocument();
});

it("shows Creator dashboard CTA and hides registration hero CTAs", () => {
  mockAuth({ user: creatorUser, loading: false });
  render(<LandingHeroActions />);
  expect(screen.getByRole("link", { name: "Buka Dashboard" })).toHaveAttribute("href", "/dashboard/kreator");
  expect(screen.queryByRole("link", { name: /UMKM/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /Kreator/i })).not.toBeInTheDocument();
});

it("renders stable neutral placeholders while auth resolves", () => {
  mockAuth({ user: null, loading: true });
  render(<><Navbar /><LandingHeroActions /></>);
  expect(screen.queryByRole("link", { name: "Masuk" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Daftar" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Buka Dashboard" })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run landing tests and verify failure**

Run: `npm run test -- --run src/components/features/landing/__tests__/landing-auth-visibility.test.tsx`

Expected: FAIL because `LandingHeroActions` does not exist and Navbar still renders static auth links for authenticated/loading states.

- [ ] **Step 3: Write failing redirect tests**

Mock `useAuth`, `useRouter`, and render a marker child:

```tsx
it("replaces valid UMKM session with UMKM dashboard", async () => {
  mockAuth({ user: umkmUser, loading: false, errorCode: null });
  render(<RedirectIfAuthenticated><div>form</div></RedirectIfAuthenticated>);
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard/umkm"));
  expect(screen.queryByText("form")).not.toBeInTheDocument();
});

it("replaces valid Creator session with Creator dashboard", async () => {
  mockAuth({ user: creatorUser, loading: false, errorCode: null });
  render(<RedirectIfAuthenticated><div>form</div></RedirectIfAuthenticated>);
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard/kreator"));
});

it("does not render auth form during session resolution", () => {
  mockAuth({ user: null, loading: true, errorCode: null });
  render(<RedirectIfAuthenticated><div>form</div></RedirectIfAuthenticated>);
  expect(screen.queryByText("form")).not.toBeInTheDocument();
});

it("keeps auth form for resolved guest", () => {
  mockAuth({ user: null, loading: false, errorCode: "auth" });
  render(<RedirectIfAuthenticated><div>form</div></RedirectIfAuthenticated>);
  expect(screen.getByText("form")).toBeInTheDocument();
});
```

- [ ] **Step 4: Run redirect tests and verify failure**

Run: `npm run test -- --run src/components/features/auth/__tests__/redirect-if-authenticated.test.tsx`

Expected: FAIL on the loading assertion and destination assertions until implementation is added; existing redirect test cases must not fail because of mock setup errors.

### Task 2: Implement auth-aware Navbar and hero boundary

**Files:**
- Create: `src/components/features/landing/LandingHeroActions.tsx`
- Modify: `src/components/layouts/Navbar.tsx`
- Modify: `src/components/features/landing/HeroSection.tsx`

**Interfaces:**
- Consumes: `useAuth(): { user, loading }`, `isUserPortalRole`, `dashboardByRole`, existing `LANDING_CONTENT`, `Button`, and Navbar route labels.
- Produces: `LandingHeroActions` client component; Navbar and hero CTA state behavior.

- [ ] **Step 1: Implement smallest passing hero boundary**

Create client component that returns a stable empty CTA-area placeholder during loading, guest UMKM/Creator registration buttons after resolution, and one `Buka Dashboard` button for user-portal roles using `dashboardByRole[user.role]`.

- [ ] **Step 2: Replace static Hero CTA markup with boundary**

Pass `hero` CTA labels into `LandingHeroActions` from server-rendered `HeroSection`; preserve current classes and route utility usage.

- [ ] **Step 3: Implement Navbar auth state**

Use `useAuth()`. Keep nav links and mobile menu unchanged. Render stable auth-area placeholders while loading. Render existing desktop/mobile guest links for resolved guest; render Dashboard links with role-specific `dashboardByRole` for UMKM/Creator. Close mobile menu after link activation as current code does.

- [ ] **Step 4: Run landing tests green**

Run: `npm run test -- --run src/components/features/landing/__tests__/landing-auth-visibility.test.tsx`

Expected: all landing tests PASS, including desktop and mobile link assertions and no auth CTA flash during loading.

### Task 3: Fix auth-page loading render without changing precedence

**Files:**
- Modify: `src/components/auth/RedirectIfAuthenticated.tsx`
- Modify: `src/components/features/auth/__tests__/redirect-if-authenticated.test.tsx`

**Interfaces:**
- Consumes: unchanged `useAuth` state and existing route helper logic.
- Produces: loading-only neutral state; unchanged redirect decisions for resolved sessions.

- [ ] **Step 1: Add profile-incomplete regression assertion**

Verify a resolved verified UMKM/Creator user with `isProfileCompleted: false` calls `router.replace(routes.onboarding)` and does not render child form. Keep `not_found` assertion available if current test setup supports it.

- [ ] **Step 2: Implement loading gate**

Before existing resolved-user guard, return a dimensionally stable neutral loading element when `loading` is true. Keep `useEffect` conditions and existing `errorCode !== "not_found"` logic unchanged except for required dependency correctness.

- [ ] **Step 3: Run redirect tests green**

Run: `npm run test -- --run src/components/features/auth/__tests__/redirect-if-authenticated.test.tsx`

Expected: valid UMKM/Creator replace tests, loading no-form test, guest form test, and onboarding regression all PASS.

### Task 4: Full verification and review

**Files:**
- Verify: all changed source/test/docs files and git diff.

**Interfaces:**
- Consumes: completed implementation and focused tests.
- Produces: evidence-backed verification report; no claims based on unrun commands.

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit code 0 with no lint errors.

- [ ] **Step 3: Run full unit suite**

Run: `npm run test -- --run`

Expected: exit code 0 and all included tests pass.

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: exit code 0.

- [ ] **Step 5: Attempt E2E if setup is available**

Run: `npm run test:e2e` only if existing Playwright configuration and required environment are usable without unrelated setup changes. Record skipped/blocking reason otherwise.

- [ ] **Step 6: Inspect diff and report runtime limits**

Run: `rtk git diff --check` and `rtk git status --short`.

Report exact diagnosis, changed files, guest/UMKM/Creator behavior, command results, and any staging/Appwrite runtime verification not possible locally.
