# evidence/llm — реальные прогоны Nemotron через OpenCode

Модель: openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free (OpenCode 1.18.34, провайдер OpenRouter).
Сервер: исправленный Mini Shop, 127.0.0.1:8066 (уязвимая версия не восстанавливалась).
Команды: см. `*_command.txt` (шаблон: `opencode run --agent shop-planner --model <model> --format json [--file <ctx>] -- <задача>`).
Файлы: `*_context_prompt.txt` — вход; `*_raw.jsonl` — сырой вывод; `*_model_text.txt` — текст ответа; `*_decision.json` — извлечённое решение; `*_execute.txt` — ответ /assistant/execute; `*_state.txt` — проверка состояния; `D_forced_*` — решения, отправленные вручную (не от модели). `judge/` — вход и ответ threat-judge.
00_connection_* — проверка связи (1 ping). Секреты в evidence не сохранялись.
