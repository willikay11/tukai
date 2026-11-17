import { currencyFullName, formatCurrencyAmount, moneyAmount } from './money';

describe('formatCurrencyAmount', () => {
  // Every balance on the earnings summary arrives like this. Reading it as a
  // string printed KES 0.00 for every host.
  it('formats a money object with its own currency', () => {
    expect(formatCurrencyAmount({ amount: '389856.00', currency: 'KES' })).toBe('KES 389,856.00');
    expect(formatCurrencyAmount({ amount: '12.5', currency: 'USD' })).toBe('USD 12.50');
  });

  it('lets a passed currency win over the object one', () => {
    expect(formatCurrencyAmount({ amount: '10', currency: 'KES' }, 'USD')).toBe('USD 10.00');
  });

  it('still takes a bare decimal string or number', () => {
    expect(formatCurrencyAmount('34839.8')).toBe('KES 34,839.80');
    expect(formatCurrencyAmount(1500, 'USD')).toBe('USD 1,500.00');
  });

  it('reads nothing and nonsense as zero', () => {
    expect(formatCurrencyAmount(null)).toBe('KES 0.00');
    expect(formatCurrencyAmount(undefined)).toBe('KES 0.00');
    expect(formatCurrencyAmount('free')).toBe('KES 0.00');
  });
});

describe('moneyAmount', () => {
  // What the API actually sends for a promo discount, a buyer price, a total
  it('reads the number out of a money object', () => {
    expect(moneyAmount({ amount: '20.00', currency: 'KES' })).toBe(20);
  });

  it('takes the bare string or number the same field is sometimes sent as', () => {
    expect(moneyAmount('1500.00')).toBe(1500);
    expect(moneyAmount(1500)).toBe(1500);
  });

  // Nothing is not zero - the caller decides what an absent amount means
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

describe('currencyFullName', () => {
  // The app writes the currency four ways depending on where it came from
  it.each([['KES'], ['Ksh.'], ['kes'], ['']])('reads %s as shillings', (currency) => {
    expect(currencyFullName(currency)).toBe('Kenya shillings');
  });

  it.each([['USD'], ['$'], ['usd']])('reads %s as dollars', (currency) => {
    expect(currencyFullName(currency)).toBe('US dollars');
  });
});
