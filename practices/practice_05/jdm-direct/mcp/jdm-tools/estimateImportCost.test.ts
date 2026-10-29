import { describe, expect, it } from 'vitest';
import { estimateImportCost } from './estimateImportCost';

describe('estimateImportCost', () => {
  it('carPriceJpy = 2500000 -> correct breakdown and total', () => {
    const res = estimateImportCost(2_500_000);
    expect(res.demo).toBe(true);
    expect(res.carPriceJpy).toBe(2_500_000);
    // 5% of 2,500,000 = 125,000 (>= 50k)
    expect(res.auctionFeeJpy).toBe(125_000);
    expect(res.shippingJpy).toBe(180_000);
    expect(res.totalJpy).toBe(2_500_000 + 125_000 + 180_000);
    expect(res.summary).toContain('Demo estimate');
  });

  it('carPriceJpy = 100000000 -> allowed input', () => {
    const res = estimateImportCost(100_000_000);
    expect(res.carPriceJpy).toBe(100_000_000);
    // 5% = 5,000,000
    expect(res.auctionFeeJpy).toBe(5_000_000);
    expect(res.totalJpy).toBe(100_000_000 + 5_000_000 + 180_000);
  });

  it('carPriceJpy = 0 -> error', () => {
    expect(() => estimateImportCost(0)).toThrowError(/> 0/);
  });

  it('carPriceJpy = -1 -> error', () => {
    expect(() => estimateImportCost(-1)).toThrowError(/> 0/);
  });

  it('carPriceJpy = 100000001 -> error', () => {
    expect(() => estimateImportCost(100_000_001)).toThrowError(/<= 100000000/);
  });
});
