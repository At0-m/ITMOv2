Backend service for JDM Compare Logic

Local run:

1. go run ./cmd/server
2. POST http://localhost:8081/api/compare with body:
   {"carIds":["r34","supra"]}

Dev CORS allows origin http://localhost:5173
