# Verification Matrix

| Area | Case | Expected |
|---|---|---|
| Campaign reward | approved submission | reward masuk `wallet.balance`, bukan `pendingBalance` |
| Campaign reward | rejected submission | tidak ada reward |
| Campaign reward | duplicate event | tidak duplicate reward |
| Campaign budget | reward approved | `remainingBudget` turun, `spentAmount` naik sekali |
| Observation | approval sebelum 72h | current review rule tetap menolak |
| Rate Card | regression | tidak terpengaruh |
| Withdrawal request | saldo cukup | row `requested`, balance debit, no payout call |
| Withdrawal request | saldo kurang | reject, tidak ada debit |
| Withdrawal request | duplicate requestKey | tidak double debit |
| Withdrawal request | concurrent requests | balance tidak negatif |
| Admin auth | non-admin queue | 403 |
| Admin auth | non-admin mutation | 403 |
| Admin queue | requested | tampil di queue |
| Admin processing | requested → processing | valid |
| Admin processing | processing → succeeded | valid dengan transfer reference |
| Admin processing | requested → succeeded langsung | reject |
| Admin failure | requested/processing fail | reversal tepat sekali |
| Admin retry | repeated fail | tidak double-credit |
| Creator UI | request success | “pengajuan diterima”, bukan “uang berhasil ditransfer” |
| Creator UI | wallet | balance berkurang dari authoritative `balanceAfter` |
| Creator UI | transaction | initial status pending |
| Legacy | existing pendingBalance | tidak hilang saat rollout |
| Legacy | Iris processing withdrawal | callback tidak dimatikan sebelum terminal |
| Security | browser update wallet | tetap tidak diizinkan |
| Security | client marks withdrawal success | tidak ada path |
| Build | root web | typecheck/lint/build sesuai package scripts |
| Build | admin | typecheck/lint/build sesuai package scripts |
| Backend | Functions | targeted tests/syntax pass |
| Staging | success flow | runtime UAT pass setelah deploy |
| Staging | reversal flow | runtime UAT pass setelah deploy |

## UAT Definition

Jangan menulis `E2E PASS` hanya berdasarkan unit test.

`Staging E2E PASS` hanya boleh ditulis jika schema, Functions, root web, dan admin sudah deployed dan flow creator request → admin processing → manual transfer → succeeded benar-benar diuji di staging, termasuk wallet/ledger verification.

Phase 06 evidence status:
- success flow: PASS
- reversal flow: PASS
- Manual Admin Withdrawal Phase 06 Staging E2E: PASS
