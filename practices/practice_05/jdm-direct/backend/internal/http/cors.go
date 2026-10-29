package httpx

import "net/http"

const allowedOrigin = "http://localhost:5173"

// applyDevCORS sets minimal headers for local development.
func applyDevCORS(w http.ResponseWriter) {
    w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
    w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
