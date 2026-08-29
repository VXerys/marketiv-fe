# Source Map

## Repository source-of-truth files

### Main application
- `.env.example`
- `package.json`
- `src/config/auth.config.ts`
- `src/lib/appwrite/account.ts`
- `src/lib/appwrite/client.ts`
- `src/lib/appwrite/config.ts`
- `src/services/auth/auth.service.ts`
- `src/services/auth/oauth-callback.service.ts`
- `src/services/auth/session.service.ts`

### Admin application
- `admin/.env.example`
- `admin/package.json`
- `admin/src/lib/admin/appwrite.ts`
- `admin/src/lib/admin/auth.ts`
- `admin/src/lib/admin/auth.test.ts`
- admin auth boundary/login components discovered during implementation

## Known package versions from current staging audit

Both apps currently use:
- Next.js `16.1.6`
- React `19.2.3`
- Appwrite Web SDK `^25.2.0`
- Vitest `^4.1.10`

## External technical references

Appwrite:
- https://appwrite.io/docs/products/network/custom-domains
- https://appwrite.io/docs/products/auth/oauth2

Use current Appwrite Console values as runtime truth for:
- CNAME target;
- custom domain verification;
- OAuth provider callback URL;
- allowed web platforms/domains.

Never invent DNS target values in code or documentation.
