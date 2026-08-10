# 04 — Creator Marketplace
Route: `/dashboard/umkm/kreator`

Findings: `UMKM-DATA-01`, `UMKM-DATA-02`; dependency `UMKM-SEC-03`.

Source:
- `CreatorDirectoryPage.tsx`
- `CreatorSummaryCards.tsx`
- `CreatorDetailPage.tsx`
- `StartNegotiationModal.tsx`
- `get-creator-directory/src/main.js`

Do:
- pagination + total;
- package fetch error != no package;
- negotiation start requires backend UMKM role.

Keep flow: search creator -> package reference -> negotiation.

Verify: 0/100/>100 creators, no package, package API failure, wrong-role start negotiation denied.
