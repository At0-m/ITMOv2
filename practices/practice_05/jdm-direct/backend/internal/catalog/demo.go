package catalog

import "jdm-direct/backend/internal/domain"

// DemoCatalog returns a fixed set of cars used by the demo.
func DemoCatalog() map[string]domain.Car {
    return map[string]domain.Car{
        "r34": {
            ID:               "r34",
            PurchasePriceJpy: 5800000,
            Drivetrain:       "AWD",
            Engine:           "RB26DETT",
        },
        "supra": {
            ID:               "supra",
            PurchasePriceJpy: 4200000,
            Drivetrain:       "RWD",
            Engine:           "2JZ-GTE",
        },
        "rx7": {
            ID:               "rx7",
            PurchasePriceJpy: 3100000,
            Drivetrain:       "RWD",
            Engine:           "13B-REW",
        },
    }
}
