# Acceptance Test Matrix — UI Phase

## Creator

| ID | Given | When | Expected |
|---|---|---|---|
| C-01 | claim `claimed`, TikTok campaign, no submission | open detail | TikTok shown as read-only platform; submit form visible |
| C-02 | no platform can be resolved | open detail | submit disabled + explicit configuration error |
| C-03 | TikTok campaign | enter Instagram URL | inline mismatch error; Function not called |
| C-04 | TikTok campaign | enter valid TikTok URL | confirmation modal shows exact URL |
| C-05 | valid input | backend submit succeeds | local/UI state becomes pending; success says Marketiv verifies |
| C-06 | valid input | backend returns 409 duplicate | no fake success; explicit already-submitted message + refresh path |
| C-07 | submission pending | open detail | no form; views `Belum diverifikasi`; reward `Belum dihitung` |
| C-08 | pending + fraud review | open detail | risk warning separated from final status |
| C-09 | approved + locked views | open detail | `Disetujui`; locked views displayed |
| C-10 | rejected + reason | open detail | reason shown; no reward-cair claim |
| C-11 | any state | inspect timeline | no copy assigns validation to UMKM |

## UMKM

| ID | Given | When | Expected |
|---|---|---|---|
| U-01 | campaign with 2 pending submissions | open detail | metric says `Menunggu Validasi`; no action asks UMKM to inspect |
| U-02 | pending row | render card | `Belum diverifikasi`, reward `—`, `Lihat Detail` only |
| U-03 | pending row | open detail | modal read-only, no approve/reject/views input |
| U-04 | approved row | render/open | verified views/reward terminology only; no mutation |
| U-05 | rejected row with reason | open detail | reason displayed read-only |
| U-06 | submission request fails | render section | error/retry, not “Belum ada submission” |
| U-07 | no submissions | render section | true empty state |
| U-08 | campaign detail | inspect quick action | `Lihat Bukti Konten`, not `Periksa` |
| U-09 | pending exists | inspect health card | says waiting for Marketiv validation |

## Data Mapper

| ID | Input | Expected |
|---|---|---|
| D-01 | `views_final=true`, `views_count=15000`, `views=0` | UI verified views = 15000 |
| D-02 | legacy `views=8000`, no new fields | safe backward-compatible display, not falsely labeled locked if metadata absent |
| D-03 | Campaign reward rate 10k, 15k final views | calculated Campaign reward = 150k before budget cap semantics; no 2% creator deduction |
| D-04 | campaign platforms contains TikTok, no submission | Creator work platform resolves TikTok |

## Static Contract Checks

```bash
# UMKM mutation surface must be gone
rg -n "ReviewSubmissionModal|handleReviewConfirm|Setujui Pembayaran|Tolak Konten|Keputusan Anda" src/components/features/umkm-dashboard/campaign

# stale Creator authority copy must be gone
rg -n "UMKM.*(memverifikasi|verifikasi jumlah|menyetujui bukti|memasukkan jumlah views)" src/components/features/creator-dashboard

# no new direct DB writes in edited UI components
rg -n "createDocument|updateDocument|deleteDocument" src/components/features/creator-dashboard/ActiveWorkDetailView.tsx src/components/features/umkm-dashboard/campaign
```

Expected result for the first two searches: no active user-facing occurrences. Third search: no direct mutation calls introduced.

## Build Gate

Use repository-defined commands from `package.json`; at minimum the implementation report must contain results for:

- type/build;
- lint if configured;
- relevant unit tests;
- manual responsive check.

Do not report “E2E complete” from UI phase.
