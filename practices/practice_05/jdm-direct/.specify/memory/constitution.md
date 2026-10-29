<!--
Sync Impact Report
Version: 1.0.0 → 2.0.0
Modified principles:
  Validation & Contract First → Specification Before Implementation;
  Test-First Workflow → Verification Is Mandatory;
  Separation of Concerns → UI / Logic Separation;
  Observability & Error Transparency → Evidence;
  Simplicity & Stack Discipline → Scope Discipline
Added sections: Contract-First Integration; Backward Compatibility; Human Decision Points
Removed sections: Additional Constraints; Development Workflow and Quality Gates (merged under Governance)
Follow-up TODOs: TODO(RATIFICATION_DATE): set the original adoption date
-->

# JDM Direct Constitution

## Core Principles

### Specification Before Implementation (NON-NEGOTIABLE)
- New functionality MUST begin with a written specification capturing behavior, boundaries,
  errors, and acceptance criteria.
- No implementation may start until specifications and contracts are reviewed and agreed.
Rationale: Aligns stakeholders, reduces rework, and prevents contract drift.

### UI / Logic Separation
- Frontend remains Vite + TypeScript. Server-side business logic for coursework resides in Go.
- UI MUST NOT duplicate server business rules.
- Frontend/Backend interaction uses explicit HTTP/JSON contracts.
Rationale: Preserves clear boundaries, improves testability, and enforces single source of truth.

### Contract-First Integration
- Before integration, define and agree request/response data, HTTP methods, status codes,
  validation errors, and loading/error/success states.
- Undocumented assumptions between frontend and backend are forbidden.
Rationale: Prevents integration debt and inconsistent behavior.

### Backward Compatibility
- Existing behaviors MUST be preserved: calculator Feature A, calculator Feature B,
  Featured budget filter, and public UI scenarios.
- New features MUST NOT break these scenarios.
Rationale: Protects users and existing flows in this brownfield project.

### Verification Is Mandatory
- For TypeScript portion, the primary project check is `sh scripts/check.sh`.
- When Go backend exists, Go unit and integration tests MUST run.
- Changes are accepted only after verifying happy path, error path, and boundary cases.
- Green unit tests do not replace observable UI or end-to-end acceptance.
Rationale: Ensures correctness beyond unit scope.

### Scope Discipline
- Do not add dependencies, frameworks, or infrastructure without necessity.
- Do not expand feature scope during implementation without a decision/spec update.
- Do not change existing calculator or budget filter for convenience of a new feature.
Rationale: Controls risk and maintains focus.

### Human Decision Points
- Ambiguous product decisions and shared contract changes MUST be explicitly approved by a human
  before implementation.
- Reviewer findings are not auto-applied; a human accept/reject decision is required.
Rationale: Keeps governance accountable and explicit.

### Evidence
- For coursework, retain specs, shared contracts, automated check results, and a concise demo/evidence.
- Specs MUST exist before corresponding production code.
Rationale: Provides traceability and learning artifacts.

## Governance

- This constitution governs long-lived engineering rules for JDM Direct and supersedes other
  practices on governance topics when conflicts arise.
- Amendments require a short proposal capturing rationale, impact, and migration plan when needed.
- Versioning follows semantic rules:
  MAJOR for breaking governance changes; MINOR for new or materially expanded guidance; PATCH
  for clarifications.
- Ratification: The human project owner approves governance changes. Record review notes in PRs.
- Compliance: reviewers MUST verify adherence to this constitution, docs/style-guide.md,
  and docs/requirements.md. Deviations MUST include explicit justification.
- Verification gates: `sh scripts/check.sh` is mandatory for TypeScript; when Go backend exists,
  Go unit/integration tests MUST be included in CI.
Rationale: Keeps governance actionable and integrated with existing checks.

**Version**: 2.0.0 | **Ratified**: 2026-10-28 | **Last Amended**: 2026-10-28
