# Implementation Plan: TEAM UI — JDM Compare

**Branch**: `[001-jdm-compare-ui]` | **Date**: 2026-10-29 | **Spec**: specs/001-jdm-compare-ui/spec.md

**Input**: Feature specification from `/specs/001-jdm-compare-ui/spec.md`

**Note**: This plan is produced by the planning workflow and covers Phase 0 (research) and Phase 1 (design & contracts) only. No production code changes are included.

## Summary

Add a UI-only comparison experience in Featured JDM that lets users select up to two cars, initiate a single atomic compare request, and view a per-car breakdown and total import estimate, highlighting the cheaper car only after a successful response. Preserve existing budget filter behavior and all Calculator Features A and B.

## Technical Context

**Language/Version**: TypeScript 6.x, Vite 8.x

**Primary Dependencies**: Vite, Vitest, Zod (present; no new dependencies introduced in this phase)

**Storage**: N/A (UI-only; no persistence)

**Testing**: Vitest; repo check script `sh scripts/check.sh` runs tests and build

**Target Platform**: Browser (desktop and mobile responsive)

**Project Type**: Frontend web (Vite + TypeScript)

**Performance Goals**: Meet SC-002 target (visible total within ~2s under normal network) and keep UI responsive

**Constraints**: Do not duplicate backend logic; preserve Feature A/B and budget filter behavior; maintain WCAG 2.1 AA for interactions

**Scale/Scope**: Single-feature UI addition with selection state and comparison view within existing demo

## Constitution Check

GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.

- Specification Before Implementation: PASS — Spec exists at specs/001-jdm-compare-ui/spec.md; shared contract at docs/homework5/common-contract.md.
- UI / Logic Separation: PASS — UI will not calculate monetary fields; consumes backend contract.
- Contract-First Integration: PASS — Using agreed POST `/api/compare` with fixed schemas and error envelope.
- Backward Compatibility: PASS — Explicitly preserving Calculator Features A and B and budget filter behavior.
- Verification Is Mandatory: PASS — We will run `sh scripts/check.sh`; quickstart includes validation flows.
- Scope Discipline: PASS — No new frameworks or dependencies; minimal UI additions.

Gate result: PASS

## Existing Frontend Integration Points

- Entry: `src/main.ts` — wire up selection controls on Featured cards, manage sticky compare tray, and render comparison view. DOM integration remains here.
- Styling: `src/style.css` — extend with minimal styles for selection states, sticky tray, loading/error, and comparison layout adhering to visual direction.
- Budget filter: `src/featuredFilter.ts` — behavior preserved; selection state coexists without altering filter logic.

## UI State Model

States:
- Idle: 0/2 selected; compare disabled; tray hidden.
- One Selected: 1/2; tray visible; compare disabled with guidance.
- Two Selected: 2/2; compare enabled.
- Loading: after submit; single compare-level loading; submit disabled; duplicate submit blocked; selections preserved; aria-busy on compare region.
- Success: results for both cars rendered; backend monetary fields displayed; cheaper total highlighted.
- Error: single compare-level error; selections preserved; retry available; branching by `error.code` only.
- Selected-but-Hidden-by-Filter: one or both selected cars filtered out; tray indicates hidden selection; compare still available at 2/2.

Transitions:
- Idle → One Selected → Two Selected via card toggles (max 2; third selection rejected with feedback).
- Two Selected → Loading via compare action.
- Loading → Success or Error based on response.
- Any → Reset clears selections and compare outcome; tray hides when 0/2; filter unchanged.
- Any selection state ↔ Filter change updates `hiddenByFilter` indicator only.

## Selection State Flow (pure logic)

- Add selection(id): if already selected → deselect; else if <2 → select; else show non-blocking feedback and keep existing two.
- Remove selection(id): deselect if present.
- Get counter: `selected.length` out of 2.
- Hidden-by-filter: computed from current filter and selected ids; does not mutate selections.
- Reset: clears selected ids and any compare outcome.

## API Integration Boundary

- Base URL (local dev): `http://localhost:8081`
- Endpoint: POST `/api/compare`
- Request: `{ carIds: [string, string] }` — exactly two, distinct, order preserved
- Success: `{ results: [{ carId, purchasePriceJpy, auctionFeeJpy, shippingJpy, totalImportJpy }, {...}] }` — order matches request
- Error: `{ error: { code, message } }` — UI branches by `error.code` only
- Atomicity: one request for two cars; no per-car states
- Duplicate submit protection: in-flight flag disables compare until completion
- Client boundary function (design): `compareCars(carIds: [string, string], baseUrl = 'http://localhost:8081'): Promise<CompareResult | CompareError>`
- Timeouts/retries: rely on browser defaults; provide explicit Retry action in UI on error

