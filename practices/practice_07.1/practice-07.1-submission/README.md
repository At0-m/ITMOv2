# Практика 7.1. Ассистент для код-ревью в n8n

- [Экспорт workflow](workflow.json)
- [Тестовый PR с checkout.py](https://github.com/At0-m/for_n8n/pull/2)
- [Inline-комментарии в Files changed](https://github.com/At0-m/for_n8n/pull/2/files)

Workflow запускает основное ревью на `pull_request.opened` и по команде `/make_ai_review`. Основная модель — `gpt-5.2`. Команда `/make_other_ai_review` выбирает `gpt-5-mini`. После публикации workflow сохраняет GitHub ID PR, репозиторий и номер PR в `reviewed_prs`. Повторная основная команда для сохранённого PR останавливается до запроса diff и вызова модели.

## Подтверждения

| Критерий | Баллы | Материалы |
|---|---:|---|
| Вторая модель | 2 | [Execution #265](evidence/03-second-model-execution-265.png), [ревью в PR](evidence/04-second-model-pr-review.png) |
| Запись в Data Table | 2 | [Execution #285](evidence/05-data-table-execution-285.png), [строка PR #2](evidence/06-reviewed-prs.png) |
| Дедупликация | 3 | [Запуск с остановкой на проверке](evidence/07-deduplication-execution.png), [команда в PR](evidence/08-deduplication-pr-command.png), [повторная проверка финального workflow](evidence/13-final-deduplication-execution.png) |
| Inline-комментарии | 5 | [Execution](evidence/10-inline-review-execution.png), [строка 7 и заголовок ревью с Model ID](evidence/11-inline-discount.png), [строки 15 и 26](evidence/12-inline-shipping-and-eof.png) |

Базовая практика подтверждена [автоматическим ревью при открытии PR](evidence/02-automatic-checkout-review.png) и [запуском по основной команде](evidence/01-main-command-execution-259.png).

## Импорт в n8n

1. Импортируйте `workflow.json` и выберите свой GitHub credential в триггере и HTTP-нодах. В `OpenAI Chat Model2` выберите OpenAI-совместимый credential с доступом к обеим моделям.
2. Создайте `reviewed_prs` с колонками `pr_id` (String), `repo` (String) и `pr_number` (Number). Выберите эту таблицу в `Skip Reviewed PR` и `Upsert row(s)`.
3. Если используете свой тестовый репозиторий, выберите его в `Github Trigger`. Опубликуйте workflow и откройте тестовый PR.
