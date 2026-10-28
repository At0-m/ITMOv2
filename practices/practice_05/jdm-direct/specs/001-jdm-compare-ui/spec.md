# Feature Specification: TEAM UI — JDM Compare

**Feature Branch**: `[001-jdm-compare-ui]`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "TEAM UI — JDM Compare: Users select two cars from Featured JDM and compare by price, specs, and calculated import estimate. UI-only; no production code/tests/backend changes; plan/tasks/implement not run. Preserve existing Featured budget filter and existing features. Tokyo Midnight/Touge/Pit-lane visual direction; accessibility and responsive required."

## Clarifications

### Session 2026-10-28

- Q: Should import estimate be requested automatically upon entering the comparison view, or only after the user presses a dedicated "Рассчитать" within compare? → A: Manual via compare button
- Q: If only one car’s import estimate fails or is missing, should the UI still highlight the cheaper car or wait until both totals are known? → A: Highlight only on full success; no highlight in loading or error
- Q: Where should the compare action bar be placed in the Featured section to balance visibility without cluttering the UI? → A: Bottom sticky action bar with counter and actions

## User Scenarios & Testing (mandatory)

### User Story 1 - Select two cars for comparison (Priority: P1)

A visitor browsing the Featured JDM section selects up to two cars using a clear selection control on each card to prepare a comparison. The UI shows a persistent counter of selected items (0/2, 1/2, 2/2). Attempting a third selection gives non-destructive feedback and keeps the first two selections unchanged.

**Why this priority**: Comparison depends on choosing two cars; this is the primary entry. It must be reliable and intuitive without breaking the Featured experience.

**Independent Test**: In Featured JDM, verify the selection control appears on each featured card; selecting toggles states correctly; counter updates; third selection attempt yields clear feedback; no hidden replacement of selected cars.

**Acceptance Scenarios**:

1. Given 0 selected, When user selects a car on its card, Then counter shows 1/2 and the card shows selected state.
2. Given 1 selected, When user selects a different car, Then counter shows 2/2 and both cards show selected state.
3. Given 2 selected, When user attempts to select a third car, Then selection remains on the original two, a non-blocking feedback message appears, and no cards are unselected automatically.
4. Given 2 selected, When user toggles one selected card off, Then counter shows 1/2 and the card returns to unselected state.

---

### User Story 2 - Start comparison (Priority: P1)

After two cars are selected, the user can initiate comparison via a prominent action (e.g., "Сравнить 2 автомобиля"). With 0 or 1 car selected, the action is disabled or explains that two selections are required. The compare action is presented in a bottom sticky action bar with the selection counter and a reset control.

**Why this priority**: This is the gateway to the comparison experience and must prevent incomplete comparisons.

**Independent Test**: With 0/2 or 1/2, verify the compare action is unavailable and provides guidance; with 2/2, verify the action is available and enters the comparison view.

**Acceptance Scenarios**:

1. Given 0/2, When user seeks to compare, Then UI indicates two cars must be selected.
2. Given 1/2, When user clicks compare, Then UI prevents the action and explains the requirement.
3. Given 2/2, When user clicks compare, Then UI navigates/transitions to the comparison view showing two selected cars.

---

### User Story 3 - View comparison and understand total import cost difference (Priority: P1)

In the comparison view, both cars display name, image, purchase price (JPY), drivetrain, engine, key specs from existing data, and the calculated import estimate returned together by a single compare request. The layout makes it easy to see which car is cheaper by total import estimate.

**Why this priority**: Delivering value comes from enabling a decision based on total import costs and specs.

**Independent Test**: With mock data, verify both cars show required attributes; totals are clearly highlighted; visual emphasis differentiates base price vs total import estimate.

**Acceptance Scenarios**:

1. Given two selected cars, When comparison view loads with existing car data, Then both cards show name, image, purchase price (JPY), drivetrain, engine, and key characteristics.
2. Given a successful compare response, When results are rendered, Then the UI emphasizes total import estimate and indicates which is lower in a clear, non-ambiguous way.

