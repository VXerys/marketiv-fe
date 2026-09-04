# Returning User Auth-Aware Landing Design

**Date:** 2026-09-04

## Goal

Keep `/` public while making landing navigation and auth-page rendering reflect the existing Appwrite session consistently after browser reloads.

## Diagnosis

`AuthProvider` initializes `loading` to `true`, then calls `getSession()`. With real data, `getSession()` calls `account.get()`, queries `users`, then reads the role profile completion state. `RedirectIfAuthenticated` currently returns its `children` whenever `loading` is true, so login/register forms render during this unresolved interval. This is a UI flash, not evidence that Appwrite session restoration failed.

The landing page is intentionally public and currently has static guest CTAs. It does not consume `useAuth()`, so it cannot adapt after `AuthProvider` restores the session. Appwrite endpoint/project configuration and session persistence remain unchanged.

## Architecture

- `AuthProvider` remains the only session state provider.
- `Navbar` consumes `useAuth()` directly and renders a dimensionally stable auth-area placeholder while loading.
- `HeroSection` remains a server component. New `LandingHeroActions` client component owns only auth-sensitive hero buttons.
- Both client surfaces use `isUserPortalRole` and `dashboardByRole` from route constants. They do not add mappings, persistence, or direct Appwrite calls.
- `RedirectIfAuthenticated` renders a stable loading skeleton while session resolution is pending, then preserves existing verification, `not_found`, onboarding, role, suspended, and safe `next` decisions.

## State behavior

| State | Navbar | Hero | Auth page |
| --- | --- | --- | --- |
| Loading | Neutral stable placeholder | Neutral stable placeholder | Neutral stable placeholder; no form flash |
| Guest | `Masuk`, `Daftar`; mobile `Masuk`, `Daftar Sekarang` | UMKM and Creator registration CTAs | Form remains accessible after resolution |
| UMKM | `Dashboard` → `/dashboard/umkm` on desktop/mobile | `Buka Dashboard` → `/dashboard/umkm` | Replace to existing safe destination/onboarding rules |
| Creator | `Dashboard` → `/dashboard/kreator` on desktop/mobile | `Buka Dashboard` → `/dashboard/kreator` | Replace to existing safe destination/onboarding rules |
| Admin/unsupported role | Preserve user-portal guest presentation; no admin auth merge | Preserve guest presentation | Preserve existing `RedirectIfAuthenticated` behavior |

## Error handling

No new error handling or pseudo-session state. Existing `AuthProvider` error codes remain authoritative. A failed session lookup resolves to its current unauthenticated/error state; only `loading` rendering changes. `not_found` remains available to existing recovery behavior and is not treated as a completed user profile.

## Testing

Add jsdom component tests using current Vitest mocks for:

- Navbar guest, UMKM, Creator, loading, and mobile menu behavior.
- Hero guest, authenticated UMKM/Creator, and loading behavior.
- Redirect valid UMKM/Creator replace destinations, loading no-form rendering, guest form rendering, and profile-incomplete onboarding redirect.

Required verification remains `npm run typecheck`, `npm run lint`, `npm run test -- --run`, `npm run build`; E2E/manual staging validation is reported separately if environment permits.
