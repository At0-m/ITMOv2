// HTTP client for POST /api/compare (contract: docs/homework5/common-contract.md). No DOM.
// One batched request; atomic outcome: either a full ordered pair of results or a single error.
// Control flow branches on `error.code` only; `message` is never inspected.

export const COMPARE_BASE_URL = 'http://localhost:8081'

export interface CompareItem {
  carId: string
  purchasePriceJpy: number
  auctionFeeJpy: number
  shippingJpy: number
  totalImportJpy: number
}

// Codes defined by the contract; any other string from the server is treated as unknown.
export const BACKEND_ERROR_CODES = [
  'MALFORMED_REQUEST',
  'WRONG_CAR_COUNT',
  'DUPLICATE_CAR_IDS',
  'CAR_NOT_FOUND',
  'INTERNAL_ERROR',
] as const

// Codes produced locally when no valid error envelope exists.
export const NETWORK_ERROR = 'NETWORK_ERROR' // fetch rejected (backend down, CORS, offline)
export const SERVER_ERROR = 'SERVER_ERROR' // non-2xx without a valid error envelope (proxy 502, HTML, ...)
export const BAD_RESPONSE = 'BAD_RESPONSE' // 2xx but body is not the agreed success shape

export type CompareOutcome =
  | { ok: true; results: [CompareItem, CompareItem] }
  | { ok: false; code: string; message: string }

export interface CompareOptions {
  baseUrl?: string
  fetchImpl?: typeof fetch
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function parseItem(v: unknown): CompareItem | null {
  if (!isRecord(v) || typeof v.carId !== 'string') return null
  const { purchasePriceJpy, auctionFeeJpy, shippingJpy, totalImportJpy } = v
  for (const n of [purchasePriceJpy, auctionFeeJpy, shippingJpy, totalImportJpy]) {
    if (typeof n !== 'number' || !Number.isInteger(n)) return null
  }
  return {
    carId: v.carId,
    purchasePriceJpy: purchasePriceJpy as number,
    auctionFeeJpy: auctionFeeJpy as number,
    shippingJpy: shippingJpy as number,
    totalImportJpy: totalImportJpy as number,
  }
}

// Success shape: exactly two items whose carIds match the request, in request order.
export function parseCompareSuccess(body: unknown, carIds: readonly [string, string]): CompareOutcome {
  const bad: CompareOutcome = { ok: false, code: BAD_RESPONSE, message: 'Unexpected compare response shape' }
  if (!isRecord(body) || !Array.isArray(body.results) || body.results.length !== 2) return bad
  const a = parseItem(body.results[0])
  const b = parseItem(body.results[1])
  if (!a || !b || a.carId !== carIds[0] || b.carId !== carIds[1]) return bad
  return { ok: true, results: [a, b] }
}

export function parseCompareError(body: unknown): { code: string; message: string } | null {
  if (!isRecord(body) || !isRecord(body.error)) return null
  const { code, message } = body.error
  if (typeof code !== 'string' || code.length === 0) return null
  return { code, message: typeof message === 'string' ? message : '' }
}

export async function compareCars(
  carIds: readonly [string, string],
  { baseUrl = COMPARE_BASE_URL, fetchImpl }: CompareOptions = {},
): Promise<CompareOutcome> {
  const doFetch = fetchImpl ?? fetch
  let res: Response
  try {
    res = await doFetch(`${baseUrl}/api/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carIds: [carIds[0], carIds[1]] }),
    })
  } catch {
    return { ok: false, code: NETWORK_ERROR, message: 'Network request failed' }
  }

  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    body = null
  }

  // A valid error envelope wins regardless of HTTP status.
  const err = parseCompareError(body)
  if (err) return { ok: false, ...err }
  if (!res.ok) return { ok: false, code: SERVER_ERROR, message: `HTTP ${res.status}` }
  return parseCompareSuccess(body, carIds)
}

// User-facing text chosen from error.code only.
export function mapCompareErrorToMessage(code: string): string {
  switch (code) {
    case 'CAR_NOT_FOUND':
      return 'Один из выбранных автомобилей не найден в каталоге. Измените выбор и повторите попытку.'
    case 'DUPLICATE_CAR_IDS':
    case 'WRONG_CAR_COUNT':
      return 'Для сравнения нужны два разных автомобиля. Проверьте выбор.'
    case NETWORK_ERROR:
      return 'Нет связи с сервисом расчёта. Проверьте подключение и повторите попытку.'
    default:
      return 'Не удалось получить расчёт импорта. Повторите попытку.'
  }
}
