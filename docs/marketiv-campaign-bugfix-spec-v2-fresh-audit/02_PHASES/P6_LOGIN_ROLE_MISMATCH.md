# P6 — Login Portal Role Mismatch + Safe Destination

## Trello
`[BUG-P0] Login portal role mismatch tidak memberi error eksplisit`

## Inspect
```text
src/components/features/auth/LoginForm.tsx
src/components/providers/AuthProvider.tsx
src/services/auth/auth.service.ts
src/services/auth/session.service.ts
src/lib/constants/routes.ts
src/components/auth/RoleGuard.tsx
```

## Implement

### UMKM/Creator mismatch
After successful auth, if returned role does not match selected portal:
- terminate the created session using existing auth/session facade;
- show explicit mismatch message;
- do not redirect.

Suggested:
- `Akun ini terdaftar sebagai Kreator. Pilih tab Kreator untuk masuk.`
- `Akun ini terdaftar sebagai UMKM. Pilih tab UMKM untuk masuk.`

### Admin exception
Do not block Admin simply because public tabs only contain UMKM/Creator.
Admin may navigate only to configured Admin app origin.

### Safe `next`
Allow only role-compatible destinations:
- UMKM → `/dashboard/umkm...`
- Creator → `/dashboard/kreator...`
- Admin → configured Admin origin/path.

Reject:
- arbitrary external origin;
- `//host`;
- cross-role dashboard;
- unrelated privileged route.

## Tests
correct UMKM, correct Creator, both mismatches, Admin, safe next, cross-role next, external/protocol-relative next, suspended account.

## Verify
Targeted tests + root lint/typecheck/build.

STOP.
