# Research — TEAM UI: JDM Compare

This document consolidates decisions and resolves unknowns from the Technical Context.

## Unknowns and Resolutions

1. Triggering compare request timing
- Decision: Manual via a button in the comparison view.
- Rationale: Aligns with spec and avoids surprise network activity.
- Alternatives: Auto on entry — rejected to preserve user control and accessibility.

2. Loading semantics
- Decision: Single compare-level loading state for one atomic request; no per-car success/error states.
- Rationale: Matches common-contract atomicity; prevents inconsistent UI.
- Alternatives: Per-car parallel requests — rejected by contract and complexity.

3. Error handling scope
- Decision: Single compare-level error with preserved selections and retry.
- Rationale: Matches error envelope in contract; preserves user context.
- Alternatives: Per-car error — rejected due to atomic request.

4. Order and totals source of truth
- Decision: Display backend `purchasePriceJpy` alongside other monetary fields; respect order of results matching `carIds`.
- Rationale: Ensures consistency; avoids drift from local cache.
- Alternatives: Use local price for base price — rejected to avoid inconsistency.

5. Budget filter interaction
- Decision: Preserve selections when filtered out; indicate hidden selection; keep compare action available at 2/2.
- Rationale: Matches spec and preserves user intent.
- Alternatives: Auto-deselect on filter change — rejected as destructive.

6. Accessibility
- Decision: Keyboard operability, visible focus, ARIA live regions for loading/error; non-color indicators for selection.
- Rationale: Meets WCAG 2.1 AA goals in spec.

## Best Practices Consulted

- Atomic UX for batched operations: communicate single loading state and prevent duplicate submits.
- Sticky action bar on mobile: ensure it does not obscure content; keyboard reachable; ARIA roles for status where applicable.
- Live regions: use polite for loading, assertive for errors; avoid rapid repetitive announcements.

## Final Decisions Summary

- One atomic POST `/api/compare` per compare, manual trigger.
- Single compare-level loading and error states; selections preserved.
- Use backend-provided monetary fields; highlight cheaper total only on success.
- Budget filter preserves selections and indicates hidden items.
