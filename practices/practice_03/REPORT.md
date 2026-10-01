# Отчёт: локальные модели

Отчёт ведёт OpenCode по фактическим результатам команд и вашим сообщениям в чате. Поручите агенту заполнить разделы и показать diff. Выводы студента он записывает после обсуждения; отсутствующие измерения отмечает как невыполненные.

## Окружение

ОС / CPU / GPU / RAM / VRAM / свободный диск:
Ubuntu 24.04.5 LTS; CPU: Intel Core i5-1135G7 (4C/8T); RAM: ~7.6 GiB total; used ~6.6 GiB; available ~1.0 GiB; Swap: ~2.0 GiB used; GPU/VRAM: не используется; Диск: df -h . → 468G total, 402G used, 43G avail (91%).

Ollama или LM Studio / OpenCode / Python, версии:
Ollama 0.35.0; OpenCode 1.18.34; Python 3.12.3; make 4.3.

Модель, разработчик, семейство, тег и ID:
Локально установлены модели Ollama. В числе доступных: qwen3.5:2b (ID: 324d162be6ca), qwen3.5:4b (ID: 2a654d98e6fb), а также пользовательские itmo-local и itmo-agent.

Формат, квантизация, лицензия, источник:
qwen3.5:2b — архитектура qwen35 (~2.3B параметров), квантизация Q8_0; лицензия Apache 2.0; источник: локально установлено через Ollama (подтверждено `ollama show qwen3.5:2b`).

Фактический контекст, размещение CPU/GPU:
API‑эксперименты (experiment.py): num_ctx=4096. itmo-agent (Modelfile.agent): num_ctx=4096. `ollama ps` в момент проверки пуст; для placement использован сохранённый snapshot (lab/results/ab-final/resource-snapshot.txt): itmo-agent работал с context=4096 и PROCESSOR=100% CPU.

Почему выбрана эта конфигурация:
Ограничение по памяти (8 ГБ RAM) и отсутствие дискретного GPU; минимизация требований и времени скачивания.

## Сравнение семейств

| Разработчик / модель | Задача | Параметры / формат | Лицензия | Русский / tools | Источник |
|---|---|---|---|---|---|
| Qwen (Alibaba) / qwen3.5:2b | Общего назначения (текст/визуальные входы) | ~2.27B params; arch=qwen35; quant=Q8_0; context 256K | Apache 2.0 | Русский: заявлена глобальная поддержка; Tools: заявлены | Официальная карточка Ollama: https://ollama.com/library/qwen3.5:2b |
| Google / gemma2:2b | Общего назначения (текст) | ~2.61B params; arch=gemma2; quant=Q4_0; context: не подтверждено | Gemma Terms of Use | Русский: не подтверждено; Tools: не подтверждено | Официальная карточка Ollama: https://ollama.com/library/gemma2:2b |

## Воспроизведение

Команды и файлы конфигурации:
Выполненные команды (из каталога practices/practice_03/lab):
- make install
- make test
- ollama list
- curl --fail http://localhost:11434/api/tags
- python3 experiment.py --mode baseline --model "qwen3.5:2b" --temperature 0.2 --seed 42 --output results/baseline-2b.json
- python3 experiment.py --mode system --model "qwen3.5:2b" --temperature 0.2 --seed 42 --output results/system-2b.json
- ollama run qwen3.5:2b "READY" (прогрев, не сохранялся как результат)
- python3 experiment.py --mode system --model "qwen3.5:2b" --temperature 0.2 --seed 42 --output results/temp02-seed42.json
- python3 experiment.py --mode system --model "qwen3.5:2b" --temperature 0.2 --seed 43 --output results/temp02-seed43.json
- python3 experiment.py --mode system --model "qwen3.5:2b" --temperature 0.2 --seed 44 --output results/temp02-seed44.json
- python3 experiment.py --mode system --model "qwen3.5:2b" --temperature 0.8 --seed 42 --output results/temp08-seed42.json
- python3 experiment.py --mode system --model "qwen3.5:2b" --temperature 0.8 --seed 43 --output results/temp08-seed43.json
- python3 experiment.py --mode system --model "qwen3.5:2b" --temperature 0.8 --seed 44 --output results/temp08-seed44.json

Подтверждение локального endpoint и скачанных весов:
- qwen3.5:2b присутствует в списке моделей (ollama list)
- curl --fail http://localhost:11434/api/tags возвращает список моделей, включая qwen3.5:2b
Проверка без сети после подготовки: не выполнялась.
Если работали в паре: не применимо; работа выполнялась на одном устройстве.

## Эксперимент

Домашнее A/B system prompt (OpenCode): выполнено.

Фактор A/B: отличается ровно один фактор — system prompt.
Неизменные условия: модель ollama/itmo-agent (qwen3.5:2b backend), context=4096, output=1024, steps=8, tools: read/grep, одна и та же директория demo/.

A prompt:
Полный system prompt: lab/ab/system-a.txt

B prompt (строгий):
Полный system prompt: lab/ab/system-b.txt

