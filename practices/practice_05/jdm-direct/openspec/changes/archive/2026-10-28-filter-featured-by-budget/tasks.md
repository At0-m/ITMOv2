# Tasks

## 1. Pure Logic

- [x] 1.1 Implement `validateBudget(value: string)` per spec (empty OK → no filter; non-empty must be integer 1..100000000); verify with unit tests covering NaN, fraction, <=0, >100000000, valid boundary
- [x] 1.2 Implement `filterCarsByBudget(cars, budgetJpy?: number)` retaining original order and applying `priceJpy <= budget`; verify with unit tests including inclusive boundary and empty/no-filter

## 2. UI Integration (no DOM tests)

- [x] 2.1 Integrate functions in `src/main.ts`: apply on submit; empty/whitespace submits show full catalog in original order and no error; invalid non-empty shows error and does not change current list; verify manually and that existing 16 baseline tests remain green
- [x] 2.2 Implement reset action: clear input, clear error, hide empty state, restore full list order; reset control visible for any active non-empty valid filter (including no results) and hidden after reset; verify manually and maintain baselines

## 3. Documentation and Checks

- [x] 3.1 Update README/docs section for Featured to describe the budget filter semantics; verify `scripts/check.sh` stays green
- [x] 3.2 Add unit tests for pure logic ensuring inclusive boundary and invalid input cases; run tests locally and via `scripts/check.sh`

## 4. Manual Acceptance (browser)

- [x] 4.1 Empty submit → полный каталог в исходном порядке, ошибки нет
- [x] 4.2 4_200_000 → видны Supra и RX-7, R34 скрыт
- [x] 4.3 4_199_999 → Supra исключена, виден только RX-7
- [x] 4.4 Невалидный непустой ввод → показывается соответствующая ошибка, текущая выдача не изменилась
- [x] 4.5 3_000_000 → empty state "По вашему бюджету ничего не найдено" и доступен "Сбросить фильтр"
- [x] 4.6 Reset → очищает input и error, скрывает empty state, показывает полный каталог в исходном порядке; после reset контрол скрывается

## Workflow follow-up

- Archive the change after review when ready.
