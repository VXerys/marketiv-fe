import { describe, it, expect } from 'vitest';
import {
  calculatePlatformFee,
  calculateTotalPayment,
  calculateCreatorPayout,
  MINIMUM_WITHDRAW,
  MINIMUM_CAMPAIGN_BUDGET,
  PLATFORM_FEE_RATE,
  WITHDRAW_PAYOUT_METHODS,
} from '../../src/services/wallet.service';

describe('wallet.service — pure helpers', () => {
  it('PLATFORM_FEE_RATE is 0.05', () => {
    expect(PLATFORM_FEE_RATE).toBe(0.05);
  });

  it('MINIMUM_WITHDRAW is 50000', () => {
    expect(MINIMUM_WITHDRAW).toBe(50000);
  });

  it('MINIMUM_CAMPAIGN_BUDGET is 50000', () => {
    expect(MINIMUM_CAMPAIGN_BUDGET).toBe(50000);
  });

  it('WITHDRAW_PAYOUT_METHODS includes bank & ewallet', () => {
    expect(WITHDRAW_PAYOUT_METHODS).toEqual(['bank', 'ewallet']);
  });

  it('calculatePlatformFee floors 5% of nominal', () => {
    expect(calculatePlatformFee(100000)).toBe(5000);
    expect(calculatePlatformFee(50000)).toBe(2500);
    expect(calculatePlatformFee(99999)).toBe(4999);
  });

  it('calculateTotalPayment adds fee to nominal', () => {
    expect(calculateTotalPayment(100000)).toBe(105000);
    expect(calculateTotalPayment(50000)).toBe(52500);
  });

  it('calculateCreatorPayout subtracts fee from nominal', () => {
    expect(calculateCreatorPayout(100000)).toBe(95000);
    expect(calculateCreatorPayout(50000)).toBe(47500);
  });
});
