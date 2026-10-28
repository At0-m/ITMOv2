# Common Contract — JDM Compare (UI ↔ Logic)

Status: Agreed pre-implementation contract for Homework 5. Do not implement beyond this scope. This document aligns Team UI and Team Logic and resolves open questions from both specs.

## 1. Purpose

Provide a single, deterministic, atomic compare operation for exactly two Featured JDM cars, returning a backend-calculated import estimate per car for UI presentation and decision highlighting.

## 2. Decisions Resolved From Team UI

- Compare is initiated manually via a prominent button labeled "Сравнить 2 автомобиля".
- UI sends one request containing both car IDs (no per-car requests).
- One compare request corresponds to a single UI loading state. During loading, submit is disabled and selection is preserved.
- On error, selection is preserved; UI displays error and user may retry the same comparison.
- UI displays a sticky comparison tray within Featured. When one selected: show 1/2 and compare disabled. When two selected: show 2/2 and compare enabled. Tray includes reset comparison. On narrow/mobile, tray is full-width.
- Budget filter interaction: selections survive filtering. If a selected car is hidden, tray clearly indicates it; compare remains based on the two selected IDs; user can reset filter. Budget filter behavior itself does not change.
- Cheaper highlight only after a complete successful response; there is no one-success/one-failure state.

## 3. Decisions Resolved From Team Logic

- Request is atomic for two cars. If the request or either car ID is invalid, the whole compare fails (no partial success).
- Validation reports the first error only, with deterministic priority (see section 7).
- Output order must match the input `carIds` order.
- All monetary values are integer JPY. Auction fee is 5% of purchase price with round half up to the nearest JPY. Shipping is a fixed 180000 JPY per car.
- Backend owns calculation logic. UI must not calculate `auctionFeeJpy`, `shippingJpy`, or `totalImportJpy`.
- Endpoint, method, and error envelope are fixed as specified below.

## 4. Request Schema

HTTP
- Method: POST
- Path: `/api/compare`
- Content-Type: `application/json`

Body shape
```
{
  "carIds": [string, string]
}
```

Constraints
- `carIds` must contain exactly two distinct strings.
- IDs refer to Featured demo catalog entries. Both must exist.

Example
```
{
  "carIds": ["r34", "supra"]
}
```

## 5. Success Response Schema (200)

Body shape
```
{
  "results": [
    {
      "carId": string,
      "purchasePriceJpy": integer,
      "auctionFeeJpy": integer,
      "shippingJpy": integer,
      "totalImportJpy": integer
    },
    {
      "carId": string,
      "purchasePriceJpy": integer,
      "auctionFeeJpy": integer,
      "shippingJpy": integer,
      "totalImportJpy": integer
    }
  ]
}
```

Rules
- Exactly two result objects.
- Result order matches the request `carIds` order.
- `totalImportJpy = purchasePriceJpy + auctionFeeJpy + shippingJpy`.
- All monetary values are integer JPY (see rounding in section 8).

Example
```
{
  "results": [
    {
      "carId": "r34",
      "purchasePriceJpy": 5800000,
      "auctionFeeJpy": 290000,
      "shippingJpy": 180000,
      "totalImportJpy": 6270000
    },
    {
      "carId": "supra",
      "purchasePriceJpy": 4200000,
      "auctionFeeJpy": 210000,
      "shippingJpy": 180000,
      "totalImportJpy": 4590000
    }
  ]
}
```

## 6. Error Schema and HTTP Mapping

Error envelope
```
{
  "error": {
    "code": string,   // stable machine-readable
    "message": string // human-readable
  }
}
```

Required machine-readable codes
- `MALFORMED_REQUEST`
- `WRONG_CAR_COUNT`
- `DUPLICATE_CAR_IDS`
- `CAR_NOT_FOUND`
- `INTERNAL_ERROR`

HTTP mapping
- 400 Bad Request: `MALFORMED_REQUEST`, `WRONG_CAR_COUNT`, `DUPLICATE_CAR_IDS`
- 404 Not Found: `CAR_NOT_FOUND`
- 500 Internal Server Error: `INTERNAL_ERROR`