---

### User Story 4 - Handle loading state during import estimate calculation (Priority: P1)

When the calculation starts, the UI shows an explicit compare-level loading state (one request), preventing confusing parallel submissions.

**Why this priority**: Communicates progress, avoids duplicate actions, and sets user expectations.

**Independent Test**: Trigger compare; verify a compare-level loading indicator and disabled repeat submit; ensure focus/ARIA reflect busy state.

**Acceptance Scenarios**:

1. Given comparison initiated, When the compare request is sent, Then a visible compare-level loading indicator appears and repeat compare action is disabled until completion or error.
2. Given compare loading, When user tries to trigger compare again, Then UI prevents duplicate calculation and communicates ongoing processing.

---

### User Story 5 - Show success results for import estimate (Priority: P1)

After a successful compare request, show purchase price, auction fee, shipping, and total import estimate for each car. Visually differentiate base price vs total import.

**Why this priority**: Users need a clear breakdown to trust the totals.

**Independent Test**: With provided calculation results, verify all line items and totals render, totals emphasized, and currency labels are clear.

**Acceptance Scenarios**:

1. Given a successful compare response, When results arrive, Then the UI shows purchase price, auction fee, shipping, and total import estimate for each car with clear labels.
2. Given results displayed, When users compare totals, Then it is immediately apparent which total is lower via visual emphasis (e.g., badge, ordering, or highlight).

---

### User Story 6 - Error handling without losing selections (Priority: P1)

If the compare request fails, show a clear compare-level error message, preserve both selections, allow retry, and keep the Featured catalog usable.

**Why this priority**: Prevents user frustration and preserves context.

**Independent Test**: Simulate an error; verify selections persist; a retry action exists; Featured list remains navigable.

**Acceptance Scenarios**:

1. Given два автомобиля выбраны и compare request завершился ошибкой, When UI получает error response, Then UI показывает ОДНО compare-level error message, оба выбранных автомобиля сохраняются, доступен retry, Featured catalog остаётся usable.

---

### User Story 7 - Budget filter interaction with selected cars (Priority: P1)

When the user adjusts the existing budget filter so that a selected car would be hidden, the selection remains preserved; the UI clearly indicates that one of the selected cars is currently hidden by the filter; compare action stays understandable, and the user can reset the filter.

**Why this priority**: Protects user intent and avoids confusing loss of selection.

**Independent Test**: Select two cars; adjust budget to hide one; verify selection count remains 2/2; a banner or pill indicates hidden selection; option to reset/adjust filter is visible.

**Acceptance Scenarios**:

1. Given 2/2 selected, When budget filter hides one selected car, Then counter remains 2/2 and a visible notice indicates "1 выбран скрыт фильтром" with a control to reset filter.
2. Given hidden selected car, When user resets the filter, Then the hidden car reappears with selected state preserved.

---

### User Story 8 - Reset comparison (Priority: P2)

User can clear all selections and return to 0/2; budget filter remains unchanged.

**Why this priority**: Provides control to start over without impacting other browsing settings.

**Independent Test**: Click reset; verify counter resets to 0/2; Featured content and budget filter state persist.

**Acceptance Scenarios**:

1. Given any selection state, When user clicks reset comparison, Then selection clears and counter shows 0/2 while budget filter stays as-is.

---

### Edge Cases

- User selects the same car twice: prevent duplicate selection; feedback explains duplicates aren’t allowed.
- Compare request refused due to wrong input count (e.g., 0/1/3 ids): show error and preserve selection; explain exactly two cars must be selected.
- Images fail to load: show reliable placeholders with alt text.
- Very narrow screens: fall back to stacked comparison with sticky headers for labels.
- Attempt to compare with stale selection (car removed from Featured list by content update): preserve selection for the session; show "no longer featured" label and allow deselect.

