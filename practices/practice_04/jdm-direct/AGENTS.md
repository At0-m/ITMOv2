# Project rules

## Product contract
Требования находятся в:
docs/requirements.md

Перед изменением продуктового поведения обязательно прочитай этот файл.

Также перед изменением кода обязательно прочитай:
docs/style-guide.md

## Current verification
Полная проверка проекта выполняется командой: `sh scripts/check.sh`.

## Project entry point
Основной entry point приложения: `src/main.ts`.

## Constraints
- Не меняй docs/requirements.md без прямого поручения пользователя.
- Не ослабляй проверки ради успешного результата.
- Не добавляй framework или dependency без необходимости.
- Не реализуй Feature B во время работы над Feature A.
- Не делай git commit без прямого поручения пользователя.

## Feature A
При работе над Feature A:
- проверить входное значение;
- отклонять невалидные значения;
- при невалидном вводе сервис расчёта не вызывать;
- поведение должно соответствовать docs/requirements.md.