Notes
- Validation reports the first error only (see section 7).

## 7. Validation Priority (deterministic)

Order of checks; stop on first failure:
1. Malformed request (missing body, wrong types, missing `carIds` field, non-array, non-strings)
2. Wrong car count (array length not equal to 2)
3. Duplicate car IDs (two identical strings)
4. Unknown car ID (any provided ID not found in catalog)

## 8. Calculation and Rounding Rules

- `auctionFeeJpy = round_half_up(0.05 × purchasePriceJpy)`
- `shippingJpy = 180000`
- `totalImportJpy = purchasePriceJpy + auctionFeeJpy + shippingJpy`
- All monetary values are integer JPY.
- Rounding: round half up to the nearest integer JPY (0.5 → up).

## 9. UI State ↔ Backend Result Mapping

- Idle / Selection: UI allows selecting up to two cars; tray shows 0/2, 1/2, or 2/2.
- Compare action: Enabled only at 2/2; click sends one POST `/api/compare` with two distinct IDs.
- Loading: One compare-level loading state. Submit disabled; selection preserved; per-car skeletons allowed visually, but there is no per-car success/error state.
- Success: Display for each car the backend values: `purchasePriceJpy`, `auctionFeeJpy`, `shippingJpy`, `totalImportJpy`. Highlight the cheaper car by `totalImportJpy`. For consistency, show the `purchasePriceJpy` returned by backend (do not trust local cache if it diverges).
- Error: Show a single compare-level error based on the error envelope. Selections remain; user may retry.
- Budget filter: Selections persist through filtering; tray indicates hidden selected items; compare remains based on the selected IDs regardless of current filter visibility.

## 10. Ownership Boundaries

- Backend (Logic)
  - Owns calculation logic and monetary fields: `auctionFeeJpy`, `shippingJpy`, `totalImportJpy`.
  - Validates request per section 7 and returns errors per section 6.
  - Guarantees deterministic outputs and order.
  - Defines and maintains the demo catalog for this homework.

- Frontend (UI)
  - Must not calculate monetary fields.
  - May render local Featured metadata (title, image, engine, drivetrain, local card purchase price), but the comparison panel must display the backend `purchasePriceJpy` for consistency with calculations.
  - Manages selection, loading state, error display, retry, sticky tray, and budget filter UI indications.

## 11. Backward Compatibility Requirements

- The endpoint path, method, request, and response shapes above are stable for this homework.
- Additive, non-breaking extensions are allowed in the future (e.g., adding optional fields) but must not change existing fields’ semantics.
- Error codes listed in section 6 are stable; new codes may be added without breaking existing clients as long as HTTP mapping remains consistent.
- Output order must continue matching input order.

## 12. Acceptance Examples

1) Success: `r34 + supra`
Request
```
POST /api/compare
{
  "carIds": ["r34", "supra"]
}
```
Response 200
```
{
  "results": [
    {"carId":"r34","purchasePriceJpy":5800000,"auctionFeeJpy":290000,"shippingJpy":180000,"totalImportJpy":6270000},
    {"carId":"supra","purchasePriceJpy":4200000,"auctionFeeJpy":210000,"shippingJpy":180000,"totalImportJpy":4590000}
  ]
}
```

2) Error: duplicate IDs
Request
```
{"carIds":["r34","r34"]}
```
Response 400
```
{"error":{"code":"DUPLICATE_CAR_IDS","message":"..."}}
```

3) Error: unknown ID
Request
```
{"carIds":["r34","unknown"]}
```
Response 404
```
{"error":{"code":"CAR_NOT_FOUND","message":"..."}}
```

4) Error: wrong count
Requests
```
{"carIds":["r34"]}
{"carIds":["r34","supra","rx7"]}
```
Response 400
```
{"error":{"code":"WRONG_CAR_COUNT","message":"..."}}
```

5) Error: malformed request
Requests (examples)
```
{}
{"carIds":"r34,supra"}
{"carIds":[1,"r34"]}
```
Response 400
```
{"error":{"code":"MALFORMED_REQUEST","message":"..."}}
```

