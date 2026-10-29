package domain

import "testing"

func TestAuctionFee_IntegerRoundHalfUp(t *testing.T) {
    // Boundary where 5% yields .5 fraction
    if got := AuctionFee(1000010); got != 50001 {
        t.Fatalf("fee=%d want 50001", got)
    }
    // Exact multiples of 20 (no fraction)
    if got := AuctionFee(5800000); got != 290000 { // r34
        t.Fatalf("fee=%d want 290000", got)
    }
    if got := AuctionFee(4200000); got != 210000 { // supra
        t.Fatalf("fee=%d want 210000", got)
    }
}

func TestEstimateTotals(t *testing.T) {
    r34 := Estimate(Car{ID: "r34", PurchasePriceJpy: 5800000})
    if r34.TotalImportJpy != 5800000+290000+ShippingFlatJpy {
        t.Fatalf("r34 total=%d", r34.TotalImportJpy)
    }
    supra := Estimate(Car{ID: "supra", PurchasePriceJpy: 4200000})
    if supra.TotalImportJpy != 4200000+210000+ShippingFlatJpy {
        t.Fatalf("supra total=%d", supra.TotalImportJpy)
    }
}
