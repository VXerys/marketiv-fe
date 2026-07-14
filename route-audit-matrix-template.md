# Dashboard UI Audit Matrix Template

Use this file during Phase 1.

| Route | Breakpoint | Issue | Severity | Component | Expected Fix | Status |
|---|---:|---|---|---|---|---|
| `/dashboard/umkm` | 375px | Example: metric card value overflows | High | DashboardMetricCard | Compact value + min-w-0 | Todo |
| `/dashboard/umkm/campaign` | 768px | Example: filter toolbar wraps awkwardly | Medium | CampaignToolbar | Use responsive wrapping and reset button | Todo |
| `/dashboard/kreator/job-pool` | 375px | Example: job card CTA buttons are cramped | High | JobCard | Stack CTAs full-width on mobile | Todo |
| `/dashboard/kreator/negosiasi/[id_order]` | 375px | Example: order summary sidebar overflows | High | OrderSummaryCard | Stack below chat and make modal/card scroll-safe | Todo |

## Severity Guide

- Critical: route unusable, build error, blank page, major domain violation.
- High: mobile overflow, broken modal, unreadable card, broken CTA.
- Medium: inconsistent spacing, awkward tablet layout, repeated styles.
- Low: polish issue, minor copy inconsistency.

## Breakpoints

Check at:

```txt
375px
430px
768px
1024px
1280px
1440px
```
