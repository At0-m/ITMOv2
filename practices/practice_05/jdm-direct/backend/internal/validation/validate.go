package validation

import (
    "errors"
    "jdm-direct/backend/internal/catalog"
)

var (
    ErrMalformed     = errors.New("MALFORMED_REQUEST")
    ErrWrongCarCount = errors.New("WRONG_CAR_COUNT")
    ErrDuplicateIDs  = errors.New("DUPLICATE_CAR_IDS")
    ErrCarNotFound   = errors.New("CAR_NOT_FOUND")
)

// ValidateCarIDs applies first-error-only validation according to priority.
// Returns the first error and, for unknowns, the offending id.
func ValidateCarIDs(ids []string) (err error, unknownID string) {
    if len(ids) != 2 {
        return ErrWrongCarCount, ""
    }
    if ids[0] == ids[1] {
        return ErrDuplicateIDs, ""
    }
    demo := catalog.DemoCatalog()
    for _, id := range ids {
        if _, ok := demo[id]; !ok {
            return ErrCarNotFound, id
        }
    }
    return nil, ""
}
