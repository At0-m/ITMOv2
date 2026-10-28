# Feature Specification: TEAM UI — JDM Compare

**Feature Branch**: `[001-jdm-compare-ui]`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "TEAM UI — JDM Compare: Users select two cars from Featured JDM and compare by price, specs, and calculated import estimate. UI-only; no production code/tests/backend changes; plan/tasks/implement not run. Preserve existing Featured budget filter and existing features. Tokyo Midnight/Touge/Pit-lane visual direction; accessibility and responsive required."

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

After two cars are selected, the user can initiate comparison via a prominent action (e.g., "Сравнить 2 автомобиля"). With 0 or 1 car selected, the action is disabled or explains that two selections are required.

**Why this priority**: This is the gateway to the comparison experience and must prevent incomplete comparisons.

**Independent Test**: With 0/2 or 1/2, verify the compare action is unavailable and provides guidance; with 2/2, verify the action is available and enters the comparison view.

**Acceptance Scenarios**:

1. Given 0/2, When user seeks to compare, Then UI indicates two cars must be selected.
2. Given 1/2, When user clicks compare, Then UI prevents the action and explains the requirement.
3. Given 2/2, When user clicks compare, Then UI navigates/transitions to the comparison view showing two selected cars.

---

### User Story 3 - View comparison and understand total import cost difference (Priority: P1)

In the comparison view, both cars display name, image, purchase price (JPY), drivetrain, engine, key specs from existing data, and a calculated import estimate when available. The layout makes it easy to see which car is cheaper by total import estimate.

**Why this priority**: Delivering value comes from enabling a decision based on total import costs and specs.

**Independent Test**: With mock data, verify both cars show required attributes; totals are clearly highlighted; visual emphasis differentiates base price vs total import estimate.

**Acceptance Scenarios**:

1. Given two selected cars, When comparison view loads with existing car data, Then both cards show name, image, purchase price (JPY), drivetrain, engine, and key characteristics.
2. Given import estimates are available, When both estimates are received, Then the UI emphasizes total import estimate and indicates which is lower in a clear, non-ambiguous way.

---

### User Story 4 - Handle loading state during import estimate calculation (Priority: P1)

When the calculation starts, the UI shows an explicit loading state for each car or the whole compare, preventing confusing parallel submissions.

**Why this priority**: Communicates progress, avoids duplicate actions, and sets user expectations.

**Independent Test**: Trigger estimate calculation; verify loading indicators and disabled repeat submit; ensure focus/ARIA reflect busy state.

**Acceptance Scenarios**:

1. Given comparison initiated, When import estimates are requested, Then a visible loading indicator appears and repeat compare action is disabled until completion or error.
2. Given loading, When user tries to trigger compare again, Then UI prevents duplicate calculation and communicates ongoing processing.

---

### User Story 5 - Show success results for import estimate (Priority: P1)

After successful calculation, show purchase price, auction fee, shipping, and total import estimate per car. Visually differentiate base price vs total import.

**Why this priority**: Users need a clear breakdown to trust the totals.

**Independent Test**: With provided calculation results, verify all line items and totals render, totals emphasized, and currency labels are clear.

**Acceptance Scenarios**:

1. Given success for both cars, When results arrive, Then the UI shows purchase price, auction fee, shipping, and total import estimate for each car with clear labels.
2. Given results displayed, When users compare totals, Then it is immediately apparent which total is lower via visual emphasis (e.g., badge, ordering, or highlight).

---

### User Story 6 - Error handling without losing selections (Priority: P1)

If the logic service fails to return a result, show a clear error message, preserve both selections, allow retry, and keep the Featured catalog usable.

**Why this priority**: Prevents user frustration and preserves context.

**Independent Test**: Simulate an error; verify selections persist; a retry action exists; Featured list remains navigable.

**Acceptance Scenarios**:

1. Given an error for one or both cars, When results fail, Then an error is shown inline for the affected car(s) or globally with guidance to retry; selections remain intact.
2. Given error state, When user clicks retry, Then the calculation restarts and loading state appears again.

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
- Network delay on one car only: show per-car loading/error so partial results don’t block the other.
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
- FR-006: UI MUST request and display an import estimate per car with the following breakdown: purchase price, auction fee, shipping, and total import estimate when results are successful.
- FR-007: UI MUST display an explicit loading state during estimate calculation and prevent duplicate submissions.
- FR-008: UI MUST display an error state if calculation fails, without losing selections, and MUST provide a retry action.
- FR-009: UI MUST preserve selection state when the budget filter hides selected cars and MUST indicate hidden selections with an affordance to reset or adjust the filter.
- FR-010: UI MUST allow resetting comparison to clear selections and return to 0/2; budget filter remains unaffected.
- FR-011: UI MUST maintain accessibility: keyboard operability for selection/action, visible focus, non-color-only indicators for selection, and ARIA live regions for loading/error.
- FR-012: UI MUST adapt to desktop and mobile layouts; on mobile, the comparison stacks vertically while preserving clarity of labels and totals.

