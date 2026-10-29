package httpx

import (
    "encoding/json"
    "jdm-direct/backend/internal/catalog"
    "jdm-direct/backend/internal/domain"
    "jdm-direct/backend/internal/errcodes"
    "jdm-direct/backend/internal/validation"
    "net/http"
)

// CompareHandler handles POST /api/compare and OPTIONS preflight.
func CompareHandler(w http.ResponseWriter, r *http.Request) {
    // CORS for local dev
    applyDevCORS(w)
    if r.Method == http.MethodOptions {
        w.WriteHeader(http.StatusNoContent)
        return
    }
    if r.Method != http.MethodPost {
        http.NotFound(w, r)
        return
    }

    dec := json.NewDecoder(r.Body)
    // Elements are kept raw so null and non-string JSON types can be told apart from string ids.
    var raw struct {
        CarIDs []json.RawMessage `json:"carIds"`
    }
    if err := dec.Decode(&raw); err != nil {
        writeError(w, errcodes.MalformedRequest, "Malformed request payload")
        return
    }

    // Missing or null carIds decodes to a nil slice; an explicit [] is non-nil.
    if raw.CarIDs == nil {
        writeError(w, errcodes.MalformedRequest, "Malformed request payload: carIds is required")
        return
    }

    var req domain.CompareRequest
    req.CarIDs = make([]string, 0, len(raw.CarIDs))
    for _, el := range raw.CarIDs {
        var id string
        if len(el) == 0 || el[0] != '"' || json.Unmarshal(el, &id) != nil {
            writeError(w, errcodes.MalformedRequest, "Malformed request payload: carIds must contain only strings")
            return
        }
        req.CarIDs = append(req.CarIDs, id)
    }

    if err, unknown := validation.ValidateCarIDs(req.CarIDs); err != nil {
        switch err {
        case validation.ErrWrongCarCount:
            writeError(w, errcodes.WrongCarCount, "Request must contain exactly two distinct carIds")
        case validation.ErrDuplicateIDs:
            writeError(w, errcodes.DuplicateCarIDs, "Duplicate carIds are not allowed")
        case validation.ErrCarNotFound:
            writeError(w, errcodes.CarNotFound, "Unknown carId: "+unknown)
        default:
            writeError(w, errcodes.InternalError, "Internal error")
        }
        return
    }

    // valid: compute in input order
    demo := catalog.DemoCatalog()
    results := make([]domain.ImportEstimate, 0, 2)
    for _, id := range req.CarIDs {
        car := demo[id]
        est := domain.Estimate(car)
        results = append(results, est)
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    _ = json.NewEncoder(w).Encode(domain.SuccessEnvelope{Results: results})
}

func writeError(w http.ResponseWriter, code, message string) {
    status := errcodes.HTTPStatus(code)
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    var env domain.ErrorEnvelope
    env.Error.Code = code
    env.Error.Message = message
    _ = json.NewEncoder(w).Encode(env)
}
