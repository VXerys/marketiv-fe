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
| `campaign_claims` | R own, C (claim), U (submit), D (unclaim) | R + U claims on own campaign | Full | — |
| `campaign_submissions` | R own, C | R on own campaign, **U (approve/reject) — satu-satunya yang boleh update** | Full | fraud update |
| `offers` | R own, U (accept/reject) | C, R own, U (cancel) | Read only | — |
| `orders` | R related | R related | Full | C/U (dari offer accepted) |
| `payments` | R related | R own | Read all | CREATE, UPDATE status (via `create-payment` / `midtrans-webhook`) |
| `escrows` | NO ACCESS | NO ACCESS | Read only | CREATE/UPDATE/RELEASE |
| `wallets` | R own | R own | Read only | UPDATE balance, TRANSFER, RELEASE escrow, WITHDRAW |
| `transactions` | R own | R own | Read all | CREATE |
| `withdrawals` | C, R own | C, R own | APPROVE/REJECT/COMPLETE | — |
| `notifications` | R own | R own | CREATE system notif | CREATE |
| `conversations`/`messages` (Chat) | R own room, send msg | R own room, send msg | Read only | — |

Catatan: Escrow tidak boleh disentuh user sama sekali; hanya Function (API key) yang menulis.

## Aturan Level Koleksi — permission Appwrite bersifat UNION

Dengan `documentSecurity` aktif, Appwrite memberi akses bila izin ada di level
**koleksi ATAU** level baris. Jadi izin level koleksi adalah **lantai**, bukan
batas atas: `update("users")` di level koleksi berarti *setiap user yang login
boleh mengubah baris siapa pun*, dan seluruh permission per-baris di bawah
menjadi tidak berarti.

**Tidak boleh ada tabel dengan `update("users")` di level koleksi.** Per
2026-07-29 seluruh 28 tabel sudah bersih (gelombang 5 `harden-permissions.mjs`).

Aturan ini ditulis setelah audit menemukan dua jalur eksploitasi nyata yang
lolos justru karena permission per-barisnya sudah benar tapi level koleksinya
longgar:

- `campaign_submissions` — akun mana pun bisa menulis `status: "approved"` ke
  submission siapa pun, memicu `calculate-campaign-reward` menambah
  `wallets.pendingBalance` kreator, lalu dicairkan lewat `request-withdrawal`.
- `campaigns` — akun mana pun bisa menulis `status: "active"` +
  `remainingBudget`, melewati Midtrans, `create-escrow`, dan guard
  `remainingBudget > 0` di `publishCampaign` sekaligus.

`read("any")` di level koleksi tetap sah untuk data yang memang publik
(`campaigns`, `creator_profiles`, `rate_cards`, dan tabel pendukungnya) — Job
Pool, direktori kreator, dan katalog rate card bergantung padanya.

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

> Kreator **tidak** diberi `update`. Menulis `status: "approved"` di baris ini
> memicu `calculate-campaign-reward` mengkredit wallet kreator — memberi kreator
> `update` sama dengan mengizinkannya menyetujui pekerjaannya sendiri lalu
> mencairkan dananya. Aturan yang sama berlaku untuk `deliverables` di Alur B.

**Claim** (saat dibuat):

```javascript
Permission.read(Role.user(creatorId)),
Permission.update(Role.user(creatorId)),   // submit bukti
Permission.delete(Role.user(creatorId)),   // unclaim
Permission.read(Role.user(umkmId)),
Permission.update(Role.user(umkmId))       // sinkron status saat review
```

**Chat Message**:

```javascript
Permission.read(Role.user(senderId)),
Permission.read(Role.user(receiverId))
```

> Chat tidak mendukung attachment. Hanya pesan teks dan offer.

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
