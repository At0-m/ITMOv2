# Feature Specification: JDM Compare Logic

**Feature Branch**: `[002-jdm-compare-logic]`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "TEAM LOGIC — JDM Compare: backend/domain/API requirements to compare two Featured JDM cars and provide deterministic import cost estimates per car. Production code/tests unchanged; no Go code now; separate UI team/spec; do not change existing frontend features."

## User Scenarios & Testing (mandatory)

### User Story 1 - Compare Two Featured Cars (Priority: P1)

As a user, I want to compare exactly two cars from the Featured JDM catalog and see a deterministic import estimate for each car so that I can make a decision.

**Why this priority**: This is the core business goal for the homework practice.

**Independent Test**: Provide two valid, distinct car IDs (e.g., `r34`, `suprak`). Verify two estimates are returned, each with purchase price, auction fee, shipping, and total, computed via the defined rules.

**Acceptance Scenarios**:

1. Given two valid distinct IDs `r34` and `suprak`, When a compare request is sent, Then the response contains two result entries, one for `r34` and one for `suprak`, each with correctly computed fields and integer JPY values.
2. Given the same valid compare request repeated, When executed again, Then the response values are identical to the prior response (deterministic).

---

### User Story 2 - Handle Validation Errors (Priority: P1)

As a system, I must reject invalid compare requests before attempting calculation to ensure clear error semantics and testable behavior.

**Why this priority**: Validation-first protects domain logic and preserves determinism.

**Independent Test**: Submit malformed payloads, unknown IDs, duplicate IDs, and wrong number of IDs. Verify errors match specified semantics without performing calculations.

**Acceptance Scenarios**:

1. Given a request missing car IDs, When processed, Then a validation error is returned and no calculations are performed.
2. Given fewer than two or more than two IDs, When processed, Then a validation error is returned with a clear problem statement.
3. Given two identical IDs, When processed, Then a validation error is returned indicating duplicates are not allowed.
4. Given an unknown ID (not in demo catalog), When processed, Then a validation error is returned identifying the unknown ID.

---

### User Story 3 - Deterministic Calculation (Priority: P2)

As a user or tester, I expect all monetary outputs to be integers in JPY and the same request to produce identical results to enable reliable testing and comparison.

**Why this priority**: Determinism is explicitly required and ensures reproducibility.

**Independent Test**: Verify repeated requests produce identical totals; verify rounding rule yields the same integer JPY outputs across runs.

**Acceptance Scenarios**:

1. Given a purchase price that produces a fractional 5% fee, When fee rounding is applied, Then the integer result follows the agreed rounding rule and is consistent across runs.

---

### Edge Cases

- Boundary monetary values producing fractional 5% (e.g., purchasePriceJpy not divisible by 20)
- Duplicate IDs in the request
- Wrong number of IDs (less than or greater than two)
- Missing or malformed request structure
- Unknown IDs (not in demo catalog)
- Input order vs output order consistency

## Requirements (mandatory)

### Domain Behavior

- The logic accepts a compare request containing exactly two distinct car identifiers referencing Featured JDM demo catalog entries.
- The logic validates input before any calculation.
- On success, it returns a result per input car with computed import estimate fields.
- Determinism: the same valid input yields the same outputs.
- No randomness, no external rates, no external I/O.
- Existing frontend calculator features (A/B) and Featured budget filter behaviors must remain unchanged.

### Data Required for Calculation

- Demo catalog is static and deterministic for homework purposes with three entries:
  - r34: purchasePriceJpy=5,800,000; drivetrain=AWD; engine=RB26DETT
  - suprak: purchasePriceJpy=4,200,000; drivetrain=RWD; engine=2JZ-GTE
  - rx7: purchasePriceJpy=3,100,000; drivetrain=RWD; engine=13B-REW
- Required fields for calculation per car:
  - `id` (string)
  - `purchasePriceJpy` (integer)
- Non-calculation metadata (drivetrain, engine) may be part of catalog but are not required to compute monetary fields.

### Validation Rules

Validation occurs before any calculation and must reject the request with an error when:

1. Missing car IDs field or malformed request payload
2. Fewer than two IDs provided
3. More than two IDs provided
4. Provided IDs are not distinct (duplicates)
5. Any provided ID does not exist in the demo catalog

Validation behavior:

- Do not call calculation logic if validation fails.
- Provide clear error semantics describing the problem.
- If multiple validation problems exist, the service may report the first encountered or aggregate; aggregation vs single-first is a contract question for UI. [NEEDS CLARIFICATION: Should validation errors be aggregated (all problems) or first-error only?]

### Calculation Rules

For each valid car:

- auctionFeeJpy = 5% of purchasePriceJpy
- shippingJpy = 180,000
- totalImportJpy = purchasePriceJpy + auctionFeeJpy + shippingJpy
- All monetary values are integers in JPY.
- Rounding: [NEEDS CLARIFICATION: Which rounding rule to apply to 5% fee? Options include round half up to nearest JPY, floor (truncate), or ceil.]

### Success Semantics

On successful validation and computation, return, for each input car, at minimum:

- car id
- purchasePriceJpy
- auctionFeeJpy
- shippingJpy
- totalImportJpy

