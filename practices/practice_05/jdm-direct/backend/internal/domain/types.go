package domain

// Car represents a catalog car used for comparison.
type Car struct {
    ID               string
    PurchasePriceJpy int
    Drivetrain       string
    Engine           string
}

// CompareRequest is the request payload for POST /api/compare.
type CompareRequest struct {
    CarIDs []string `json:"carIds"`
}

// ImportEstimate is a computed estimate per car.
type ImportEstimate struct {
    CarID            string `json:"carId"`
    PurchasePriceJpy int    `json:"purchasePriceJpy"`
    AuctionFeeJpy    int    `json:"auctionFeeJpy"`
    ShippingJpy      int    `json:"shippingJpy"`
    TotalImportJpy   int    `json:"totalImportJpy"`
}

// SuccessEnvelope wraps successful compare results.
type SuccessEnvelope struct {
    Results []ImportEstimate `json:"results"`
}

// ErrorEnvelope wraps an error with machine-readable code.
type ErrorEnvelope struct {
    Error struct {
        Code    string `json:"code"`
        Message string `json:"message"`
    } `json:"error"`
}
