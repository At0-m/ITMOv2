# Proposal

## Why

Users browsing Featured JDM often have a hard budget in JPY. Today the Featured list always shows all cars, forcing manual scanning. Adding a budget filter improves relevance without touching backend/APIs (not used here) and keeps the existing calculator features unchanged.

## What Changes

- Add a budget filter to Featured JDM that narrows results to cars with `priceJpy <= budget`.
- Input semantics: filter applies on submit; empty or whitespace-only means "no filter"; non-empty must be a finite INTEGER in range 1..100000000 JPY; fractional JPY is invalid.
- Inclusive boundary: `priceJpy <= budget`.
- UI shows price on every card; prices are demonstrational and hardcoded for this catalog. No external API/backend is used.
- On invalid non-empty input: show a clear error and do not change the currently displayed set.
- Reset: clears input and error, hides empty state, restores the full list in original order.

### Catalog (demo data)
- Nissan Skyline GT-R R34 — 5_800_000 JPY
- Toyota Supra A80 — 4_200_000 JPY
- Mazda RX-7 FD3S — 3_100_000 JPY

## Capabilities

### New Capabilities
- catalog/featured-budget-filter: Client-side budget filtering for the Featured JDM catalog by `priceJpy` in JPY.

### Modified Capabilities
- (none)

## Impact

- Frontend only: DOM stays in `src/main.ts`; new pure domain logic added separately (e.g., `validateBudget(...)`, `filterCarsByBudget(...)`).
- No backend/API, no new dependencies, no data/model changes.
- Calculator Feature A/B remains unchanged; `src/priceValidation.ts` unchanged unless explicitly approved.
- Tests: add unit tests for pure functions; keep existing 16 baseline tests green; `scripts/check.sh` remains the full check.

## Out of Scope

- Go/backend/API; full catalog; search; sorting; multiple filters; URL state; calculator behavior changes; redesign; new frameworks/dependencies.
