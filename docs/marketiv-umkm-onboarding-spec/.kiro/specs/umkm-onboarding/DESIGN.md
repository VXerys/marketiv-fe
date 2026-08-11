# Design

## Pattern
Use a small client-side onboarding module with:
- stable anchor IDs (`data-onboarding="..."`)
- typed step config
- current step + status state
- route-aware resume
- versioned persistence
- reusable overlay/popover

## State
`idle | active | completed | skipped`

Persist minimally:
- version
- status
- current step/phase when needed

Prefer existing repository utilities/components. Do not add a tour package unless implementation evidence shows the internal approach is materially worse.

## Route rule
A route transition is a state transition, not a single DOM-selector sequence. Persist phase before navigation; resolve target after destination renders.
