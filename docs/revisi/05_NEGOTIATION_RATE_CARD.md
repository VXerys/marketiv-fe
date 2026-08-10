# 05 — Negotiation / Rate Card
Route: `/dashboard/umkm/negosiasi`

P0 findings: `UMKM-SEC-01`, `UMKM-SEC-03`, `UMKM-SEC-04`, dependency `UMKM-FIN-01`.

Source:
- `NegotiationListPage.tsx`
- `NegotiationRoomPage.tsx`
- `conversation-appwrite.service.ts`
- `create-conversation/src/main.js`
- `send-message/src/main.js`
- `create-offer/src/main.js`
- `create-order/src/main.js`

Order:
1. lock `orders`;
2. enforce roles;
3. lock conversation/message;
4. validate full Rate Card flow.

Invariant: client cannot mutate financial, participant, or history authority.

Direct negative tests:
- update order amount/status/creatorId denied;
- edit message sender/content denied;
- edit conversation participants denied;
- wrong-role Function call denied.

E2E: chat -> offer -> accept -> order -> pay -> work -> approve -> settlement.
