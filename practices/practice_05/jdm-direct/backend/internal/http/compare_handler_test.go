package httpx

import (
    "bytes"
    "encoding/json"
    "jdm-direct/backend/internal/errcodes"
    "net/http"
    "net/http/httptest"
    "testing"
)

func perform(reqBody any) *httptest.ResponseRecorder {
    b, _ := json.Marshal(reqBody)
    req := httptest.NewRequest(http.MethodPost, "/api/compare", bytes.NewReader(b))
    w := httptest.NewRecorder()
    CompareHandler(w, req)
    return w
}

func TestCompareHandler_HappyPath(t *testing.T) {
    w := perform(map[string]any{"carIds": []string{"r34","supra"}})
    if w.Code != http.StatusOK { t.Fatalf("status=%d", w.Code) }
    var body struct{ Results []struct{
        CarID string `json:"carId"`
        PurchasePriceJpy int `json:"purchasePriceJpy"`
        AuctionFeeJpy int `json:"auctionFeeJpy"`
        ShippingJpy int `json:"shippingJpy"`
        TotalImportJpy int `json:"totalImportJpy"`
    } `json:"results"`}
    if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil { t.Fatal(err) }
    if len(body.Results) != 2 { t.Fatalf("want two results") }
    if body.Results[0].CarID != "r34" || body.Results[1].CarID != "supra" { t.Fatalf("order not preserved: %+v", body.Results) }
    if body.Results[0].TotalImportJpy != 5800000+290000+180000 { t.Fatalf("r34 total wrong: %+v", body.Results[0]) }
    if body.Results[1].TotalImportJpy != 4200000+210000+180000 { t.Fatalf("supra total wrong: %+v", body.Results[1]) }
    // Determinism: second identical request yields identical body
    w2 := perform(map[string]any{"carIds": []string{"r34","supra"}})
    if string(w.Body.Bytes()) != string(w2.Body.Bytes()) { t.Fatalf("responses differ") }
}

func TestCompareHandler_Errors(t *testing.T) {
    // malformed
    req := httptest.NewRequest(http.MethodPost, "/api/compare", bytes.NewReader([]byte("{")))
    w := httptest.NewRecorder()
    CompareHandler(w, req)
    if w.Code != errcodes.HTTPStatus(errcodes.MalformedRequest) { t.Fatalf("malformed status=%d", w.Code) }
    var e struct{ Error struct{ Code string `json:"code"` } `json:"error"` }
    _ = json.Unmarshal(w.Body.Bytes(), &e)
    if e.Error.Code != errcodes.MalformedRequest { t.Fatalf("want code %s got %s", errcodes.MalformedRequest, e.Error.Code) }

    // wrong count
    w = perform(map[string]any{"carIds": []string{"r34"}})
    if w.Code != errcodes.HTTPStatus(errcodes.WrongCarCount) { t.Fatalf("wrong count status=%d", w.Code) }
    _ = json.Unmarshal(w.Body.Bytes(), &e)
    if e.Error.Code != errcodes.WrongCarCount { t.Fatalf("wrong count code=%s", e.Error.Code) }

    // duplicate
    w = perform(map[string]any{"carIds": []string{"r34","r34"}})
    if w.Code != errcodes.HTTPStatus(errcodes.DuplicateCarIDs) { t.Fatalf("dup status=%d", w.Code) }
    _ = json.Unmarshal(w.Body.Bytes(), &e)
    if e.Error.Code != errcodes.DuplicateCarIDs { t.Fatalf("dup code=%s", e.Error.Code) }

    // unknown
    w = perform(map[string]any{"carIds": []string{"r34","zzz"}})
    if w.Code != errcodes.HTTPStatus(errcodes.CarNotFound) { t.Fatalf("unknown status=%d", w.Code) }
    _ = json.Unmarshal(w.Body.Bytes(), &e)
    if e.Error.Code != errcodes.CarNotFound { t.Fatalf("unknown code=%s", e.Error.Code) }
}

func TestCompareHandler_MissingOrNullCarIDsIsMalformed(t *testing.T) {
    cases := []struct {
        name     string
        body     string
        wantCode string
    }{
        {"missing carIds", `{}`, errcodes.MalformedRequest},
        {"null carIds", `{"carIds":null}`, errcodes.MalformedRequest},
        {"empty carIds", `{"carIds":[]}`, errcodes.WrongCarCount},
    }
    for _, tc := range cases {
        t.Run(tc.name, func(t *testing.T) {
            req := httptest.NewRequest(http.MethodPost, "/api/compare", bytes.NewReader([]byte(tc.body)))
            w := httptest.NewRecorder()
            CompareHandler(w, req)
            if w.Code != http.StatusBadRequest { t.Fatalf("status=%d want 400", w.Code) }
            var e struct{ Error struct{ Code string `json:"code"` } `json:"error"` }
            if err := json.Unmarshal(w.Body.Bytes(), &e); err != nil { t.Fatal(err) }
            if e.Error.Code != tc.wantCode { t.Fatalf("code=%s want %s", e.Error.Code, tc.wantCode) }
        })
    }
}

func TestCORSHeaders(t *testing.T) {
    // OPTIONS preflight
    req := httptest.NewRequest(http.MethodOptions, "/api/compare", nil)
    w := httptest.NewRecorder()
    CompareHandler(w, req)
    if w.Code != http.StatusNoContent { t.Fatalf("options status=%d", w.Code) }
    if w.Header().Get("Access-Control-Allow-Origin") == "" { t.Fatalf("missing CORS header") }
    // POST also sets CORS headers
    w = perform(map[string]any{"carIds": []string{"r34","supra"}})
    if w.Header().Get("Access-Control-Allow-Origin") == "" { t.Fatalf("missing CORS on POST") }
}
