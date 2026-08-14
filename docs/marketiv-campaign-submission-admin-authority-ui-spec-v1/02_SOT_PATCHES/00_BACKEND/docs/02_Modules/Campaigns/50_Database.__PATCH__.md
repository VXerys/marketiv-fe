# Patch — `Campaigns/50_Database.md` / `campaign_submissions` section

Do not replace unrelated collection documentation. Update the `campaign_submissions` section semantics as follows.

## Required semantic changes

### `views`

Legacy compatibility field. It is **not Creator-authoritative final views**. New/current reward logic should prefer locked views fields when `views_final=true`.

### Locked views fields

Document these fields if they exist in Appwrite config/live schema:

| Field | Meaning |
|---|---|
| `views_count` | final views captured during Marketiv Admin validation |
| `views_captured_at` | capture timestamp |
| `views_source` | source metadata; MVP manual Admin uses `manual_admin` |
| `views_final` | whether views are locked for reward calculation |

### `status`

`pending | approved | rejected` — final submission validation lifecycle.

### `fraudStatus`

`safe | review | rejected` — separate advisory risk lifecycle. It does not replace `status`.

### `reviewNotes`

Change description from “catatan UMKM” to:

> optional validation/rejection note written by trusted Admin review path.

### Permission / authority note

Desired contract:

- Creator: read own; submit only via trusted Function.
- UMKM: read submissions belonging to own Campaign.
- Admin: read review queue and mutate validation through trusted Function.
- Direct client update of status/final views is prohibited.

Do not claim deployed Admin permission until the backend migration has been applied and verified.
