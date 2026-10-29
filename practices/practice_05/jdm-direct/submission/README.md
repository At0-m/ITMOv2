# Practice 5 — сдача (JDM Direct, ветка `2026_practice5`)

Содержимое: Part 1 (OpenSpec full lifecycle), Part 2 (OpenSpec customization), Homework (два «коллектива», одна фича, GitHub Spec Kit), реализация, верификация, reflection, таблица evidence.

## Part 1 — OpenSpec full lifecycle

- Change: `filter-featured-by-budget` (фильтр Featured JDM по бюджету в JPY, `priceJpy <= budget`).
- Main spec: [`openspec/specs/catalog/featured-budget-filter/spec.md`](../openspec/specs/catalog/featured-budget-filter/spec.md)
- Archived change: [`openspec/changes/archive/2026-10-28-filter-featured-by-budget/`](../openspec/changes/archive/2026-10-28-filter-featured-by-budget/) (`proposal.md`, `design.md`, `tasks.md`, delta-spec)
- Пройден цикл: explore → propose → review → correction → apply → verification → sync → archive.
- Independent review **до implementation** нашёл blocking contradiction: `design.md` утверждал, что пустой ввод не меняет текущую выдачу, а spec требует трактовать его как отсутствие фильтра (полный каталог). Design исправлен до начала кода ([01](evidence/01-openspec-review-blocking-issue.png)).
- Feature A (валидация цены) и Feature B (асинхронный расчёт) сохранились: baseline-тесты остались зелёными, `src/priceValidation.ts` не менялся.
- Evidence: [01](evidence/01-openspec-review-blocking-issue.png), [02](evidence/02-openspec-budget-filter-result.png), [03](evidence/03-openspec-cycle-complete.png).

## Part 2 — OpenSpec customization

- Draft change: `compare-featured-cars` (в `openspec/changes/compare-featured-cars/`, не архивирован).
- Persistent rule в [`openspec/config.yaml`](../openspec/config.yaml) (`rules.design`): «Объясни взаимодействие компонентов диаграммой Mermaid.»
- Design до и после правила:
  - [`docs/practice5-part2/design-before.md`](../docs/practice5-part2/design-before.md)
  - [`docs/practice5-part2/design-after.md`](../docs/practice5-part2/design-after.md)
- Rule появился во fresh OpenSpec instructions ([04](evidence/04-openspec-persistent-rule-in-instructions.png)); AFTER design получил раздел «Component Interaction (Mermaid)» с диаграммой, смысл и решения design не менялись ([05](evidence/05-openspec-design-before-after-diff.png)).

## Homework — Two teams, one feature

Alternative SDD framework: **GitHub Spec Kit**.
Feature: **JDM Compare** — сравнение двух автомобилей с расчётом импорта.

**Team UI**
- [`specs/001-jdm-compare-ui/spec.md`](../specs/001-jdm-compare-ui/spec.md)
- [`specs/001-jdm-compare-ui/plan.md`](../specs/001-jdm-compare-ui/plan.md)

**Team Logic**
- [`specs/002-jdm-compare-logic/spec.md`](../specs/002-jdm-compare-logic/spec.md)
- [`specs/002-jdm-compare-logic/plan.md`](../specs/002-jdm-compare-logic/plan.md)
- [`specs/002-jdm-compare-logic/tasks.md`](../specs/002-jdm-compare-logic/tasks.md)

Процесс:
- UI и Logic specs создавались независимо ([06](evidence/06-team-ui-spec-before-contract.png), [07](evidence/07-team-logic-spec-before-contract.png)).
- Общий контракт согласован **до** production code ([08](evidence/08-common-contract-decisions.png)).
- После contract review обе спеки были синхронизированы с контрактом.
- Independent reviewer блокировал начало реализации, пока противоречия не были устранены; итоговый вердикт: обе спеки согласованы, blocking issues нет, `/speckit.plan` можно начинать ([09](evidence/09-contract-approved-before-code.png)).

### Common contract

Source of truth: [`docs/homework5/common-contract.md`](../docs/homework5/common-contract.md). Краткая выжимка:

- `POST /api/compare`, request `{ "carIds": ["r34", "supra"] }`.
- Ровно 2 distinct ids; atomic response (любая ошибка — compare падает целиком).
- Порядок `results` == порядок `carIds` в запросе.
- Backend owns monetary calculations; UI не считает `auctionFeeJpy`, `shippingJpy`, `totalImportJpy`.
- UI ветвится по `error.code`.
- Приоритет валидации (первая ошибка): malformed → wrong count → duplicate → unknown.