У обоих общий execution protocol; единственный изменяемый фактор A/B — содержание system prompt. В варианте B дополнительно заданы строгие требования к file:line, отсутствующим сведениям и недопустимости выдумок.

Агенты: local-guide-a и local-guide-b в demo/opencode.json; все параметры совпадают, кроме prompt. Провайдер: ollama. Sharing выключен, external_directory=deny. Разрешены только read/grep.

10 запусков (5 вопросов × A/B) сохранены в lab/results/ab-final/*.jsonl. Сравнение с эталонами — lab/results/ab-final/comparison.md.

Итоги по корректности (кратко, по comparison.md):
- A: Q1 partial; Q2 correct; Q3 incorrect; Q4 correct; Q5 correct.
- B: Q1 partial; Q2 correct (для content evaluation учитывается retry2); Q3 correct; Q4 correct с caveat; Q5 partial.

Speed test (3×A, 3×B, вопрос Q1; прогрето):
См. raw и .time в lab/results/ab-final/speed/.
Медиана A и B пересчитаны по финальной конфигурации (ниже в разделе «Скорость»).

Эксперимент temperature (mode=system, seeds 42/43/44):

| Файл | temperature | seed | Ответ (кратко) | wall_seconds | load_seconds | total_seconds | decode_tokens_per_second |
|---|---|---:|---|---:|---:|---:|---:|
| results/temp02-seed42.json | 0.2 | 42 | «В предоставленных материалах нет ответа.» | 0.696 | 0.001 | 0.674 | 16.458 |
| results/temp02-seed43.json | 0.2 | 43 | «В предоставленных материалах нет ответа.» | 0.734 | 0.001 | 0.712 | 15.202 |
| results/temp02-seed44.json | 0.2 | 44 | «В предоставленных материалах нет ответа.» | 0.719 | 0.001 | 0.700 | 15.567 |
| results/temp08-seed42.json | 0.8 | 42 | «В предоставленных материалах нет ответа.» | 0.727 | 0.001 | 0.708 | 15.229 |
| results/temp08-seed43.json | 0.8 | 43 | «В предоставленных материалах нет ответа.» | 0.681 | 0.001 | 0.660 | 16.521 |
| results/temp08-seed44.json | 0.8 | 44 | «В предоставленных материалах нет ответа.» (+краткое пояснение) | 5.100 | 0.001 | 5.080 | 13.918 |

## Скорость

Финальный speed-тест (A/B, вопрос Q1, новая сессия, tools: read/grep, steps=8, temperature=0.2, seed=42, context=4096, output=1024). Порядок запусков: A1, B1, A2, B2, A3, B3. Замер по внешнему таймеру `/usr/bin/time -f "%e"`.

Raw times (секунды):
- A: 135.42; 128.10; 124.81
- B: 165.19; 163.24; 163.60

Median:
- A median: 128.10 s
- B median: 163.24 s

Примечание: не утверждаем, что A «быстрее» как общее свойство — различались tool‑path и длина ответа; разница на данном конкретном Q1 и конфигурации фиксируется как факт.

Холодный старт отдельно:
- Первый запрос (baseline, без system, results/baseline-2b.json) включал загрузку модели: load_seconds ≈ 5.34; wall_seconds ≈ 35.08; total_seconds ≈ 35.05.
- Первый системный запуск (results/system-2b.json) после загрузки: wall_seconds ≈ 2.58; total_seconds ≈ 2.56.

Три прогретых запуска и медиана:
- temperature=0.2 (seeds 42/43/44): медиана total_seconds ≈ 0.700; медиана decode_tokens_per_second ≈ 15.567. Это три прогретых запуска с разными seed (42/43/44), а не три идентичных повтора.
- temperature=0.8 (seeds 42/43/44): медиана total_seconds ≈ 0.708; медиана decode_tokens_per_second ≈ 15.229. temp=0.8 seed=44 занял больше времени главным образом из‑за длины ответа (69 output tokens против 9 у коротких ответов), поэтому общий вывод о скорости от temperature по этим трём точкам делать нельзя.

Единицы и метод замера:
- Для API‑скрипта experiment.py показатели wall_seconds, load_seconds, total_seconds и decode_tokens_per_second взяты из JSON‑ответов Ollama (non‑streaming chat).
- Для финального A/B speed использован внешний таймер (/usr/bin/time -f "%e") на полном процессе opencode run; в .time записано wall time в секундах.
- TTFT не измерялся отдельно (ответы не потоковые).

## Вывод

Ошибка или обнаруженное ограничение: выдумывание архитектуры (A Q3); нестабильность финализации ответов (B Q2, A Q5).
Как проверили: сопоставление с эталонами и file:line; анализ tool calls; повторные запуски с сохранением jsonl и отказов.
Какой конфигурацией будете пользоваться: qwen3.5:2b, context=4096; OpenCode агент с prompt B; инструменты read/grep; steps=8; temperature=0.2; seed=42; external_directory=deny.
Что осталось непроверенным: поведение на больших репозиториях; стабильность при длинных цепочках инструментов; влияние альтернативных сидов/temperature на A/B; TTFT в потоковом режиме.

### Наблюдения по конфигурации qwen3.5:4b

- В проверенном запуске qwen3.5:4b с контекстом 16384 успешно выполнила tool calls.
- Наблюдаемое использование RAM при прогретой работе доходило примерно до 7.4 ГБ.
- Такая конфигурация признана слишком рискованной для демонстрации при параллельной нагрузке (видеозвонок/браузер) на ноутбуке с ~8 ГБ RAM; принято решение перейти на qwen3.5:2b с контекстом 4096 для снижения потребления RAM.

### Наблюдения по конфигурации qwen3.5:2b

- Конфигурация qwen3.5:2b с контекстом 4096 в работе достигала примерно 6.4 ГБ RAM (наблюдавшееся значение при прогретой модели). Это учтено для запаса под видеозвонок и браузер.

## Ресурсы

Финальный snapshot системы (lab/results/ab-final/resource-snapshot.txt):
- itmo-agent: context 4096; PROCESSOR: 100% CPU.
- В момент snapshot вся система: RAM total ~7.6 GiB; used ~6.6 GiB; available ~1.0 GiB; swap ~2.0 GiB used.

Отдельные наблюдения:
- 4B/16k ранее доходила примерно до 7.4 ГБ RAM;
- 2B/4k наблюдалась примерно на 6.4 ГБ RAM, а в финальном системном snapshot было ~6.6 GiB used.

Это разовый snapshot всей системы, не точный peak RAM модели и не доказательство, что весь swap использовала Ollama. Корректный вывод: 2B/4k снижает требования относительно 4B/16k, но на 8 ГБ RAM при параллельной нагрузке запас всё равно ограничен.

## Итоги A/B по домашней части

Четыре эксперимента отчёта:
1. API baseline vs system — выполнено через experiment.py (см. results/*system*.json).
2. Temperature 0.2 vs 0.8, seeds 42/43/44 — выполнено (см. таблицу выше).
3. OpenCode local read/tool-call check — выполнено (локальный профиль, фактический вызов read подтверждён в results/read-check.jsonl).
4. HOMEWORK A/B system prompt — выполнено; входные условия финализированы.

HOMEWORK A/B (ab-final):
- A: 3 correct / 1 partial / 1 incorrect.
- B: 3 correct / 2 partial / 0 incorrect.

Разделение оценок:
- Content quality:
  - A = 3 correct / 1 partial / 1 incorrect
  - B = 3 correct / 2 partial / 0 incorrect
- First-attempt completion reliability:
  - A: 4/5 дали содержательный финальный текст с первой попытки; Q5 потребовал retry1.
  - B: 4/5 дали содержательный финальный текст с первой попытки; Q2 initial и retry1 не дали полезного ответа, retry2 успешен.

Пояснение: content evaluation сравнивает первый содержательный финальный ответ, а reliability учитывает все неудачные попытки (initial/retry) до успешного ответа.

Ключевые ограничения и наблюдения:
- A Q3: после корректного поиска отсутствующего unsubscribe модель выдумала клиент/серверную архитектуру — substantive hallucination.
- B Q2: initial и retry1 не дали полезного финального ответа; retry2 успешен — это limitation по reliability.
- A Q5: initial завершился без final text; retry1 успешен.
- Модель иногда пыталась читать абсолютный /service.py, но политика external_directory заблокировала доступ — пример важности permissions.
- B Q4: основной вывод «данных недостаточно» верный, но сформулировано сильнее подтверждённого (об отсутствии CI‑файлов).

Выбор конфигурации для дальнейшего использования:
- Основная модель: qwen3.5:2b, context 4096. Обоснование: qwen3.5:4b (16k) работала, но на 8 ГБ RAM оставляла слишком мало запаса; 2B/4k даёт больший ресурсный запас при признаваемых ограничениях по планированию и стабильности tool‑loop.
- По системным подсказкам: строгий prompt B выбран как более безопасный на данном наборе — он не дал substantive hallucination уровня A Q3, но не идеален по надёжности (Q2 потребовал второй повтор, а Q1/Q5 остались partial). Для продакшена уместно сохранить строгие требования к ссылкам на файлы и осторожную формулировку отсутствующих сведений.

Вывод:
- Ошибка или обнаруженное ограничение: выдумывание архитектуры (A Q3); нестабильность финализации ответов (B Q2, A Q5).
- Как проверили: сопоставление с эталонами и file:line; анализ tool calls; повторные запуски с сохранением jsonl и отказов.
- Какой конфигурацией будете пользоваться: qwen3.5:2b, context=4096; OpenCode агент с prompt B; инструменты read/grep; steps=8; temperature=0.2; seed=42; external_directory=deny.
- Что осталось непроверенным: поведение на больших репозиториях; стабильность при длинных цепочках инструментов; влияние альтернативных сидов/temperature на A/B; TTFT в потоковом режиме.
