# Task 00 — Preflight

## Objective

Establish a clean, evidence-backed starting point.

## Steps

1. Confirm repository:
   ```bash
   git remote -v
   git branch --show-current
   git status --short
   ```

2. Required branch:
   ```text
   staging
   ```

3. Do not discard unrelated local changes.

4. Inspect:
   - root `.env.example`
   - `admin/.env.example`
   - root/admin Appwrite client files
   - root/admin auth service files
   - root/admin package scripts

5. Search for hard-coded Appwrite hosts:
   ```bash
   rg -n "cloud\.appwrite\.io|api-staging\.marketiv\.id|api-admin-staging\.marketiv\.id|NEXT_PUBLIC_APPWRITE_ENDPOINT" .
   ```

6. Search Google OAuth integration:
   ```bash
   rg -n "createOAuth2Session|OAuthProvider\.Google|oauthSuccessPath|oauthFailurePath|NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH" src admin
   ```

## Output

Before implementing, record:

```text
Current branch:
Dirty files:
Main endpoint source:
Admin endpoint source:
Google OAuth implementation files:
Hard-coded endpoint findings:
```

## Acceptance

- No implementation starts before current architecture is confirmed.
- Unrelated local modifications are preserved.