6) Boundary: rounding half up (calculation example only)

Purpose: numeric boundary example to verify round-half-up behavior. This does not add a new car to the demo catalog; it is solely for rounding verification.

Given
```
purchasePriceJpy = 1000010
5% of purchasePriceJpy = 50000.5
round_half_up(50000.5) -> auctionFeeJpy = 50001
shippingJpy = 180000
totalImportJpy = 1000010 + 50001 + 180000 = 1230011
```

## 13. Open Questions

None. All previously raised questions in both specs are resolved by this contract.

---

# Spec Alignment Review — Required Updates Next

This section lists concrete places in each spec to update so they match the common contract. Do not edit now; apply in the next step.

## A) specs/001-jdm-compare-ui/spec.md (TEAM UI)

- User Story 4 (lines 61–73): Change loading semantics to one compare-level loading state; remove suggestion of per-car parallel submissions.
- User Story 6 (lines 91–103): Replace "error for one or both cars" and per-car error notion with a single compare-level error. Keep selections and retry per contract.
- Edge Cases (lines 135–142): Remove/adjust "Network delay on one car only: show per-car loading/error so partial results don’t block the other" to reflect atomic request and single loading/error state. You may keep per-car visual skeletons, but not per-car success/error states.
- Requirements FR-006/FR-007 (lines 151–157): Ensure wording reflects one request for two cars and a single loading state; UI displays backend-calculated monetary fields only.
- Key Entities (lines 160–164): Update `ImportEstimate` status semantics. Either make status compare-level, or ensure that per-car status is only success after the whole response succeeds; remove per-car error path.
- Validation/User Feedback (lines 192–200): Ensure error messaging is compare-level. Keep max-selection and duplicate-selection UI behavior.
- Needs from Team Logic (lines 230–238): Replace open inputs with the finalized contract: single POST `/api/compare`, request/response shapes, atomic compare, error envelope and codes, output order equals input order, first-error-only validation.
- Assumptions (lines 241–246): Remove assumptions suggesting per-car independent returns; state that results arrive as a batch.
- Open Questions (lines 247–251): Resolve as follows: 1) Manual trigger via "Сравнить 2 автомобиля"; 2) Highlight only after both totals are known; 3) Placement: use sticky comparison tray within Featured; on mobile, full-width.
- Data Source Consistency: In the comparison breakdown, display `purchasePriceJpy` returned by backend (not only local cached price) for calculation consistency.

## B) specs/002-jdm-compare-logic/spec.md (TEAM LOGIC)

- Demo Catalog IDs (lines 81–85): Rename `suprak` to `supra` to match the agreed examples and UI expectations.
- Validation Rules (lines 90–105): Fix the aggregation note. Set validation to report the first error only. Add explicit deterministic priority: malformed request → wrong count → duplicate IDs → unknown ID.
- Calculation Rules (lines 106–115): Set rounding to round half up to the nearest JPY for the 5% auction fee. Confirm shipping fixed at 180000 JPY.
- Success Semantics (lines 116–127): Make output order explicitly match input `carIds` order.
- Error Semantics (lines 128–134): Resolve atomicity: the whole compare fails on any single-car error; no partial success. Define error envelope `{error:{code,message}}` and stable codes.
- Functional Requirements (lines 150–159): Add FRs for endpoint and error coding stability if desired, or reference this contract.
- Assumptions (lines 177–184): Replace "no endpoint path/method/status fixed yet" with the contract: POST `/api/compare`, shapes as defined, HTTP code mapping per section 6.
- Acceptance / Test Scenarios (lines 185–203): Update happy path pair to `r34 + supra`. Add tests enforcing output order equals input order and first-error-only behavior. Add HTTP mapping tests for 400/404/500 per code.
- Needs from Team UI / Open Contract Questions (lines 216–230): Mark items 1–3 as resolved per this document: single batched request, atomic compare, error shape/codes provided. Remove the remaining aggregation/partial success open item.

End of document.
