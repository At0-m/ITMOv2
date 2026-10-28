import { describe, it, expect } from 'vitest'
import { validateBudget, filterCarsByBudget, mapBudgetErrorToMessage } from '../src/featuredFilter'

describe('validateBudget', () => {
  it('empty -> ok with null (no filter)', () => {
    const r = validateBudget('   ')
    expect(r).toEqual({ ok: true, value: null })
  })

  it('nan -> error with message', () => {
    const r = validateBudget('abcd')
    expect(r).toEqual({ ok: false, code: 'nan' })
    expect(mapBudgetErrorToMessage(r.code)).toBe('Неверное значение бюджета')
  })

  it('fraction with dot -> error', () => {
    const r = validateBudget('4200000.5')
    expect(r).toEqual({ ok: false, code: 'fraction' })
  })

  it('fraction with comma -> error', () => {
    const r = validateBudget('4,200,000')
    // contains comma, treated as fraction/invalid integer per spec
    expect(r).toEqual({ ok: false, code: 'fraction' })
  })

  it('nonpositive -> error', () => {
    expect(validateBudget('0')).toEqual({ ok: false, code: 'nonpositive' })
    expect(validateBudget('-1')).toEqual({ ok: false, code: 'nonpositive' })
  })

  it('too large -> error', () => {
    expect(validateBudget('100000001')).toEqual({ ok: false, code: 'too_large' })
  })

  it('valid integer boundaries', () => {
    expect(validateBudget('1')).toEqual({ ok: true, value: 1 })
    expect(validateBudget('100000000')).toEqual({ ok: true, value: 100000000 })
  })
})

describe('filterCarsByBudget', () => {
  const cars = [
    { id: 'r34', priceJpy: 5_800_000 },
    { id: 'supra', priceJpy: 4_200_000 },
    { id: 'rx7', priceJpy: 3_100_000 },
  ]

  it('no filter (null) -> returns all in original order', () => {
    const out = filterCarsByBudget(cars, null)
    expect(out.map(c => c.id)).toEqual(['r34', 'supra', 'rx7'])
  })

  it('inclusive boundary includes Supra at 4_200_000', () => {
    const out = filterCarsByBudget(cars, 4_200_000)
    expect(out.map(c => c.id)).toEqual(['supra', 'rx7'])
  })

  it('4_199_999 excludes Supra', () => {
    const out = filterCarsByBudget(cars, 4_199_999)
    expect(out.map(c => c.id)).toEqual(['rx7'])
  })

  it('3_000_000 -> empty state (no matches)', () => {
    const out = filterCarsByBudget(cars, 3_000_000)
    expect(out).toEqual([])
  })
})
