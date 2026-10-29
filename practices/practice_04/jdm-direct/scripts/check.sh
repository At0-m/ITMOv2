#!/bin/sh

# Fail fast on first error
set -e

echo "[check] Running tests..."
npm run test

echo "[check] Building..."
npm run build

echo "[check] Done."
