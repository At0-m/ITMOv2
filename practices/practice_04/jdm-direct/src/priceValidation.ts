// Minimal API surface for Feature A validation and service invocation.
// validateAndCalculate decides whether to call the provided service based on input validity.

export type CalcService = (priceJpy: number) => unknown;

export type ValidationResult = {
  ok: true;
  value: number;
} | {
  ok: false;
  error: string;
};

export function validatePrice(input: unknown): ValidationResult {
  // Required
  if (input === null || input === undefined) {
    return { ok: false, error: 'Цена обязательна' };
  }

  // Handle string inputs
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      return { ok: false, error: 'Цена обязательна' };
    }
    const n = Number(trimmed);
    if (!Number.isFinite(n)) {
      return { ok: false, error: 'Цена должна быть числом' };
    }
    if (n <= 0) {
      return { ok: false, error: 'Цена должна быть больше 0' };
    }
    if (n > 100000000) {
      return { ok: false, error: 'Цена не должна превышать 100000000 JPY' };
    }
    return { ok: true, value: n };
  }

  // Handle number inputs
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      return { ok: false, error: 'Цена должна быть числом' };
    }
    if (input <= 0) {
      return { ok: false, error: 'Цена должна быть больше 0' };
    }
    if (input > 100000000) {
      return { ok: false, error: 'Цена не должна превышать 100000000 JPY' };
    }
    return { ok: true, value: input };
  }

  // Any other type is invalid
  return { ok: false, error: 'Цена должна быть числом' };
}

export function validateAndCalculate(input: unknown, service: CalcService): { error?: string } {
  const res = validatePrice(input);
  if (res.ok) {
    service(res.value);
    return {};
  }
  return { error: res.error };
}
