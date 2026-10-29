package validation

import "testing"

func TestValidateCarIDs_Count(t *testing.T) {
    if err, _ := ValidateCarIDs([]string{}); err != ErrWrongCarCount { t.Fatalf("want wrong count") }
    if err, _ := ValidateCarIDs([]string{"a"}); err != ErrWrongCarCount { t.Fatalf("want wrong count") }
    if err, _ := ValidateCarIDs([]string{"a","b","c"}); err != ErrWrongCarCount { t.Fatalf("want wrong count") }
}

func TestValidateCarIDs_Duplicate(t *testing.T) {
    if err, _ := ValidateCarIDs([]string{"r34","r34"}); err != ErrDuplicateIDs { t.Fatalf("want duplicate") }
}

func TestValidateCarIDs_Unknown(t *testing.T) {
    if err, unk := ValidateCarIDs([]string{"r34","unknown"}); err != ErrCarNotFound || unk != "unknown" { t.Fatalf("want unknown id with context") }
}

func TestValidateCarIDs_Ok(t *testing.T) {
    if err, _ := ValidateCarIDs([]string{"r34","supra"}); err != nil { t.Fatalf("want ok") }
}