## Requirements (mandatory)

### Functional Requirements

- FR-001: UI MUST allow selecting up to two cars from the Featured JDM list via an explicit selection control on each card.
- FR-002: UI MUST display a persistent selection counter showing 0/2, 1/2, or 2/2.
- FR-003: UI MUST prevent selecting a third car; the existing two selections MUST remain unchanged and a clear feedback message MUST be shown.
- FR-004: UI MUST provide a prominent "Сравнить 2 автомобиля" action that is enabled only when exactly two cars are selected; otherwise, guidance MUST be visible or discoverable.
- FR-005: UI MUST present a comparison view showing, for each selected car: name, image, purchase price (JPY), drivetrain, engine, and key characteristics sourced from existing data.
- FR-006: Upon explicit user action in the comparison view (manual trigger), UI MUST send a single compare request and display, on success, the following per-car breakdown: purchase price, auction fee, shipping, and total import estimate.
- FR-007: UI MUST display an explicit compare-level loading state during the request and prevent duplicate submissions.
- FR-008: UI MUST display a compare-level error state if the request fails, without losing selections, and MUST provide a retry action.
- FR-008a: UI MUST NOT highlight or declare a cheaper car until a successful compare response is received (atomic compare; no partial success highlight).
- FR-009: UI MUST preserve selection state when the budget filter hides selected cars and MUST indicate hidden selections with an affordance to reset or adjust the filter.
- FR-010: UI MUST allow resetting comparison to clear selections and return to 0/2; budget filter remains unaffected.
- FR-011: UI MUST maintain accessibility: keyboard operability for selection/action, visible focus, non-color-only indicators for selection, and ARIA live regions for loading/error.
- FR-012: UI MUST adapt to desktop and mobile layouts; on mobile, the comparison stacks vertically while preserving clarity of labels and totals.
- FR-013: The Featured section MUST display a bottom sticky action bar that includes the selection counter, the primary compare action, and a reset control; it MUST not obscure essential content and MUST be accessible via keyboard.

### Key Entities

- Car (UI concept): id, name, image URL/asset, purchasePriceJpy, drivetrain, engine, keySpecs (existing fields), selected (UI state), hiddenByFilter (derived UI state).
- CompareRequest (UI concept): carIds [id, id] (exactly two, order preserved).
- CompareResult (UI concept): results[] ordered to match carIds, each item: carId, purchasePriceJpy, auctionFeeJpy, shippingJpy, totalImportJpy.
- CompareError (UI concept): error.code, error.message.

## Success Criteria (mandatory)

### Measurable Outcomes

- SC-001: 95% of users can select two cars and reach the comparison view within 10 seconds on a typical connection.
- SC-002: 90% of successful estimate calculations render a visible total within 2 seconds after initiation, under normal network conditions.
- SC-003: In a usability test, at least 85% of participants can correctly identify the cheaper car by total import estimate without assistance.
- SC-004: Zero regressions to the Featured budget filter behavior and Calculator Features A and B in regression testing.
- SC-005: All interactive elements used in selection and comparison achieve WCAG 2.1 AA keyboard and focus visibility requirements.

## Screens / Major UI Regions

- Featured JDM List (with selection controls and counter).
- Compare Action Bar (bottom sticky; shows counter, primary action, and reset control when applicable).
- Comparison View (two-column on desktop; stacked on mobile) with sections: Car Overview, Spec Grid, Import Estimate Panel.
- Feedback/Notification Area (for max-selection feedback, errors, hidden-by-filter notice).

## UI States

- Idle: No selections; counter shows 0/2; compare action disabled; cards unselected.
- One Selected: One card shows selected state; counter 1/2; compare action disabled with helper text.
- Two Selected: Two cards selected; counter 2/2; compare action enabled.
- Loading: After compare triggered, show compare-level skeletons/spinners; compare action disabled or transformed to show progress.
- Success: Show per-car breakdown lines and emphasized total; clear visual distinction between base price and total import cost. Overall “cheaper” highlight appears only in this state.
- Error: Compare-level error message with retry; selections retained.
- Selected-but-Hidden-by-Filter: Selection preserved; a banner/pill indicates X selected hidden by filter; control to reset/adjust filter; compare action remains available if two are selected.

