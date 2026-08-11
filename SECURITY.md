# Security Policy & Invariants

This document outlines the core security invariants and architectural constraints for Marketiv. Any code changes must strictly adhere to these rules to prevent privilege escalation, data leaks, and financial discrepancies.

## 1. Authentication & Access Control (RBAC) Invariants

- **Single Source of Truth**: Appwrite Auth is the absolute authority on user identity. Password hashes or raw credentials MUST NEVER be stored in the database collections.
- **Server-Side Validation**: All data access and mutations MUST be preceded by session verification on the server (`requireAuth` or equivalent). Client-side session checks are purely cosmetic.
- **Strict Role Boundaries**:
  - `UMKM` and `Kreator` are strictly isolated domains.
  - Cross-ecosystem state sharing or component imports are FORBIDDEN.
  - Creation of an account defaults to a standard role; `Admin` privileges can only be granted via backend administrative functions, never through standard signup routes.
- **Profile Data Segregation**: Public profile data (e.g., `creator_profiles`, `umkm_profiles`) must be kept separate from private owner fields (e.g., `users`). Public collections may have `read("any")` but MUST NEVER contain sensitive data like addresses or phone numbers.

## 2. Payment & Financial Invariants

- **No Direct Client Mutations**: The frontend browser MUST NEVER directly mutate `wallet balance`, `payment status`, `escrow status`, or `campaign quotas`.
- **Secure Transaction Flow**:
  1. Frontend requests a Snap token from the secure backend.
  2. Browser uses the Snap token to display the payment modal.
  3. The database status is updated EXCLUSIVELY via Midtrans Webhooks (Appwrite Functions).
- **Webhook Integrity**: Midtrans Webhook handlers MUST validate the `signature_key` (SHA512 hash) before processing any payload to prevent spoofing.
- **Idempotency**: All financial webhooks and operations must be idempotent to prevent double-crediting or double-processing of transactions.

## 3. Storage & Media Invariants

- **Direct Upload Restrictions**:
  - Direct uploads to Appwrite Storage are limited to 100MB and are EXCLUSIVELY for avatars, logos, and small supporting screenshots.
  - Large raw video assets MUST use external links (e.g., Google Drive, OneDrive).
- **Format Restrictions**:
  - SVG uploads are STRICTLY PROHIBITED to mitigate Stored XSS vulnerabilities. Storage bucket configurations and frontend `accept` attributes must explicitly exclude `image/svg+xml`.
- **Proof of Work**: Creators submit proofs of work as URLs to published social media posts (TikTok/Instagram), never as direct video file uploads.

## 4. Required Security Tests

Before merging any significant changes, the following security validations MUST be performed:

1. **Authentication Tests**:
   - Verify that unauthenticated users are redirected from protected routes.
   - Verify that an `UMKM` user cannot access `/dashboard/kreator/*` and vice versa.
2. **Authorization Tests**:
   - Verify that a user cannot modify another user's profile or campaign data via direct API calls.
3. **Financial Tests**:
   - Simulate a Midtrans webhook with an invalid signature; ensure it is rejected (HTTP 400/401).
   - Simulate duplicate webhooks; ensure the wallet balance is only credited once.
   - Verify that manipulating the frontend state does not allow bypassing payment requirements.
4. **Storage Tests**:
   - Attempt to upload an `.svg` file disguised as a `.png`; ensure the backend rejects it.

---

## Vulnerability Reporting

If you discover a security vulnerability, please contact the maintainers via email at: `marketiv.official@gmail.com`.

- Provide a short summary, steps to reproduce, and any PoC or logs.
- We aim to respond within 72 hours.
