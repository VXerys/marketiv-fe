# Audit

BASE: `staging@8166a810549b3c4f0ce0c24bda1a23283e9eed00`

## Confirmed
- Next.js 16.1.6, React 19.2.3, Appwrite 25.2.0.
- Scripts include `lint`, `typecheck`, `test`, `build`.
- No product-tour dependency confirmed.
- `src/app/dashboard/umkm/layout.tsx` is a role boundary (`RoleGuard`), not the full dashboard shell.
- UMKM pages use `UmkmDashboardChrome`.
- Dashboard overview is client-driven because Appwrite session is browser-side.
- `/dashboard/umkm/panduan` already exists and should be reused for replay/help.

## Architecture implications
- Do not mount a DOM tour only in segment layout.
- Keep tour state client-side and resilient across route changes.
- Use stable `data-onboarding` anchors; never Tailwind selectors or `nth-child`.
- Campaign and Rate Card remain separate product flows.
- Phase 1 scope: Dashboard → first Campaign journey.
- Avoid Appwrite schema changes for MVP unless repository evidence requires them.
- No unrelated dashboard refactor.
