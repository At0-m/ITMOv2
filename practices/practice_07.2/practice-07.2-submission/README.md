# Практика 7.2 — поддержка пользователей в n8n

## Классификация Issues

GitHub webhook запускает `Issue Triage` при открытии Issue. Дочерний workflow
`Issue Classifier` получает заголовок и описание и возвращает тип с оценкой
уверенности. Switch проставляет `bug`, `task` или `feature-request`.
При уверенности ниже 0.8 или неизвестном типе ставится `needs-triage`,
и комментарий в Issue не публикуется. Все четыре маршрута проверены на Issues #1–#4.

[Тестовый репозиторий и Issues](https://github.com/At0-m/for_n8n_issues/issues?q=is%3Aissue)

## Недельная статистика

`Weekly Issue Stats` настроен на понедельник, 09:00 МСК (`0 9 * * MON`).
Четыре запроса к GitHub собирают открытые за период, закрытые, находящиеся
в работе и отправленные на разбор Issues. Code node группирует результаты
по типу и автору, а Gmail отправляет HTML-отчёт.

При ручном прогоне отчёт показал 4 открытия, 1 закрытие, 1 Issue в работе
и 1 на разборе. Сводка сохраняется в `weekly_issue_stats`. Для проверки
сравнения добавлена тестовая запись предыдущей недели. Письмо показывает
Δ `+2 / +1 / 0 / +1` и AI-комментарий по этим изменениям.

## Бонус — автоматическое исправление

Открытие Issue #6 запустило классификацию и `Checkout Autofix`.
Workflow сгенерировал правку `checkout.py`, закоммитил её в отдельную
ветку и открыл PR #7. Дочерний workflow проверил diff и опубликовал AI-ревью.
После успешного Checkout CI n8n смержил PR в `main`. GitHub вернул
`merged: true`, а связанный Issue закрылся.

[Issue #6](https://github.com/At0-m/for_n8n_issues/issues/6) ·
[PR #7 с ревью и CI](https://github.com/At0-m/for_n8n_issues/pull/7)

## Подтверждения

В `evidence/` лежат скриншоты из GitHub, n8n и Gmail.

- [Ответ GitHub с merged: true для PR #7](<evidence/merged_sec.png>)
- [Сквозной запуск n8n #1954](<evidence/exec_second.png>)
- [Письмо с Δ и AI-комментарием](<evidence/email_with_ai.png>)
