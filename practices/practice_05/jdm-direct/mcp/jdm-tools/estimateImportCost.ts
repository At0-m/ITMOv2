// Pure calculation function for demo import cost estimation.
// Kept separate from MCP transport for unit testing and reuse.

export interface ImportCostBreakdown {
  carPriceJpy: number;
  auctionFeeJpy: number;
  shippingJpy: number;
  totalJpy: number;
  summary: string; // human-readable short representation
  demo: true; // explicit marker that this is a demo calculation
}

// Validates input and performs deterministic demo calculation.
export function estimateImportCost(carPriceJpy: number): ImportCostBreakdown {
  // Input validation according to project rules
  if (!Number.isFinite(carPriceJpy)) {
    throw new Error('carPriceJpy must be a finite number');
  }
  if (carPriceJpy <= 0) {
    throw new Error('carPriceJpy must be > 0');
  }
  if (carPriceJpy > 100_000_000) {
    throw new Error('carPriceJpy must be <= 100000000');
  }

  const auctionFeeJpy = Math.max(Math.round(carPriceJpy * 0.05), 50_000);
  const shippingJpy = 180_000;
  const totalJpy = carPriceJpy + auctionFeeJpy + shippingJpy;

  const summary =
    `Demo estimate: car ${carPriceJpy} JPY + auction ${auctionFeeJpy} JPY + ` +
    `shipping ${shippingJpy} JPY = total ${totalJpy} JPY.`;

  return {
    carPriceJpy,
    auctionFeeJpy,
    shippingJpy,
    totalJpy,
    summary,
    demo: true,
  };
}
