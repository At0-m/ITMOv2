# Quickstart — Validate JDM Compare UI

This guide helps validate the compare UI states and contract integration without implementing backend logic here.
## Prerequisites

- Node.js environment for this repo
- Run checks: `sh scripts/check.sh` (should pass tests and build)

## Start Dev Server

1. Install deps if needed: `npm install`
2. Start: `npm run dev`
3. Open the app URL printed by Vite.

## Validation Scenarios

1. Selection
- Ensure each Featured card has a selection control.
- Select up to two cars; observe counter 0/2 → 1/2 → 2/2.
- Attempt a third selection: expect non-blocking feedback; prior two remain.

2. Compare Action Bar
- Observe bottom sticky bar with counter, primary compare action, and reset.
- With 0/2 or 1/2, compare disabled with guidance.
- With 2/2, compare enabled.

3. Comparison View
- After clicking compare at 2/2, view shows two cars with name, image, base price (JPY), drivetrain, engine, key specs.
- Manual trigger within comparison view initiates compare request.

4. Loading State
- On trigger, a single compare-level loading indicator appears; duplicate triggers are prevented.

5. Success State (using mock/stub or contract examples)
- Render purchase price, auction fee, shipping, and total import per car.
- Highlight cheaper car by total import only after success.

6. Error State
- On simulated error, display one compare-level error message; selections persist; retry is available.

7. Budget Filter Interaction
- Select two cars; adjust budget filter to hide one; selection count remains 2/2.
- See a notice indicating hidden selection and a control to reset filter.

## References

- Feature spec: `specs/001-jdm-compare-ui/spec.md`
- Contract: `docs/homework5/common-contract.md`
- Data model: `specs/001-jdm-compare-ui/data-model.md`
