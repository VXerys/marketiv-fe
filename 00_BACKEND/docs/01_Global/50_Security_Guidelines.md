# 50_Security_Guidelines

**Pemilik tunggal model permission Marketiv.** Appwrite memakai document-level permission (bukan role-based ala Laravel). Modul mengacu ke sini.

## Tier Akses

- **Public**: Landing, Campaign Explore, Creator Explore.
- **Creator**: Claim campaign, submission, rate card, withdraw.
- **UMKM**: Campaign, approve submission, order, escrow (read).
- **Admin**: Akses penuh / moderasi.
- **Function**: Operasi sensitif (escrow, wallet, withdraw, fraud) via API Key server.

## Permission Matrix (CRUD per Collection)

| Collection | Creator | UMKM | Admin | Function |
|---|---|---|---|---|
| `users` | R/U self, C register | R/U self, C register | Full (R/U/D all) | — |
| `campaigns` | R active only | R own, C, U own, D draft only | Full | — |
| `campaign_claims` | R own, C (claim) | R claims on own campaign | Full | — |
| `campaign_submissions` | R own, C, U before review | R on own campaign, U (approve/reject/revision) | Full | fraud update |
| `offers` | R own, U (accept/reject) | C, R own, U (cancel) | Read only | — |
| `orders` | R related | R related | Full | C/U (dari offer accepted) |
| `escrows` | NO ACCESS | NO ACCESS | Read only | CREATE/UPDATE/RELEASE |
| `wallets` | R own | R own | Read only | UPDATE balance, TRANSFER, RELEASE escrow, WITHDRAW |
| `transactions` | R own | R own | Read all | CREATE |
| `withdrawals` | C, R own | C, R own | APPROVE/REJECT/COMPLETE | — |
| `notifications` | R own | R own | CREATE system notif | CREATE |
| `conversations`/`messages` (Chat) | R own room, send msg | R own room, send msg | Read only | — |

Catatan: Escrow tidak boleh disentuh user sama sekali; hanya Function (API key) yang menulis.

## Pola Document-Level Permission

**Campaign** (saat dibuat oleh UMKM):

```javascript
Permission.read(Role.any()),
Permission.update(Role.user(umkmId)),
Permission.delete(Role.user(umkmId))
```

**Submission** (saat dibuat):

```javascript
Permission.read(Role.user(creatorId)),
Permission.read(Role.user(umkmId)),
Permission.update(Role.user(umkmId))
```

**Chat Message**:

```javascript
Permission.read(Role.user(senderId)),
Permission.read(Role.user(receiverId))
```

## Function API Key Scope

Buat **satu** API key khusus backend function. Scope minimal:

```text
databases.read
databases.write
users.read
storage.read
storage.write
functions.read
functions.write
```

Aturan keras:

- JANGAN pernah expose API key ini ke frontend.
- Operasi yang bypass permission user (escrow, wallet, release, withdraw, fraud update) HANYA via function ber-API-key.
