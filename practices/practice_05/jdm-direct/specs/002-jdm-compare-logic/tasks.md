# Tasks: JDM Compare Logic

## Phase: Setup

- [X] T001 Create backend/ Go module and folder structure per plan.md
- [X] T002 Initialize go.mod in backend/ (module name: jdm-direct/backend)

## Phase: Tests

- [X] T010 [P] Add unit tests for round-half-up 5% fee and totals in backend/internal/domain/calc_test.go
- [X] T011 [P] Add validation unit tests for malformed, wrong count, duplicate, unknown in backend/internal/validation/validate_test.go
- [X] T012 Add handler tests for POST /api/compare happy and error paths in backend/internal/http/compare_handler_test.go

## Phase: Core

- [X] T020 Create domain types in backend/internal/domain/types.go
- [X] T021 Implement calculation functions in backend/internal/domain/calc.go
- [X] T022 Implement demo catalog in backend/internal/catalog/demo.go
- [X] T023 Implement validation with first-error-only priority in backend/internal/validation/validate.go
- [X] T024 Define error codes and HTTP mapping in backend/internal/errcodes/codes.go

## Phase: Integration

- [X] T030 Implement HTTP handler for POST /api/compare in backend/internal/http/compare_handler.go
- [X] T031 Implement minimal CORS helper and OPTIONS handling in backend/internal/http/cors.go
- [X] T032 Wire http.Server and route in backend/internal/server/server.go and backend/cmd/server/main.go

## Phase: Polish

- [X] T040 Add quick README in backend/ with local run instructions
- [X] T041 Ensure results preserve input order, determinism, and integer JPY

## Dependencies & Order

- Setup → Tests (write failing tests) → Core → Integration → Polish
