# Task 04 — Regression Tests

## Objective

Prove both applications can coexist in one browser.

## Required deployed test matrix

Use one normal browser profile.

### Scenario S1 — Main then Admin

1. Logout both.
2. Login `staging.marketiv.id` as active UMKM/Creator.
3. Confirm authenticated page.
4. Open `admin-staging.marketiv.id`.
5. Login as active Admin.
6. Refresh Admin.
7. Refresh main.
8. Both must remain authenticated as their respective users.

### Scenario S2 — Admin then Main

Reverse S1.

Both must remain authenticated.

### Scenario S3 — Logout main only

Starting with both logged in:

1. logout `staging.marketiv.id`;
2. refresh Admin.

Expected:
- main logged out;
- Admin remains logged in.

### Scenario S4 — Logout Admin only

Starting with both logged in:

1. logout Admin;
2. refresh main.

Expected:
- Admin logged out;
- main remains logged in.

### Scenario S5 — Invalid Admin credentials

While main is logged in:
1. attempt invalid Admin login;
2. main session must remain valid.

### Scenario S6 — Non-Admin account on Admin

While main session exists:
1. attempt Admin login using a known UMKM/Creator account;
2. Admin must reject;
3. main app must remain logged in.

### Scenario S7 — Suspended Admin

If a safe staging fixture exists:
- suspended Admin remains rejected;
- main session is unaffected.

Do not modify production data to create this fixture.

### Scenario S8 — Google OAuth user app

Only if Google OAuth is enabled on staging:

1. login main via Google;
2. login Admin via email/password;
3. both remain authenticated;
4. logout Admin;
5. Google user session remains.

## Evidence

Capture:
- DevTools Network host for each app;
- cookie/storage host metadata without secret values;
- screenshots showing both authenticated tabs;
- console errors if any.
