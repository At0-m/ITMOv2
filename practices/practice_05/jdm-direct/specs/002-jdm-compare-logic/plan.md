# Implementation Plan: JDM Compare Logic

**Branch**: `[002-jdm-compare-logic]` | **Date**: 2026-10-29 | **Spec**: specs/002-jdm-compare-logic/spec.md

**Input**: Feature specification from `specs/002-jdm-compare-logic/spec.md`

## Summary

Minimal Go net/http backend exposing POST /api/compare per docs/homework5/common-contract.md. Validates a single batched request of exactly two distinct carIds (order significant), computes deterministic import estimates per car using 5% round-half-up auction fee and fixed shipping 180000, and returns atomic success (both results) or a single error envelope with machine-readable code. Output order equals input order.

## 1. Technical Context

- Language/Version: Go (stdlib)
- Frameworks/Libraries: Standard library only (net/http, encoding/json, math)
- Storage: None; deterministic in-memory demo catalog
- External APIs: None
- Target Platform: Local development (Linux/macOS). Simple binary service
- Project Type: Small HTTP service (single endpoint)
- Performance: Sub-10ms locally; deterministic outputs; no external I/O
- Constraints: No web framework/router, no DB, no ORM, no Docker/K8s, no auth
- Frontend: Vite + TypeScript (separate project)
- Contract: docs/homework5/common-contract.md (POST /api/compare)

## 2. Constitution Check

- Specification Before Implementation: Pass (spec exists and aligned with common contract)
- UI / Logic Separation: Pass (server owns business rules; UI consumes HTTP/JSON)
- Contract-First Integration: Pass (request/response envelopes, status codes fixed)
- Backward Compatibility: Pass (no changes to calculator A/B or budget filter)
- Verification Is Mandatory: Addressed via unit + handler tests across happy/error/boundary
- Scope Discipline: Pass (stdlib only, minimal structure)
- Human Decision Points: None remaining
- Evidence: Spec + plan + tests (future)

Gate Status: PASS

## 3. Backend Components & Responsibilities

- internal/catalog
  - Provide deterministic demo dataset (r34, supra, rx7) with purchasePriceJpy and metadata
- internal/domain/types
  - Define Car, CompareRequest, ImportEstimate, SuccessEnvelope, ErrorEnvelope
- internal/validation
  - Validate request JSON and business rules; implement first-error-only with fixed priority
- internal/domain/calc
  - Pure functions for fee and totals; 5% round-half-up to integer JPY
- internal/http/compare
  - HTTP handler for POST /api/compare; JSON decode/encode; preserve order
- internal/errcodes
  - Enumerate machine-readable error codes; helpers for mapping to HTTP codes
- internal/server
  - http.Server setup, mux/route, optional minimal CORS for local dev

## 4. Domain Model

- Car: { id string, purchasePriceJpy int, drivetrain string, engine string }
- CompareRequest: { carIds [2]string }
- ImportEstimate: { carId string, purchasePriceJpy int, auctionFeeJpy int, shippingJpy int, totalImportJpy int }
- SuccessEnvelope: { results []ImportEstimate }
- ErrorEnvelope: { error: { code string, message string } }

## 5. Validation Flow (First Error Only)

Priority and stop-on-first:
1. Malformed request (JSON decode errors; missing/invalid carIds array)
2. Wrong car count (must be exactly 2)
3. Duplicate IDs (two distinct IDs required)
4. Unknown ID (not in demo catalog)

Behavior: Reject before calculation; return single error envelope; map to HTTP status.

## 6. Calculation Flow and Rounding

- auctionFeeJpy = roundHalfUp(0.05 * purchasePriceJpy)
- shippingJpy = 180000
- totalImportJpy = purchasePriceJpy + auctionFeeJpy + shippingJpy
- Integer JPY only; deterministic
- Boundary example for tests: purchasePriceJpy=1000010 → 5% = 50000.5 → auctionFeeJpy=50001; totalImportJpy=1230011

## 7. HTTP Handler Boundary

- Method/Path: POST /api/compare
- Request: { "carIds": ["r34", "supra"] }
- Success (200): { "results": [ImportEstimate, ImportEstimate] } (order equals input)
- Atomicity: No partial success; either two results or an error envelope
- Content-Type: application/json
- CORS (local dev only): minimal headers and OPTIONS support (see Local Run)

## 8. Error Mapping (Codes → HTTP)

- 400 Bad Request: MALFORMED_REQUEST, WRONG_CAR_COUNT, DUPLICATE_CAR_IDS
- 404 Not Found: CAR_NOT_FOUND
- 500 Internal Server Error: INTERNAL_ERROR

## 9. Testing Strategy

- Unit tests (domain):
  - Calculation: 5% round-half-up; totals; boundary 1000010 → 50001; determinism
  - Validation: malformed, wrong count, duplicate, unknown; ensure first-error-only order
- Handler/Integration tests (httptest):
  - Happy path: r34 + supra returns two results; order preserved
  - Malformed: 400 MALFORMED_REQUEST
  - Wrong count: 400 WRONG_CAR_COUNT
  - Duplicate: 400 DUPLICATE_CAR_IDS
  - Unknown: 404 CAR_NOT_FOUND
  - Ordering: results follow `carIds` order
  - Determinism: identical requests yield identical responses

## 10. Local Run (with Vite Frontend)

- Go server on :8081; Vite on :5173
- Minimal CORS for dev:
  - Add headers on /api/compare: `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type`
  - Handle OPTIONS /api/compare with 204 and headers
- No extra infra (no Docker/K8s)

## 11. Protect Existing Features

- Do not modify existing calculator Feature A/B or the Featured budget filter
- Keep demo catalog deterministic; do not change UI data contracts

## 12. Files/Modules Planned

```text
backend/
  go.mod
  cmd/server/main.go                # entrypoint; sets up server and routes
  internal/server/server.go         # http.Server setup; mux wiring
  internal/http/compare_handler.go  # POST /api/compare handler; OPTIONS preflight
  internal/http/cors.go             # minimal CORS helper (local dev only)
  internal/catalog/demo.go          # in-memory demo dataset
  internal/domain/types.go          # domain structs
  internal/domain/calc.go           # fee + total calculation (round-half-up)
  internal/validation/validate.go   # request validation (first-error-only, priority)
  internal/errcodes/codes.go        # error codes and mapping utilities
```

**Structure Decision**: Single minimal Go service using net/http and stdlib only; no framework/router/DB.

## Key Technical Decisions

- net/http over frameworks; stdlib only
- Single endpoint; batched request of two carIds; order preserved
- Atomic compare; first-error-only validation with fixed priority
- Machine-readable error codes with specified HTTP mapping
- Round-half-up monetary rule; integer JPY only
- Minimal CORS for local dev only

## Unresolved Questions

None (blocking questions: None)

---

Plan path: specs/002-jdm-compare-logic/plan.md

Constitution Check: PASS

Planned file tree:

```text
backend/
  go.mod
  cmd/server/main.go
  internal/server/server.go
  internal/http/compare_handler.go
  internal/http/cors.go
  internal/catalog/demo.go
  internal/domain/types.go
  internal/domain/calc.go
  internal/validation/validate.go
  internal/errcodes/codes.go
```

Key technical decisions: see section above
