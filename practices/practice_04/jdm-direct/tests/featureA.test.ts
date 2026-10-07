import { describe, it, expect, vi } from 'vitest'
import { validateAndCalculate } from '../src/priceValidation'

describe('Feature A — Input validation', () => {
  it('валидная цена -> сервис вызывается', () => {
    const service = vi.fn()
    const res = validateAndCalculate(1500000, service)
    expect(res.error).toBeUndefined()
    expect(service).toHaveBeenCalledTimes(1)
    expect(service).toHaveBeenCalledWith(1500000)
  })

  it('100000000 -> сервис вызывается', () => {
    const service = vi.fn()
    const res = validateAndCalculate(100000000, service)
    expect(res.error).toBeUndefined()
    expect(service).toHaveBeenCalledTimes(1)
    expect(service).toHaveBeenCalledWith(100000000)
  })

  it('пустое значение -> ошибка, сервис не вызывается', () => {
    const service = vi.fn()
    const res = validateAndCalculate('', service)
    expect(res.error).toBe('Цена обязательна')
    expect(service).not.toHaveBeenCalled()
  })

  it('0 -> ошибка, сервис не вызывается', () => {
    const service = vi.fn()
    const res = validateAndCalculate(0, service)
    expect(res.error).toBe('Цена должна быть больше 0')
    expect(service).not.toHaveBeenCalled()
  })

  it('отрицательное значение -> ошибка, сервис не вызывается', () => {
    const service = vi.fn()
    const res = validateAndCalculate(-1, service)
    expect(res.error).toBe('Цена должна быть больше 0')
    expect(service).not.toHaveBeenCalled()
  })

  it('100000001 -> ошибка, сервис не вызывается', () => {
    const service = vi.fn()
    const res = validateAndCalculate(100000001, service)
    expect(res.error).toBe('Цена не должна превышать 100000000 JPY')
    expect(service).not.toHaveBeenCalled()
  })

  it('нечисловое значение -> ошибка, сервис не вызывается', () => {
    const service = vi.fn()
    const res = validateAndCalculate('abc', service)
    expect(res.error).toBe('Цена должна быть числом')
    expect(service).not.toHaveBeenCalled()
  })
})
