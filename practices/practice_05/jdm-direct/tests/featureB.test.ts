import { describe, it, expect, vi } from 'vitest'
import { validateAndCalculateAsync } from '../src/priceValidation'

describe('Feature B — Dependency error', () => {
  it('успешный ответ сервиса -> результат возвращается', async () => {
    const service = vi.fn().mockResolvedValue({ total: 4242 })
    const res = await validateAndCalculateAsync(123456, service, { timeoutMs: 50 })
    expect(res).toEqual({ ok: true, result: { total: 4242 } })
    expect(service).toHaveBeenCalledTimes(1)
    expect(service).toHaveBeenCalledWith(123456)
  })

  it('сервис завершается timeout -> понятная timeout error', async () => {
    vi.useFakeTimers()
    try {
      const service = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve('late'), 1000)))
      const promise = validateAndCalculateAsync(10_000, service, { timeoutMs: 10 })
      await vi.advanceTimersByTimeAsync(10)
      const res = await promise
      expect(res).toEqual({ ok: false, error: 'Превышено время ожидания сервиса расчёта' })
      expect(service).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('сервис reject/error -> понятная dependency error', async () => {
    const service = vi.fn().mockRejectedValue(new Error('boom'))
    const res = await validateAndCalculateAsync(5000, service, { timeoutMs: 50 })
    expect(res).toEqual({ ok: false, error: 'Ошибка сервиса расчёта' })
    expect(service).toHaveBeenCalledTimes(1)
  })

  it('невалидный input по-прежнему не вызывает сервис', async () => {
    const service = vi.fn().mockResolvedValue({})
    const res = await validateAndCalculateAsync('', service, { timeoutMs: 50 })
    expect(res).toEqual({ ok: false, error: 'Цена обязательна' })
    expect(service).not.toHaveBeenCalled()
  })
})
