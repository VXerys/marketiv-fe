# Workflow — Dispute Resolution SOP

This document provides a step-by-step Standard Operating Procedure (SOP) for implementing UI components and backend workflows when a Rate Card Mode order enters a dispute in Marketiv.

---

## Step 1 — Initiating a Dispute (Freeze Escrow)

Disputes are triggered when there is a disagreement on deliverables in Rate Card Mode:

1. **Dispute Button:** Provide an "Ajukan Sengketa" button on `/dashboard/umkm/negosiasi/[orderId]` and `/dashboard/kreator/negosiasi/[orderId]`.
2. **Trigger Action:** The button must trigger a Server Action (`file:///src/lib/actions/dispute.ts`) which invokes a secure Appwrite Function:
   - Sets `Order.status = "disputed"`.
   - Freezes the escrow release state for this order.
   - Creates a new document in the `Disputes` collection.
3. **Frontend Feedback:** Both users' chat rooms and order detail panels should update immediately via Appwrite Realtime, displaying a prominent red alert banner:
   > "Status pesanan ditangguhkan karena sengketa. Pembayaran ditahan di Escrow dan menunggu mediasi Admin."

---

## Step 2 — Evidence Collection Interface

Once a dispute is active, both parties must submit evidence:

1. **Evidence Upload Form:** Slicing a form under the order details section:
   - A description text field (`Textarea`) explaining the issue.
   - Image file uploaders (restricted to screenshots supporting the claim, maximum file size **100MB** directly to Appwrite Storage).
2. **Read-only Submissions:** Once submitted, the evidence must be saved as child references inside the `Disputes` document and rendered in a read-only layout block.
3. **Locking Interactions:** Disable other order actions (such as "Selesaikan Pesanan" or "Kirim Link Posting") while the dispute is in mediation.

---

## Step 3 — Admin Mediation & Verdict UI

Admin operations handle dispute resolution under `/admin/disputes/[disputeId]`:

1. **Evidence View Panel:** Build a split-screen layout for Admin:
   - Left side: UMKM's contract deliverables description and submitted evidence.
   - Right side: Kreator's completed collab post proof and evidence.
2. **Mediation Resolution Actions:** Render two primary action buttons with explicit confirmation modals:
   - **Refund to UMKM:** Releases the escrow funds back to the UMKM's wallet.
   - **Payout to Kreator:** Releases the escrow funds to the Kreator's wallet.
3. **Reason Requirement:** The admin **must** fill in a text field explaining the resolution verdict before resolving the dispute.

---

## Step 4 — Resolving the Dispute (Escrow Release)

When the Admin submits the verdict:

1. **Trigger Appwrite Function:** Call the secure Appwrite Function (`resolveDispute`) to perform the database operations inside a single, secure execution:
   - Update `Disputes.status = "resolved"`.
   - Set `Orders.status = "refunded"` or `"completed"`.
   - Create a `Transactions` ledger record logging the release or refund.
   - Adjust target wallet balance (`Profiles.walletBalance`).
   - Write an entry in the `Audit Logs` with the admin's verdict reason, action, actor, target entity, and timestamp.
2. **Notify Users:** Broadcast the resolution event to the participants' dashboards and trigger system notifications.
