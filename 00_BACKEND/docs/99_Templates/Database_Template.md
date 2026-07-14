# Collection: <nama_collection>

**Purpose:** <untuk apa collection ini & modul pemiliknya>

## Attributes

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `<field>` | `<string/integer/boolean/datetime/enum>` | <ya/tidak> | <default, enum values, batasan> |
| `createdAt` | `datetime` | ya | timestamp pembuatan |

## Relations

- `<field>` → `<collection lain>` (<one-to-one / one-to-many>).

## Indexes

- `<nama_index>` — `<field(s)>` (<key/unique/fulltext>) — <alasan/query yang dilayani>.

## Permissions

- Read: <role / kondisi>.
- Create/Update/Delete: <role / kondisi, mis. owner only via service>.
