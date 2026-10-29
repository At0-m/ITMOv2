package errcodes

import "net/http"

const (
    MalformedRequest = "MALFORMED_REQUEST"
    WrongCarCount    = "WRONG_CAR_COUNT"
    DuplicateCarIDs  = "DUPLICATE_CAR_IDS"
    CarNotFound      = "CAR_NOT_FOUND"
    InternalError    = "INTERNAL_ERROR"
)

// HTTPStatus maps error codes to HTTP status codes.
func HTTPStatus(code string) int {
    switch code {
    case MalformedRequest, WrongCarCount, DuplicateCarIDs:
        return http.StatusBadRequest
    case CarNotFound:
        return http.StatusNotFound
    default:
        return http.StatusInternalServerError
    }
}
