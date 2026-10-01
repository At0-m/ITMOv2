# Сравнение A/B ответов (ab-final)

Для каждого вопроса приведены: фактический финальный ответ A, финальный ответ B, оценка (correct/partial/incorrect), статусы file:line (A/B: correct/missing/wrong), реальные tool calls, ошибки/галлюцинации.

## Q1. Как запустить тесты? Укажи файл-источник.
- A (final): «make test». Файл-источник в ответе не указан.
- B (final): «make test». Файл-источник указан как service.py (ошибка; корректный источник README.md и/или Makefile).
- Оценка: A=partial (нет файла-источника в финальном тексте), B=partial (неверный источник).
- file:line:
  - A: missing (в тексте нет ссылки на README.md:6 или Makefile:1-3)
  - B: wrong (указывает service.py; корректно: demo/README.md:6; demo/Makefile:1-3)
- Tool calls:
  - A: read(practices/practice_03/lab/demo/README.md)
  - B: read(practices/practice_03/lab/demo/README.md)
- Ошибки/галлюцинации:
  - B: неверно указан файл-источник.

## Q2. Что будет при пустом имени подписчика? Подтверди кодом.
- A (final): Будет ValueError("empty name") из проверки `if not name.strip()`.
- B (retry2 final): По `test_service.py:14` при `subscribe(" ")` возникает `ValueError` (тест `test_empty`).
- Оценка: A=correct, B=correct.
- file:line:
  - A: correct (service.py:5-6)
  - B: correct (test_service.py:14); ссылка на service.py:5-6 отсутствует, но ответ подтверждён тестом.
- Tool calls:
  - A: read(README.md), read(service.py)
  - B (retry2): read(test_service.py); попытки read(/service.py) были отклонены политикой external_directory.
- Ошибки/галлюцинации:
  - B (initial/retry1): отсутствие финального ответа. В retry2 — финальный текст присутствует и корректен.

## Q3. Где реализован unsubscribe? Проверь предпосылку вопроса.
- A (final): «Ничего не найдено», далее выдумана клиент/серверная архитектура и поведение unsubscribe.
- B (final): «unsubscribe не реализован» (по service.py).
- Оценка: A=incorrect (выдуманная архитектура), B=correct.
- file:line:
  - A: correct (поиск по репо и чтение service.py показывают отсутствие unsubscribe), но финальный текст с выдуманной логикой делает ответ неверным по сути.
  - B: correct (service.py:1-9 — отсутствует unsubscribe).
- Tool calls:
  - A: grep(pattern="def.*unsubscribe|…"), read(service.py)
  - B: read(README.md), read(service.py)
- Ошибки/галлюцинации:
  - A: выдуманная клиент/серверная логика при отсутствии кода.

## Q4. Какая CI-система запускает тесты? Если сведений нет, скажи об этом.
- A (final): По доступным материалам определить нельзя.
- B (final): По доступным материалам определить нельзя; дополнительно заявлено, что CI-файлов нет.
- Оценка: A=correct, B=correct (основной вывод корректен; заявление об отсутствии CI-файлов во всём проекте — потенциально чрезмерно сильное, но не меняет сути).
- file:line:
  - A: correct (README.md:6)
  - B: correct (README.md:6); поиск ключевых слов CI дал 0 совпадений.
- Tool calls:
  - A: read(README.md)
  - B: grep(ключевые слова CI по demo), read(README.md)
- Ошибки/галлюцинации:
  - B: есть чрезмерно сильное заявление об отсутствии CI-файлов.

## Q5. Сохраняются ли подписки после перезапуска процесса? Подтверди кодом.
- A (final): Подписки не сохраняются (хранятся в памяти процесса; `subscribers = set()`), retry дал финальный ответ.
- B (final): Описана память процесса и глобальная переменная; формулировка размыта относительно состояния «после перезапуска».
- Оценка: A=correct, B=partial.
- file:line:
  - A: correct (README.md:2; service.py:1)
  - B: missing (в тексте нет явных file:line ссылок на места подтверждения персистентности после перезапуска).
- Tool calls:
  - A: read(README.md), read(service.py)
  - B: read(service.py), read(test_service.py)
- Ошибки/галлюцинации:
  - B: терминологическая неточность («не очищается при каждом рекурсивном вызове»), нет прямого ответа о состоянии после перезапуска.

# Итоги
- Correct: A=3/5 (Q2, Q4, Q5), B=3/5 (Q2, Q3, Q4)
- Partial: A=1/5 (Q1), B=2/5 (Q1, Q5)
- Incorrect: A=1/5 (Q3), B=0/5

# Reliability Failures (initial/retry runs без финального ответа)
- A Q5: a-q05.jsonl — без финального type=text; успешный повтор: a-q05-retry1.jsonl
- B Q2: b-q02.jsonl — без финального type=text; b-q02-retry1.jsonl — без финального type=text; успешный повтор: b-q02-retry2.jsonl

# Примечания
- В B Q4 присутствует чрезмерное утверждение об отсутствии CI-файлов; основной ответ («определить нельзя») корректен.
- Все tool permissions соблюдены: в A/B использовались только read и grep; попытки доступа вне каталога были отклонены политикой.
