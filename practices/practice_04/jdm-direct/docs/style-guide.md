# Style guide

Ниже — короткие правила, обязательные для этого проекта.

1. Проверяй поведение через публичный интерфейс. Не тестируй внутренние детали реализации, если можно проверить наблюдаемое поведение.
2. Доменную логику валидации и расчёта держи отдельно от DOM/UI-кода. UI отвечает за отображение и события, доменная функция — за правила.
3. Используй типы и соглашения существующего TypeScript-проекта. Не добавляй any без необходимости.
4. Не добавляй framework или dependency ради маленькой правки. Предпочитай существующий стек и минимальную реализацию.
5. Не ослабляй тесты, requirements или runner ради зелёного результата.

Пример: хорошо (доменная логика отделена от UI)

```ts
// domain.ts — чистая функция валидации
export type ValidationResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

export function validatePrice(input: unknown): ValidationResult {
  if (input === null || input === undefined) return { ok: false, error: 'Цена обязательна' };
  const n = typeof input === 'string' ? Number(input.trim()) : input;
  if (!Number.isFinite(n)) return { ok: false, error: 'Цена должна быть числом' };
  if (n <= 0) return { ok: false, error: 'Цена должна быть больше 0' };
  return { ok: true, value: n };
}

// ui.ts — обработчик событий использует доменную функцию
function onPriceChange(e: Event) {
  const el = e.target as HTMLInputElement;
  const res = validatePrice(el.value);
  if (res.ok) {
    // обновляем состояние/модель/вызываем сервис
  } else {
    // показываем ошибку пользователю
  }
}
```
