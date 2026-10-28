// Pure domain logic for Featured budget filtering (spec-aligned)
// validateBudget: parses and validates user input per spec
// filterCarsByBudget: returns cars with priceJpy <= budget (inclusive), preserving order

export type BudgetOk = { ok: true; value: number | null }
export type BudgetErrCode = 'nan' | 'fraction' | 'nonpositive' | 'too_large'
export type BudgetErr = { ok: false; code: BudgetErrCode }

export function validateBudget(raw: string): BudgetOk | BudgetErr {
  const value = raw.trim()
  if (value.length === 0) {
    // Empty/whitespace → no filter
    return { ok: true, value: null }
  }

  // Reject fractions by presence of decimal/grouping separators
  if (/[.,]/.test(value)) {
    return { ok: false, code: 'fraction' }
  }

  const n = Number(value)
  if (!Number.isFinite(n) || Number.isNaN(n)) return { ok: false, code: 'nan' }
  if (!Number.isInteger(n)) return { ok: false, code: 'fraction' }
  if (n <= 0) return { ok: false, code: 'nonpositive' }
  if (n > 100_000_000) return { ok: false, code: 'too_large' }
  return { ok: true, value: n }
}

export interface PricedItem { priceJpy: number }

export function filterCarsByBudget<T extends PricedItem>(cars: T[], budgetJpy: number | null | undefined): T[] {
  if (budgetJpy == null) return cars.slice()
  return cars.filter((c) => typeof c.priceJpy === 'number' && Number.isFinite(c.priceJpy) && c.priceJpy <= budgetJpy)
}

export function mapBudgetErrorToMessage(code: BudgetErrCode): string {
  switch (code) {
    case 'nan':
      return 'Неверное значение бюджета'
    case 'fraction':
      return 'Дробные значения JPY не допускаются'
    case 'nonpositive':
      return 'Допустимый диапазон: 1 — 100000000 JPY'
    case 'too_large':
      return 'Допустимый диапазон: 1 — 100000000 JPY'
  }
}
