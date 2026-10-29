package domain

const ShippingFlatJpy = 180000

// AuctionFee computes 5% fee using integer arithmetic with round-half-up.
// For positive integers: round(5% * price) = (price*5 + 50) / 100
func AuctionFee(purchasePriceJpy int) int {
    return (purchasePriceJpy*5 + 50) / 100
}

// Estimate computes ImportEstimate for given car.
func Estimate(c Car) ImportEstimate {
    fee := AuctionFee(c.PurchasePriceJpy)
    total := c.PurchasePriceJpy + fee + ShippingFlatJpy
    return ImportEstimate{
        CarID:            c.ID,
        PurchasePriceJpy: c.PurchasePriceJpy,
        AuctionFeeJpy:    fee,
        ShippingJpy:      ShippingFlatJpy,
        TotalImportJpy:   total,
    }
}
