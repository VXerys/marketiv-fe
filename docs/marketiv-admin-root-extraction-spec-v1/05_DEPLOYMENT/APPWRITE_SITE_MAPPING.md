# Deployment Mapping

## Staging

### User Site

```text
repository: marketiv-id/marketiv-web
branch: staging
root directory: /
domain: staging.marketiv.id
backend: Appwrite Staging
```

### Admin Site

```text
repository: marketiv-id/marketiv-web
branch: staging
root directory: admin
domain: admin-staging.marketiv.id
backend: SAME Appwrite Staging project
```

## Production

### User Site

```text
repository: marketiv-id/marketiv-web
branch: production
root directory: /
domain: marketiv.id
backend: Appwrite Production
```

### Admin Site

```text
repository: marketiv-id/marketiv-web
branch: production
root directory: admin
domain: admin.marketiv.id
backend: SAME Appwrite Production project
```

## Required Appwrite configuration check

For each Appwrite environment ensure relevant browser origins/platform hosts are registered.

Do not loosen database permissions to solve origin/config problems.

## Backend resources

Shared:

```text
Auth
Database
Storage where applicable
Functions
```

Separate only by environment, not by frontend subdomain.
