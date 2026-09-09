# E2E-проверки

| Сценарий пользователя | Предусловия | Действие | Наблюдаемый результат | Evidence |
|---|---|---|---|---|
| Позитивный | Сервис доступен; diff <= 20 000 символов | POST /api/reviews с валидным diff | JSON с полями summary, risks (<=3), checks | Не выполнялось. Ожидаемое evidence: HTTP 200 и JSON‑схема |
| Негативный | Нет ключа diff в payload | POST /api/reviews с {} | Предлагаемое: 422 Unprocessable Entity | Не выполнялось. Ожидаемое evidence: HTTP 422 |
| Граничный | diff длиной 20 001 | POST /api/reviews | 413 Payload Too Large | Не выполнялось. Ожидаемое evidence: HTTP 413 |

## Как использовали AI

- Строка в [`prompts.md`](prompts.md): P1-02.
- Что проверили и исправили сами: Требуется проверка студентом.
