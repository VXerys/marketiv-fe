# Requirements

## Functional
R1. First eligible UMKM user can start a dashboard onboarding tour.
R2. Tour targets existing dashboard controls via stable anchors.
R3. Tour can hand off to Campaign creation without losing state.
R4. User can skip/close without blocking normal dashboard use.
R5. Existing `/dashboard/umkm/panduan` can replay the tour.
R6. Completion is versioned so future tours can be introduced safely.

## Quality
Q1. No visual redesign.
Q2. No Campaign/Rate Card flow mixing.
Q3. No client-side payment/business-state changes.
Q4. Keyboard/ESC/focus behavior must be usable.
Q5. Missing target must fail safely, never crash/navigation-loop.
Q6. Mobile and desktop dashboard remain usable.
