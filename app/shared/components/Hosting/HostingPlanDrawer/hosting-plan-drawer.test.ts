import {
  canSubmitPayment,
  formatCardNumber,
  formatExpiry,
  isValidCardDetails,
  isValidMpesaNumber,
} from './hosting-plan-drawer';

describe('isValidMpesaNumber', () => {
  it('accepts a number with 9 or more digits', () => {
    expect(isValidMpesaNumber('712345678')).toBe(true);
    expect(isValidMpesaNumber('0712345678')).toBe(true);
  });

  it('rejects anything shorter', () => {
    expect(isValidMpesaNumber('12345')).toBe(false);
    expect(isValidMpesaNumber('')).toBe(false);
  });
});

describe('formatCardNumber', () => {
  it('groups digits in fours and strips non-digits', () => {
    expect(formatCardNumber('4242 4242-4242/4242')).toBe('4242 4242 4242 4242');
  });

  it('caps at 19 digits', () => {
    expect(formatCardNumber('1'.repeat(30)).replace(/\s/g, '')).toHaveLength(19);
  });
});

describe('formatExpiry', () => {
  it('inserts the slash once two digits are typed', () => {
    expect(formatExpiry('1')).toBe('1');
    expect(formatExpiry('12')).toBe('12');
    expect(formatExpiry('1225')).toBe('12 / 25');
  });
});

describe('isValidCardDetails', () => {
  it('requires a 15+ digit number, MM / YY and a 3-4 digit code', () => {
    expect(isValidCardDetails('4242 4242 4242 4242', '12 / 25', '123')).toBe(true);
    expect(isValidCardDetails('4242', '12 / 25', '123')).toBe(false);
    expect(isValidCardDetails('4242 4242 4242 4242', '1225', '123')).toBe(false);
    expect(isValidCardDetails('4242 4242 4242 4242', '12 / 25', '12')).toBe(false);
  });
});

describe('canSubmitPayment', () => {
  it('checks the mpesa number only for the mpesa method', () => {
    expect(canSubmitPayment('mpesa', '712345678', '', '', '')).toBe(true);
    expect(canSubmitPayment('mpesa', '123', '', '', '')).toBe(false);
  });

  it('checks the card fields only for the card method', () => {
    expect(canSubmitPayment('card', '', '4242 4242 4242 4242', '12 / 25', '123')).toBe(true);
    expect(canSubmitPayment('card', '712345678', '', '', '')).toBe(false);
  });
});
