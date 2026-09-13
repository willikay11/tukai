import { moneyAmount } from './money';

describe('moneyAmount', () => {
  // What the API actually sends for a promo discount, a buyer price, a total
  it('reads the number out of a money object', () => {
    expect(moneyAmount({ amount: '20.00', currency: 'KES' })).toBe(20);
  });

  it('takes the bare string or number the same field is sometimes sent as', () => {
    expect(moneyAmount('1500.00')).toBe(1500);
    expect(moneyAmount(1500)).toBe(1500);
  });

  // Nothing is not zero — the caller decides what an absent amount means
  it('answers null for nothing at all', () => {
    expect(moneyAmount(null)).toBeNull();
    expect(moneyAmount(undefined)).toBeNull();
    expect(moneyAmount('')).toBeNull();
    expect(moneyAmount({ amount: null })).toBeNull();
  });

  it('answers null for something that is not a number', () => {
    expect(moneyAmount('free')).toBeNull();
  });

  it('keeps a real zero', () => {
    expect(moneyAmount({ amount: '0.00', currency: 'KES' })).toBe(0);
  });
});