The mapping between each input car and its calculation must be preserved. Output ordering should be predictable. [Assumption] Results are returned in the same order as the input IDs unless otherwise agreed.

### Error Semantics

- Errors are returned for validation failures and for request malformation.
- Domain-level errors should be clearly distinguishable from transport-level issues.
- Suggested error fields (subject to contract): `code` (stable machine-readable), `message` (human-readable), and optionally `details` (structured context such as which ID failed).
- Atomicity: [NEEDS CLARIFICATION: Should compare be atomic (any single-car error fails the whole compare) or allow partial success (return results for valid cars and errors for invalid ones)?]

### Determinism & Boundaries

- Deterministic outputs for the same valid inputs.
- Integer JPY outputs; no floating values in responses.
- No dependence on external network, services, or exchange rates.
- No database requirement for homework; in-memory demo dataset is sufficient.
- Validation-before-calculation is mandatory.
- No changes to existing UI business rules (calculator Feature A/B, Featured budget filter).

### Non-Functional Requirements

- Clear, testable domain semantics with unit-testable behavior.
- Go unit/integration testing required at implementation time (future phase).
- Error semantics suitable for UI presentation and retry logic.

### Functional Requirements

- FR-001: The system must accept exactly two distinct car IDs in a single compare request.
- FR-002: The system must validate input and reject malformed or invalid requests before calculation.
- FR-003: The system must compute `auctionFeeJpy`, `shippingJpy`, and `totalImportJpy` per car using the defined rules.
- FR-004: The system must produce integer JPY values for all monetary fields.
- FR-005: The system must preserve the mapping of input cars to their corresponding results and provide a predictable output order.
- FR-006: The system must be deterministic—identical valid requests yield identical results.
- FR-007: The system must return clear error semantics with stable codes and human-readable messages suitable for UI consumption. [NEEDS CLARIFICATION: exact error shape and coding scheme]

### Key Entities

- Car: id (string), purchasePriceJpy (int), drivetrain (string), engine (string)
- CompareRequest: carIds (array of 2 distinct strings)
- ImportEstimate: carId (string), purchasePriceJpy (int), auctionFeeJpy (int), shippingJpy (int), totalImportJpy (int)
- CompareResponse: results (array of ImportEstimate), or error per Error Semantics

## Success Criteria (mandatory)

### Measurable Outcomes

- SC-001: For valid inputs, two estimates are returned within one second perceived by users (no external dependencies) under standard local conditions.
- SC-002: 100% of repeated identical valid requests produce identical outputs.
- SC-003: 100% of monetary outputs are integers in JPY; no fractional values appear.
- SC-004: Validation prevents calculation on all invalid requests (measured in tests covering all specified error cases).
- SC-005: Happy path scenarios `r34 + suprak` and any other pair from the demo catalog return correct totals per the formulas.

## Assumptions

- Demo catalog remains fixed and deterministic for homework scope.
- Results are returned in the same order as input IDs to simplify UI mapping unless UI specifies otherwise.
- No persistence or history is required.
- No authentication or authorization is required.
- No endpoint path, HTTP method, status codes, or JSON envelope are fixed yet—these require UI contract alignment.

## Acceptance / Test Scenarios

Happy path:
- HP-001: Compare `r34` + `suprak` returns two correct estimates with correct fields and totals.

Boundary:
- B-001: Monetary rounding rule is applied consistently to produce integer `auctionFeeJpy` and totals.
- B-002: Output order is consistent with input order (given the assumption).

Error:
- E-001: Unknown ID -> error referencing the unknown ID; no calculation performed.
- E-002: Duplicate IDs -> error indicating duplicates are not allowed.
- E-003: Wrong number of IDs (<2) -> error indicating exactly two IDs are required.
- E-004: Wrong number of IDs (>2) -> error indicating exactly two IDs are required.
- E-005: Malformed request -> error indicating malformed payload.

Regression:
- R-001: Existing frontend calculator Features A/B and Featured budget filter do not require changes to their business rules as a result of this backend logic feature.

## Out of Scope

- Authentication
- Database and persistence/history
- Real auction APIs
- Currency conversion
- Dynamic shipping pricing
- Admin tools
- Comparing three or more cars
- Checkout/payment
- Production infrastructure

## Needs from Team UI / Open Contract Questions

The following items require UI team agreement. Decisions here directly impact the shared contract. Until resolved, defaults/assumptions are documented above and [NEEDS CLARIFICATION] markers are placed on critical items.

1) Request pattern: [NEEDS CLARIFICATION] Does the UI send two car IDs in a single request, or perform two independent per-car estimates followed by client-side combine?

2) Atomicity vs Partial Success: [NEEDS CLARIFICATION] Should compare fail entirely if any one car is invalid (atomic), or return partial results with per-car errors (partial success)?

3) Error shape and coding: [NEEDS CLARIFICATION] Preferred error payload shape (fields, localization readiness) and whether stable machine-readable codes are required for all error types.

Additional alignment topics (non-blocking unless UI requests changes):
- Output order vs input order guarantees
- Whether backend should also return car title/specs alongside monetary fields
- Any loading/retry expectations and how UI maps errors to the display
- Whether validation should report first error or aggregate multiple errors
