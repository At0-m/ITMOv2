package server

import (
    "context"
    "jdm-direct/backend/internal/http"
    "log"
    "net/http"
    "time"
)

// Run starts an HTTP server with routes wired.
func Run() error {
    mux := http.NewServeMux()

    // Routes
    mux.HandleFunc("/api/compare", httpx.CompareHandler)

    srv := &http.Server{
        Addr:              ":8081",
        Handler:           mux,
        ReadHeaderTimeout: 5 * time.Second,
    }

    log.Printf("server listening on %s", srv.Addr)
    if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        return err
    }

    // graceful shutdown path for future extension
    _ = srv.Shutdown(context.Background())
    return nil
}