### Key Entities

- Car (UI concept): id, name, image URL/asset, purchasePriceJpy, drivetrain, engine, keySpecs (existing fields), selected (UI state), hiddenByFilter (derived UI state).
- ImportEstimate (UI concept): carId, purchasePriceJpy, auctionFeeJpy, shippingJpy, totalImportEstimateJpy, status (loading|success|error), errorMessage (optional for UI display only).

## Success Criteria (mandatory)

### Measurable Outcomes

- SC-001: 95% of users can select two cars and reach the comparison view within 10 seconds on a typical connection.
- SC-002: 90% of successful estimate calculations render a visible total within 2 seconds after initiation, under normal network conditions.
- SC-003: In a usability test, at least 85% of participants can correctly identify the cheaper car by total import estimate without assistance.
- SC-004: Zero regressions to the Featured budget filter behavior and Calculator Features A and B in regression testing.
- SC-005: All interactive elements used in selection and comparison achieve WCAG 2.1 AA keyboard and focus visibility requirements.

## Screens / Major UI Regions

- Featured JDM List (with selection controls and counter).
- Compare Action Bar (shows counter, primary action, and reset control when applicable).
- Comparison View (two-column on desktop; stacked on mobile) with sections: Car Overview, Spec Grid, Import Estimate Panel.
- Feedback/Notification Area (for max-selection feedback, errors, hidden-by-filter notice).

## UI States

- Idle: No selections; counter shows 0/2; compare action disabled; cards unselected.
- One Selected: One card shows selected state; counter 1/2; compare action disabled with helper text.
- Two Selected: Two cards selected; counter 2/2; compare action enabled.
- Loading: After compare triggered, import estimate shows skeletons/spinners; compare action disabled or transformed to show progress.
- Success: Per car, show breakdown lines and emphasized total; clear visual distinction between base price and total import cost.
- Error: Per car or global error message with retry; selections retained.
- Selected-but-Hidden-by-Filter: Selection preserved; a banner/pill indicates X selected hidden by filter; control to reset/adjust filter; compare action remains available if two are selected.

## Validation / User Feedback

- Max selection: Non-blocking toast/banner "Выбрано максимум 2 автомобиля" with focus-announcement for screen readers.
- Duplicate selection: Disable or convert the control for an already selected car to "Снято"; prevent duplicate entries.
- Compare disabled states: Tooltip/helper text: "Выберите два автомобиля для сравнения".
- Loading: Determinate or indeterminate spinners; ARIA live polite announcements: "Выполняется расчёт стоимости импорта".
- Error: Clear message "Не удалось получить расчёт импорта. Повторите попытку." plus Retry button; ARIA live assertive when appropriate.
- Hidden by filter: Notice: "1 выбран скрыт фильтром" with "Сбросить фильтр" action.

## Responsive Behavior

- Desktop: Two-column comparison with synchronized rows; totals emphasized with racing red accents; subtle cyan/magenta accents.
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

## Needs from Team Logic (Open Contract Inputs; not final API)

- Car identifier (stable id) for Featured items.
- Purchase price JPY per car.
- Import estimate result shape per car including: auction fee JPY, shipping JPY, total import estimate JPY.
- Status signaling for estimate request per car: success or error, with a human-readable error message for UI display.
- Timing/aggregation: whether estimates are returned per car independently or in a batch; UI supports per-car updates.
- Any constraints on request frequency/rate limiting to guide UI retry/backoff behavior.

## Assumptions

- Existing Featured JDM data already includes name, image, drivetrain, engine, and key specs; UI will reuse these fields.
- Estimate calculation is triggered on entering comparison or via explicit action and can return per-car independently.
- No persistence/history of comparisons is required in this phase.
- Authentication and admin features are out of scope per brief.
- UI can show toasts/banners without altering underlying data or backend.

## Open Questions

1. Should import estimate be requested automatically upon entering the comparison view, or only after the user presses a dedicated "Рассчитать" within compare? [NEEDS CLARIFICATION]
2. If only one car’s estimate fails, should UI continue to highlight the cheaper car based on available data or withhold that highlight until both totals are known? [NEEDS CLARIFICATION]
3. What is the preferred placement for the compare action bar in Featured (top sticky vs bottom sticky vs inline on cards) to balance visibility and non-intrusiveness? [NEEDS CLARIFICATION]
