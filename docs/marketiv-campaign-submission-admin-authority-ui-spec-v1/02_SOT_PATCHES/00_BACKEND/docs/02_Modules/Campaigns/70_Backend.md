# Campaigns — Backend

## Trust Boundary

Campaign submission final status, locked views, reward, wallet, and financial counters are trusted backend concerns. UI components must not write them directly.

## `submit-campaign-proof`

**Current / implemented**

- invoked by authenticated Creator frontend;
- validates claim/campaign ownership and public post URL;
- creates `campaign_submissions` with `pending`;
- updates claim to `submitted`;
- sends notification.

Current Function capability may accept more platform values than current product MVP; product availability is controlled by Campaign contract/UI.

## `ai-fraud-precheck`

**Current / implemented**

- triggered after submission creation;
- validates URL/platform/accessibility/dedup and optional text relevance;
- writes `fraudScore`, `fraudStatus`, `fraud_checks`;
- **does not set final submission status** on current baseline.

Therefore fraud is supporting risk evidence, not final payout authority.

## `review-submission`

### Target responsibility

- authenticated active **Admin Marketiv** only;
- input pending submission + decision;
- on approve: validate and lock final views metadata, set `approved`;
- on reject: set `rejected`, persist reason, restore exactly one Campaign slot according to existing idempotent rule;
- sync claim outcome;
- write audit log;
- notify Creator and UMKM where appropriate.

### Current migration blocker

Baseline 2026-08-14 implementation still validates the caller as parent Campaign UMKM owner. This is legacy behavior and must be replaced during backend wiring. Do not wire Admin production UI to it before the authorization test is fixed.

## `calculate-campaign-reward`

**Current / implemented**

- reacts only to approved submission event;
- checks existing transaction to prevent double reward;
- uses locked `views_count` when `views_final=true`, otherwise legacy fallback;
- caps reward by remaining Campaign budget;
- credits Creator pending balance and transaction;
- updates Campaign counters atomically.

Campaign creator reward is not reduced by platform fee; fee is charged to UMKM during Campaign funding (ADR-008).

## Security Requirements for Admin Wiring

- role must be derived server-side, never from client payload;
- suspended/non-admin callers rejected;
- pending-only transition enforced;
- review action audited with actor + before/after + views/reason;
- retry must not duplicate quota restoration or reward;
- Admin read path should not require broad client update permission.
