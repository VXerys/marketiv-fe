# Spec 02 — Tasks

## A. Audit

- [ ] Re-read UMKM and Kreator room load/realtime logic.
- [ ] Re-read `src/lib/appwrite/realtime.ts` restrictions.
- [ ] Confirm DTO stage derivation in both negotiation Functions.
- [ ] Inspect current route handling / search params.
- [ ] Inspect current payment modal + success modal behavior.

## B. Shared sync

- [ ] Implement reusable, scoped room sync helper/hook.
- [ ] Preserve message realtime.
- [ ] Add authoritative polling on nonterminal/transient stages.
- [ ] Add window focus/visibility refresh.
- [ ] Prevent overlapping requests.
- [ ] Pause hidden tab.
- [ ] Stop on unmount/terminal state.

## C. UMKM deal → payment UX

- [ ] Add obvious primary payment CTA for `pending_payment`.
- [ ] Keep final amount from authoritative order DTO.
- [ ] Reuse existing modal styling/tokens.
- [ ] Rename misleading “Simulation” component if appropriate.
- [ ] Disable duplicate action while payment intent is being requested.
- [ ] Handle reused pending payment from Spec 01.

## D. Payment return verification

- [ ] Add non-authoritative `payment_return` marker to finish URL.
- [ ] Detect return marker in room.
- [ ] Show “Memeriksa pembayaran...” state.
- [ ] Poll authoritative room.
- [ ] Confirm only after backend progresses to paid/escrow-derived order state.
- [ ] Timeout to unresolved, not success.
- [ ] `Periksa lagi` triggers authoritative recheck.
- [ ] Remove marker after stable resolution.
- [ ] Never client-update payment/order to success.

## E. Remove false success path

- [ ] Audit branch where payment intent has no `redirectUrl`.
- [ ] Do not show `OrderSuccessModal` merely because Function call succeeded.
- [ ] If Snap token is not actually integrated in-page, treat missing redirect as actionable error.

## F. Cross-role state sync

- [ ] Kreator sees order after accept.
- [ ] UMKM sees `pending_payment` without refresh.
- [ ] Both sides see `in_progress` after escrow.
- [ ] Deliverable/revision changes become visible without full reload.
- [ ] Completed state stabilizes and polling stops.

## G. Tests

- [ ] offer pending → creator accept → UMKM sees pay CTA.
- [ ] offer reject → UMKM sees rejected state.
- [ ] accepted event → order delayed → awaiting state resolves.
- [ ] payment return before webhook → verifying state.
- [ ] webhook later → in_progress success state.
- [ ] payment return but no webhook → unresolved, no false success.
- [ ] duplicate/reused payment response.
- [ ] tab hidden → polling paused.
- [ ] unmount → no state update warning.
- [ ] message realtime remains working.
- [ ] deliverable/revision refresh.
- [ ] terminal state stops poll.

## H. Verification

- [ ] targeted tests.
- [ ] typecheck.
- [ ] lint touched files.
- [ ] build.
- [ ] manual two-session staging test after deployment.
