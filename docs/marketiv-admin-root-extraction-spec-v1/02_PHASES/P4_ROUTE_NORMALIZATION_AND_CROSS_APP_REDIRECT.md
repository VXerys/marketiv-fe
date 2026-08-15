# P4 — Route Normalization & Cross-App Destination

## Objective

Convert the old same-app route model to standalone-subdomain routing.

## Admin internal route mapping

```text
OLD                         NEW
/admin                      /
/admin/dashboard            /dashboard
/admin/submissions          /submissions
/admin/submissions/...      /submissions/...
```

Update:

- `<Link href>`
- `router.push/replace`
- `redirect()`
- `usePathname()` comparisons
- breadcrumbs
- quick actions
- tests
- route constants local to Admin.

## AdminSidebar

Current sidebar explicitly checks and links to `/admin/dashboard` and `/admin/submissions`.

Convert to standalone routes.

Do not preserve `/admin` prefix inside the Admin app.

## User app Admin destination

Inspect main:

```text
src/lib/constants/routes.ts
LoginForm / auth redirect users
RedirectIfAuthenticated
RoleGuard
other dashboardByRole consumers
```

Do not rewrite authentication logic beyond destination topology.

Create a canonical external Admin origin.

Recommended:

```text
NEXT_PUBLIC_ADMIN_APP_URL
```

Then Admin role destination must resolve to that origin rather than local `/admin`.

Do not hardcode one domain for all environments.

## Cross-origin navigation

An absolute Admin URL is a separate application navigation.

Do not assume Next internal router state is shared across the two apps.

If current code uses `router.replace()` with absolute URL and behavior is unreliable, use the smallest correct browser navigation approach already accepted by project conventions.

## User roles

Do not change UMKM/Creator destinations.

## Compatibility

Do not add a temporary local `/admin` proxy route unless explicitly required for rollout.

Preferred final state: main app does not expose Admin operational pages.

## Verification

Admin:

```text
/ → /dashboard
/dashboard
/submissions
```

Main app:

```text
Admin destination → configured Admin origin
UMKM destination unchanged
Creator destination unchanged
```

## Exit criteria

No functional Admin navigation still assumes `/admin` is a route segment.
