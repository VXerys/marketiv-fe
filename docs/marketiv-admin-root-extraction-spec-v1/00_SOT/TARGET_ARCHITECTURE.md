# Target Architecture

## Repository topology

```text
marketiv-web/
├── src/                         # USER APP ONLY
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   └── ...
│
├── admin/                       # ADMIN APP
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── dashboard/
│   │   │   └── submissions/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   └── ui/
│   │   ├── features/
│   │   │   └── admin/
│   │   ├── lib/
│   │   │   ├── admin/
│   │   │   ├── appwrite/
│   │   │   └── utils.ts
│   │   └── assets/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── postcss.config.mjs
│   └── .env.example
│
└── 00_BACKEND/                  # shared backend
```

## Frontend isolation rule

The Admin app must be buildable with:

```bash
cd admin
npm install
npm run build
```

without requiring TypeScript/source imports from the main user app.

Forbidden:

```ts
import x from "../../src/...";
import y from "../../../src/...";
```

Also avoid aliasing `@/*` to repository-root `src/*`.

Inside Admin:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

## Shared backend rule

The extraction changes frontend topology only.

Do NOT create:

```text
admin_users
admin_campaigns
admin_submissions
admin_transactions
admin_review_submission
admin_calculate_campaign_reward
```

unless a distinct future domain use-case justifies one.

Admin continues to point to the same Appwrite Project, Auth, Database and Functions as the user app in each environment.

## Internal route rule

Because Admin gets its own subdomain, internal Admin routes should no longer repeat `/admin`.

Canonical:

```text
/              → /dashboard
/dashboard
/submissions
```

## User app → Admin navigation rule

User app shall not route Admin users to local `/admin`.

Use an environment-configured Admin application origin.

Recommended public config:

```text
NEXT_PUBLIC_ADMIN_APP_URL
```

Examples:

```text
staging user app:
NEXT_PUBLIC_ADMIN_APP_URL=https://admin-staging.marketiv.id

production user app:
NEXT_PUBLIC_ADMIN_APP_URL=https://admin.marketiv.id
```

Do not infer environment from hostname if an explicit deployment env value already exists.

## Admin → User app navigation

If Admin needs a "back to Marketiv" or logout destination, use an explicit config:

```text
NEXT_PUBLIC_USER_APP_URL
```

Examples:

```text
staging Admin:
https://staging.marketiv.id

production Admin:
https://marketiv.id
```

## Appwrite environment

Admin app uses the same public Appwrite IDs/endpoints as user app for the matching environment.

No API key/server secret belongs in Admin browser env.
