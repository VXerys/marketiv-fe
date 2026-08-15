# Focused Search Checklist

## Admin unsafe facts
```bash
rg -n "admin-ops-01|ops@marketiv\.id|Appwrite Staging|99\.8%|\+12%|SLA Validasi|activeCampaignsCount:\s*15|pendingCount\s*=\s*12" admin/src
```

## Direct final review writes
```bash
rg -n "databases\.updateDocument" admin/src/features/admin/submissions
```

## Fixture fallback
```bash
rg -n "INITIAL_SUBMISSION_FIXTURES|activeSubmissionsStore" admin/src/features/admin/submissions
```

## Direct submission reads
```bash
rg -n "COLLECTIONS\.submissions|campaign_submissions" admin/src
```
Every remaining direct browser read must be justified.

## Claim browser mutations
```bash
rg -n "incrementDocumentAttribute|decrementDocumentAttribute|deleteDocument" src/services/creator/creator-appwrite.service.ts
```

## Stale reviewer copy
```bash
rg -n "ditolak oleh UMKM|UMKM.*(approve|reject|verifikasi|validasi).*submission" 00_BACKEND/functions src admin/src
```
