import { describe, it, expect, vi } from 'vitest'
import { compareCars, mapCompareErrorToMessage, parseCompareSuccess, COMPARE_BASE_URL } from '../src/compareApi'

const r34 = { carId: 'r34', purchasePriceJpy: 5800000, auctionFeeJpy: 290000, shippingJpy: 180000, totalImportJpy: 6270000 }
const supra = { carId: 'supra', purchasePriceJpy: 4200000, auctionFeeJpy: 210000, shippingJpy: 180000, totalImportJpy: 4590000 }

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('compareCars request', () => {
  it('sends exactly one POST with carIds array in selection order', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ results: [supra, r34] }))
    await compareCars(['supra', 'r34'], { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`${COMPARE_BASE_URL}/api/compare`)
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    const body = JSON.parse(init.body as string)
    expect(body).toEqual({ carIds: ['supra', 'r34'] })
    expect(Array.isArray(body.carIds)).toBe(true)
  })
})

describe('compareCars success', () => {
  it('returns both results in order with backend values untouched', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ results: [r34, supra] }))
    const out = await compareCars(['r34', 'supra'], { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(out).toEqual({ ok: true, results: [r34, supra] })
  })

  it('rejects results in a different order than requested (no partial success)', () => {
    const out = parseCompareSuccess({ results: [supra, r34] }, ['r34', 'supra'])
    expect(out).toMatchObject({ ok: false, code: 'BAD_RESPONSE' })
  })

  it.each([
    ['not an object', null],
    ['results not an array', { results: 'x' }],
    ['one result only', { results: [r34] }],
    ['three results', { results: [r34, supra, r34] }],
    ['non-integer money', { results: [r34, { ...supra, totalImportJpy: 1.5 }] }],
    ['missing field', { results: [r34, { carId: 'supra', purchasePriceJpy: 1 }] }],
  ])('invalid success shape (%s) -> BAD_RESPONSE', async (_n, body) => {
    const fetchImpl = vi.fn(async () => jsonResponse(body))
    const out = await compareCars(['r34', 'supra'], { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(out).toMatchObject({ ok: false, code: 'BAD_RESPONSE' })
  })
})

describe('compareCars errors', () => {
  it.each([
    ['MALFORMED_REQUEST', 400],
    ['WRONG_CAR_COUNT', 400],
    ['DUPLICATE_CAR_IDS', 400],
    ['CAR_NOT_FOUND', 404],
    ['INTERNAL_ERROR', 500],
  ])('envelope code %s is passed through', async (code, status) => {
    const fetchImpl = vi.fn(async () => jsonResponse({ error: { code, message: 'whatever' } }, status))
    const out = await compareCars(['r34', 'supra'], { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(out).toEqual({ ok: false, code, message: 'whatever' })
  })

  it('user message depends on code, not on server message text', () => {
    expect(mapCompareErrorToMessage('CAR_NOT_FOUND')).toContain('не найден')
    expect(mapCompareErrorToMessage('INTERNAL_ERROR')).toBe('Не удалось получить расчёт импорта. Повторите попытку.')
    expect(mapCompareErrorToMessage('SOMETHING_NEW')).toBe(mapCompareErrorToMessage('INTERNAL_ERROR'))
  })

  it('network failure -> NETWORK_ERROR', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    })
    const out = await compareCars(['r34', 'supra'], { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(out).toMatchObject({ ok: false, code: 'NETWORK_ERROR' })
  })

  it('non-JSON 502 -> SERVER_ERROR', async () => {
    const fetchImpl = vi.fn(async () => new Response('<html>Bad gateway</html>', { status: 502 }))
    const out = await compareCars(['r34', 'supra'], { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(out).toMatchObject({ ok: false, code: 'SERVER_ERROR' })
  })

  it('JSON 500 without envelope -> SERVER_ERROR', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ oops: true }, 500))
    const out = await compareCars(['r34', 'supra'], { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(out).toMatchObject({ ok: false, code: 'SERVER_ERROR' })
  })

  it('2xx with non-JSON body -> BAD_RESPONSE', async () => {
    const fetchImpl = vi.fn(async () => new Response('ok', { status: 200 }))
    const out = await compareCars(['r34', 'supra'], { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(out).toMatchObject({ ok: false, code: 'BAD_RESPONSE' })
  })
})
