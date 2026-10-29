package main

import (
    "log"
    "jdm-direct/backend/internal/server"
)

func main() {
    if err := server.Run(); err != nil {
        log.Fatal(err)
    }
}