## Validation / User Feedback

- Max selection: Non-blocking toast/banner "Выбрано максимум 2 автомобиля" with focus-announcement for screen readers.
- Duplicate selection: Disable or convert the control for an already selected car to "Снято"; prevent duplicate entries.
- Compare disabled states: Tooltip/helper text: "Выберите два автомобиля для сравнения".
- Loading: Determinate or indeterminate spinners; ARIA live polite announcements: "Выполняется расчёт стоимости импорта".
- Error: Clear compare-level message "Не удалось получить расчёт импорта. Повторите попытку." plus Retry button; ARIA live assertive when appropriate.
- Hidden by filter: Notice: "1 выбран скрыт фильтром" with "Сбросить фильтр" action.

## Responsive Behavior

- Desktop: Two-column comparison with synchronized rows; totals emphasized with racing red accents; subtle cyan/magenta accents. Compare action bar sticky at bottom.
- Mobile/Narrow: Stacked cards; labels repeated or sticky header for metric names; compare action bar sticky at bottom; images scaled appropriately.
- Medium breakpoints: Side-by-side cards with responsive spec grid collapsing to two columns.

## Accessibility Requirements

- Keyboard: All selection controls, compare action, retry, and reset are reachable and operable via keyboard; logical tab order.
- Focus: Visible focus ring with sufficient contrast against dark background.
- Non-color indicators: Selected state includes icon/shape/tick and ARIA-selected; not color-only.
- Live regions: Loading and error use ARIA live regions; avoid rapid announcements; disable duplicate submits while busy.
- Alt text: Car images have descriptive alt text including model name.
- Contrast: Text and controls meet WCAG 2.1 AA contrast on dark background.

## Existing Behavior to Preserve

- Calculator Feature A behavior unchanged.
- Calculator Feature B behavior unchanged.
- Featured budget filter behavior unchanged (beyond non-destructive selection preservation and notices).
- Featured cards content/order maintained except minimal UI additions for selection, counters, and action bar.
- Existing main pages/sections remain unchanged outside of the compare additions.

## Visual Direction Notes (Non-functional)

- Theme: Tokyo Midnight / Touge / Pit-lane.
- Palette: asphalt/black background; cool white typography; racing red primary accent; subtle cyan/magenta accents; avoid overdone cyberpunk.
- Motifs: pit-lane/telemetry/speed-line; car imagery remains prominent.

## Agreed Backend Contract

Authoritative reference: docs/homework5/common-contract.md

- Endpoint: POST /api/compare
- Request body:
  {
    "carIds": ["r34", "supra"]
  }
  Exactly two selected ids; order is preserved.
- Success response body:
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
  The order of results matches the order of carIds.
- Error envelope:
  {
    "error": {
      "code": "...",
      "message": "..."
    }
  }
- Error handling rules:
  - UI branches on error.code only; error.message is human‑readable and MAY be shown to the user but MUST NOT be parsed to determine error type.
  - Supported error codes: MALFORMED_REQUEST, WRONG_CAR_COUNT, DUPLICATE_CAR_IDS, CAR_NOT_FOUND, INTERNAL_ERROR.
- UI does not compute any monetary fields; all are provided by the backend.

## Assumptions

- Existing Featured JDM data already includes name, image, drivetrain, engine, and key specs; UI will reuse these fields.
- Estimate calculation is triggered via explicit action in the comparison view and returns atomically for both cars in one response.
- No persistence/history of comparisons is required in this phase.
- Authentication and admin features are out of scope per brief.
- UI can show toasts/banners without altering underlying data or backend.

## Open Questions

<!-- None -->
