# Data Model — TEAM UI: JDM Compare

This is a UI-concept model derived from the feature spec and the agreed backend contract.

## Entities

1. Car (UI concept)
- id: string
- name: string
- imageUrl: string
- purchasePriceJpy: number (from existing data for cards; in comparison panel, display backend value)
- drivetrain: string
- engine: string
- keySpecs: Record<string,string> | string[]
- selected: boolean (UI state)
- hiddenByFilter: boolean (derived UI state)

2. CompareRequest (UI concept)
- carIds: [string, string] — exactly two distinct IDs; order preserved

3. CompareResult (UI concept)
- results: Array<{
  - carId: string
  - purchasePriceJpy: number
  - auctionFeeJpy: number
  - shippingJpy: number
  - totalImportJpy: number
}>
- invariant: results length = 2; order matches input `carIds`

4. CompareError (UI concept)
- error: {
  - code: 'MALFORMED_REQUEST' | 'WRONG_CAR_COUNT' | 'DUPLICATE_CAR_IDS' | 'CAR_NOT_FOUND' | 'INTERNAL_ERROR'
  - message: string
}

## State Transitions

- Idle → Selecting: user toggles selection on cards; `selected` state updates, counter reflects 0/2, 1/2, 2/2.
- Selecting (2/2) → Comparing: user triggers compare; UI enters compare-level loading; submit disabled.
- Comparing → Success: receive `CompareResult`; render breakdowns; highlight cheaper by `totalImportJpy`.
- Comparing → Error: receive `CompareError`; show compare-level error; keep selections; allow retry.
- Any → Reset: user clicks reset; clear selections; counter returns to 0/2; budget filter unchanged.
- Selecting with filter change: `hiddenByFilter` may toggle; selections persist; notice indicates hidden selections.

## Validation Rules (UI)

- Prevent selecting more than two cars; show non-blocking feedback at 3rd attempt; do not auto-deselect existing selections.
- Prevent duplicate selection of the same car.
- Compare action enabled only at exactly 2 selections.