## DOM / Component Regions

- Featured Cards: existing list; add selection control per card; reflect selected state (not color-only; include icon/label).
- Sticky Compare Tray: bottom of Featured; shows counter (X/2), action "Сравнить 2 автомобиля", reset, and hidden-by-filter notice; full-width on mobile.
- Comparison View: two-column (desktop) or stacked (mobile) panel showing: image, title, engine, drivetrain, and backend monetary breakdown; cheaper total highlighted only on success.
- Feedback/Notification: area for max-selection feedback, errors, and hidden-by-filter notice; use aria-live.

## Styling Strategy

- Use existing `src/style.css`; add BEM-like utility classes minimally (e.g., `.compare-tray`, `.is-selected`, `.compare-loading`, `.compare-error`, `.compare-result`).
- Visual direction: Tokyo Midnight / Touge / Pit-lane — asphalt/black background, cool white text, racing red primary accents, subtle cyan/magenta accents; avoid heavy cyberpunk.
- Ensure selected state includes icon or shape outline and not color only.
- Sticky tray: elevated contrast and shadow; avoid obscuring essential content.

## Responsive / Accessibility Strategy

- Desktop: two columns for comparison with aligned rows; totals emphasized.
- Mobile: stacked sections, full-width sticky tray; no horizontal overflow; images scale fluidly.
- Keyboard: selection controls and tray actions tabbable in logical order; Enter/Space activate.
- Focus: visible focus ring with sufficient contrast on dark background.
- ARIA: `aria-selected` on cards; `aria-busy` on compare container during loading; `aria-live="polite"` for loading messages; `aria-live="assertive"` for errors.
- Labels: meaningful text for controls; include alt text for car images with model names.

## Testing Strategy (plan only)

Preferred without new dependencies:
1. Unit tests for pure selection/state logic (add/remove, max-2, third rejected, deselect, reset).
2. Unit tests for API response/error mapping in client boundary (branch by `error.code`, preserve order).
3. Run `sh scripts/check.sh` to verify existing tests/build remain green.
4. Browser acceptance: manual validation of flows and accessibility behaviors.
5. End-to-end manual check UI → Go backend at `http://localhost:8081`.

Scenarios to cover:
- Selection: first, second, third rejected, deselect, reset
- Budget: selected hidden by filter; selection survives; tray notice visible
- API: exactly one request; correct order; loading; success; known `error.code`; network/server failure; retry
- Success: both results shown; monetary fields from backend; cheaper total highlight
- Regression: Feature A, Feature B, Featured budget filter unchanged

## Project Structure

### Documentation (this feature)

```text
specs/001-jdm-compare-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output (UI ↔ backend)
```

### Source Code (repository root)

```text
src/
├── main.ts              # entry point
├── featuredFilter.ts    # existing budget filter logic (preserve)
├── compareSelection.ts  # pure selection/state logic (no DOM)
├── compareApi.ts        # HTTP client for POST /api/compare (no DOM)
├── priceValidation.ts   # existing Feature A validation (preserve)
├── counter.ts           # demo code (unchanged)
└── style.css            # styles (extend minimally for compare UI)

tests/
└── (vitest)             # no new tests in planning/design phase
```

Structure Decision: Single Vite + TypeScript frontend project. Compare UI additions live under `src/` with two small modules:
- `compareSelection.ts`: pure selection/state, unit-testable, framework-free.
- `compareApi.ts`: isolates HTTP call and error mapping. DOM integration remains in `main.ts`.

## Backward Compatibility

- Do not modify Feature A/B logic or flows; keep price validation and dependency error behavior intact.
- Do not alter budget filter business logic; only add non-destructive selection persistence and notice.
- Do not change public contracts or endpoints; consume POST `/api/compare` as agreed.

## End-to-End Acceptance Strategy

- Use quickstart steps to run app and exercise user stories end-to-end against local backend at `http://localhost:8081`.
- Verify UI states and transitions visually and via keyboard; ensure ARIA announcements fire appropriately.
- Capture evidence (screenshots/notes) for success and error paths; confirm no regressions to Feature A/B and budget filter.