## Implementation

**Backend** (`backend/`)
- Go, `net/http`, порт 8081.
- Детерминированный in-memory каталог.
- Auction fee 5% с round-half-up, shipping 180000 JPY.

**Frontend**
- Vite + TypeScript.
- [`src/compareSelection.ts`](../src/compareSelection.ts) — выбор (максимум 2).
- [`src/compareApi.ts`](../src/compareApi.ts) — вызов `/api/compare`, разбор ошибок.
- Sticky tray, состояния loading / error / retry.
- Сосуществование с budget filter (выбор переживает фильтрацию).
- Денежные значения на frontend не вычисляются.

## Verification

Фактические результаты финального прогона:

```text
go -C backend vet ./...           PASS
go -C backend test -count=1 ./... PASS
sh scripts/check.sh               57/57 tests passed + TypeScript/Vite build PASS
git diff --check                  PASS
```

- Live backend: `curl` на `POST http://localhost:8081/api/compare` с `r34 + supra` вернул 200 с контрактным ответом ([10](evidence/10-backend-live-contract-check.png)).
- Browser E2E (успех): R34 total = 6 270 000 JPY, Supra total = 4 590 000 JPY, Supra подсвечена как более дешёвый импорт ([11](evidence/11-jdm-compare-e2e-success.png)).
- Browser E2E (error/retry): путь ошибки и повтора при сохранённом выборе 2/2 ([12](evidence/12-jdm-compare-error-retry.png)).

## Reflection

См. корневой [`reflection.md`](../reflection.md). Основные выводы:

- Independent review реально поймал противоречия (Design vs Spec в Part 1; расхождения UI/Logic specs в Homework).
- Contract-first предотвратил drift между UI и Logic.
- Unit tests не заменяют browser E2E.
- OpenSpec удобен для brownfield change lifecycle.
- Spec Kit удобен для multi-role feature workflow.
- SDD artifacts пережили смену coding-agent harness (OpenCode → Claude Code).

## Evidence

| Evidence | Что доказывает |
|---|---|
| [01-openspec-review-blocking-issue.png](evidence/01-openspec-review-blocking-issue.png) | Independent review до implementation нашёл blocking contradiction между design и spec (пустой ввод бюджета). |
| [02-openspec-budget-filter-result.png](evidence/02-openspec-budget-filter-result.png) | Budget filter в UI: бюджет 4200000 оставляет Supra и RX-7. |
| [03-openspec-cycle-complete.png](evidence/03-openspec-cycle-complete.png) | Цикл завершён: нет активных changes, main spec прошла `openspec validate --strict`, `scripts/check.sh` зелёный (на тот момент 27 тестов). |
| [04-openspec-persistent-rule-in-instructions.png](evidence/04-openspec-persistent-rule-in-instructions.png) | Persistent rule про Mermaid присутствует во fresh OpenSpec instructions. |
| [05-openspec-design-before-after-diff.png](evidence/05-openspec-design-before-after-diff.png) | Diff design BEFORE → AFTER: добавлена Mermaid-диаграмма взаимодействия компонентов. |
| [06-team-ui-spec-before-contract.png](evidence/06-team-ui-spec-before-contract.png) | Spec Team UI создана независимо, до общего контракта. |
| [07-team-logic-spec-before-contract.png](evidence/07-team-logic-spec-before-contract.png) | Spec Team Logic создана независимо, до общего контракта. |
| [08-common-contract-decisions.png](evidence/08-common-contract-decisions.png) | Решения общего контракта UI ↔ Logic. |
| [09-contract-approved-before-code.png](evidence/09-contract-approved-before-code.png) | Review: specs согласованы с контрактом, blocking issues нет, можно переходить к plan/реализации. |
| [10-backend-live-contract-check.png](evidence/10-backend-live-contract-check.png) | Backend tests и live `curl` на `/api/compare` соответствуют контракту (200, порядок и суммы). |
| [11-jdm-compare-e2e-success.png](evidence/11-jdm-compare-e2e-success.png) | Browser E2E: два авто, суммы от backend, более дешёвый импорт выделен. |
| [12-jdm-compare-error-retry.png](evidence/12-jdm-compare-error-retry.png) | Browser E2E: путь error/retry; выбор 2/2 и кнопка «Сравнить 2 автомобиля» сохранены. |
