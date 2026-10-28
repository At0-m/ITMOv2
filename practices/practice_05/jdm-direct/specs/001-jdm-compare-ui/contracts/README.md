# Contracts — TEAM UI ↔ Logic: JDM Compare

Authoritative contract is maintained in `docs/homework5/common-contract.md`.

Summary for UI reference:

- Endpoint: POST `/api/compare`
- Request body:
```json
{
  "carIds": ["r34", "supra"]
}
```
- Success response:
```json
{
  "results": [
    {"carId":"r34","purchasePriceJpy":5800000,"auctionFeeJpy":290000,"shippingJpy":180000,"totalImportJpy":6270000},
    {"carId":"supra","purchasePriceJpy":4200000,"auctionFeeJpy":210000,"shippingJpy":180000,"totalImportJpy":4590000}
  ]
}
```
- Error envelope:
```json
{"error":{"code":"...","message":"..."}}
```
- Error codes: MALFORMED_REQUEST, WRONG_CAR_COUNT, DUPLICATE_CAR_IDS, CAR_NOT_FOUND, INTERNAL_ERROR
- Notes: Request is atomic; output order matches input `carIds`.

Refer to the full contract for HTTP code mapping and rounding rules.
