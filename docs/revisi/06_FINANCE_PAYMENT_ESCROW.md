# 06 — Finance / Payment / Escrow
Route: `/dashboard/umkm/keuangan`

Findings: `UMKM-FIN-01`, `UMKM-FIN-03`, `UMKM-DATA-03`; dependency `UMKM-SEC-01`.

Source:
- `FinanceOverviewPage.tsx`
- `PendingPaymentModal.tsx`
- transaction mapper
- `create-payment`
- `midtrans-webhook`
- `create-escrow`
- `release-escrow`
- `get-umkm-finance-summary`

Do:
1. fix settlement recovery;
2. fix base/fee/total DTO;
3. add reconciliation;
4. expose truncation.

Preserve:
- webhook signature/gross validation;
- server payment authority;
- Rate Card seller-side fee.

Verify:
- campaign total = base + fee;
- Rate Card buyer total = agreed price;
- duplicate/out-of-order webhook;
- failure injection around wallet credit;
- released escrow always has ledger + credited balance.
