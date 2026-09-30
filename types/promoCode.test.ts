import { PromoCode, normalisePromoCode, promoCodeValueLabel } from './promoCode';

const code = (overrides: Partial<PromoCode> = {}): PromoCode =>
  ({
    id: 'p1',
    code: 'EARLY10',
    kind: 'promotion',
    discountType: 'percentage',
    discountPercentage: '10.00',
    isActive: true,
    redeemedCount: 0,
    ...overrides,
  }) as PromoCode;

/**
 * The canvas's own rules: uppercase letters and digits, at most ten
 * characters. Typed lowercase, with spaces or punctuation, it still has to
 * come out as a code the API will take.
 */
describe('normalisePromoCode', () => {
  it('uppercases what was typed', () => {
    expect(normalisePromoCode('early10')).toBe('EARLY10');
  });

  it('drops anything that is not a letter or a digit', () => {
    expect(normalisePromoCode('early-10 %')).toBe('EARLY10');
  });

  it('stops at ten characters', () => {
    expect(normalisePromoCode('ABCDEFGHIJKLMNOP')).toBe('ABCDEFGHIJ');
  });

  it('copes with an empty field', () => {
    expect(normalisePromoCode('')).toBe('');
  });
});

describe('promoCodeValueLabel', () => {
  it('reads a percentage as a whole number when it is one', () => {
    expect(promoCodeValueLabel(code({ discountPercentage: '10.00' }))).toBe('10% off');
  });

  it('keeps a fraction when there is one', () => {
    expect(promoCodeValueLabel(code({ discountPercentage: '12.50' }))).toBe('12.5% off');
  });

  // Decimals arrive from the API as strings
  it('reads a flat amount in the experience currency', () => {
    expect(
      promoCodeValueLabel(
        code({ discountType: 'fixed', discountAmount: '500', discountPercentage: null }),
      ),
    ).toBe('KES 500 off');
  });

  it('groups a large amount', () => {
    expect(
      promoCodeValueLabel(code({ discountType: 'fixed', discountAmount: '15000' }), 'KES'),
    ).toBe('KES 15,000 off');
  });
});
