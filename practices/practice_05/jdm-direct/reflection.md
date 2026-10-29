Эта практика получилась приземлённой и полезной: я всё время держал в голове реальные ограничения проекта и не пытался «ускориться» за счёт обходных путей. Больше всего помог сам каркас.

Что помогло
- AGENTS.md выступал постоянным тормозом на самодеятельность: он напоминал не менять requirements, не ослаблять проверки и не делать commit без поручения.
- Навык test-driven-development заставил сначала получить честный RED, а уже потом писать реализацию. Это особенно проявилось в Feature A и B: сначала падали тесты по правильной причине, затем они же подтверждали корректность правок.
- check-after-edit hook мгновенно подсветил намеренно сломанный тест — сэкономило время на ручной перепроверке.
- Отдельный reviewer для Feature B поймал проблему, которую unit-тесты не заметили: success/timeout/error не были провязаны в UI.
- HANDOFF позволил новой сессии восстановить состояние и самостоятельно прогнать полную проверку без ручного контекста.
- Context7 помог быстро сверить API Vitest и MCP SDK, чтобы не гадать по памяти.

Что мешало / где были проблемы
- Команды из презентации не совпали с установленным OpenCode 1.18.34: например, `opencode api skill.list` отсутствовал. Пришлось проверять смысл действия другими способами.
- Репозиторий большой, и рабочая директория проекта живёт внутри него; worktree подтянул весь монорепозиторий, а не только jdm-direct.
- В docs/requirements.md случайно осталась временная инструкция «не реализуй A/B», из‑за чего reviewer формально зафиксировал конфликт с реальным состоянием.
- Первая версия Feature B была зелёной по unit-тестам, но не подключала success/timeout/error к UI.

Где потребовалось моё решение
- Я не принял первое замечание reviewer буквально и выяснил, что причина в устаревшей временной инструкции в requirements.
- Второе замечание про UI принял и доработал Feature B: связал success/timeout/error с интерфейсом.
- Перед commit я сам проверял diff и прогонял проверки, чтобы не полагаться только на «зелёный» локально.
- Для собственного MCP выбрал полезный для предметной области инструмент estimate_import_cost вместо искусственного demo.

Итог
Самым полезным механизмом оказался связанный каркас «AGENTS.md + TDD + автоматические проверки (hook + scripts/check.sh)»: он удерживал дисциплину и делал ошибки явными на ранней стадии. В следующем agentic‑проекте я заранее синхронизирую версию OpenCode с презентацией/скриптами, чтобы команды совпадали, и разделю рабочие директории так, чтобы worktree не тащил весь монорепозиторий. Ещё бы добавил end‑to‑end проверки UI для сценариев timeout/success/error, чтобы ловить те же несостыковки без участия reviewer.

---

# Practice 5 — OpenSpec, Spec Kit и Two teams, one feature

Артефакты и проверки перечислены в [submission/README.md](submission/README.md).

## Part 1 — OpenSpec full lifecycle
Change `filter-featured-by-budget` прошёл explore → propose → review → correction → apply → verification → sync → archive. Independent review до implementation нашёл blocking contradiction: design говорил, что пустой ввод не меняет выдачу, а spec требовал показать полный каталог. Исправление в design обошлось дёшево, потому что код ещё не был написан.

## Part 2 — OpenSpec customization
Persistent rule в `openspec/config.yaml` («Объясни взаимодействие компонентов диаграммой Mermaid.») попал в fresh OpenSpec instructions. AFTER design (`docs/practice5-part2/design-after.md`) получил Mermaid-диаграмму без изменения смысла относительно `design-before.md`.

## Homework — JDM Compare на GitHub Spec Kit
- UI (`specs/001-jdm-compare-ui`) и Logic (`specs/002-jdm-compare-logic`) specs писались независимо, поэтому разошлись: per-car и atomic семантика ошибок, идентификатор `suprak` вместо `supra`, агрегация ошибок вместо первой ошибки, правило округления.
- Общий контракт `docs/homework5/common-contract.md` согласован до production code; после него обе спеки были синхронизированы, а independent reviewer не пропускал реализацию до устранения противоречий.
- Backend edge case: `null` в `carIds` и `null`-элементы массива сначала не отличались от пустого/неверного ввода; исправлено, чтобы они давали `MALFORMED_REQUEST` (коммит `fix: align compare validation with contract`, тест `TestCompareHandler_MissingOrNullCarIDsIsMalformed`).
- Итоговая проверка: `go vet` и `go test` PASS, `sh scripts/check.sh` — 57/57 тестов и build PASS; в браузере R34 = 6 270 000 JPY, Supra = 4 590 000 JPY, Supra выделена как более дешёвый импорт.

## OpenSpec vs Spec Kit
OpenSpec удобен для brownfield change lifecycle: небольшой change, delta-spec, sync в main spec, archive. Spec Kit удобнее для multi-role фичи: отдельные spec/plan/tasks на роль и явный шаг согласования контракта.

## Смена harness
Практика начиналась в OpenCode (`.opencode/`), а закончилась в Claude Code (`.claude/`). Spec/plan/tasks, contract и OpenSpec-артефакты в репозитории переехали без изменений, то есть SDD artifacts пережили смену coding-agent harness.

## Выводы
- Independent review реально поймал противоречия до написания кода.
- Contract-first предотвратил drift между UI и Logic.
- Unit tests не заменяют browser E2E.
