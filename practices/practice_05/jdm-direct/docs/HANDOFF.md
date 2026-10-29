Current state
- Feature A реализована и проверена.
- Feature B реализована и проверена.
- Feature B была сделана отдельно в worktree и прошла отдельный review.
- После merge объединённое состояние прошло полную проверку.

Feature A
- входная валидация цены JPY;
- цена обязательна;
- число > 0;
- максимум 100000000 JPY;
- при невалидном вводе сервис не вызывается;
- ошибка отображается пользователю.

Feature B
- асинхронный сервис расчёта;
- ограничение времени ожидания;
- понятная timeout error;
- понятная dependency error;
- успешный результат отображается в UI;
- сценарии Feature A сохранены.

Project environment
- AGENTS.md
- docs/style-guide.md
- test-driven-development skill
- Context7 MCP
- check-after-edit hook
- scripts/check.sh

Verification
Полная проверка проекта:
sh scripts/check.sh

Constraints
- requirements не менять без прямого поручения;
- проверки не ослаблять;
- зависимости без необходимости не добавлять;
- commit без поручения не делать.

Next
Продуктовые Feature A и B для практики завершены.
Следующий этап — домашняя часть и подготовка evidence для сдачи.
