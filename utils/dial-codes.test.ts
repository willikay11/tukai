import { DIAL_COUNTRIES, countryOfNumber, dialCountry, toE164 } from './dial-codes';

describe('dial codes (DEV-508)', () => {
  it('lists every country A to Z with its flag and code', () => {
    expect(DIAL_COUNTRIES.length).toBeGreaterThan(200);
    expect(dialCountry('GB')).toMatchObject({ name: 'United Kingdom', dialCode: '44', flag: '🇬🇧' });
    expect(dialCountry('KE')).toMatchObject({ name: 'Kenya', dialCode: '254' });
    const names = DIAL_COUNTRIES.map((country) => country.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('writes a number in E.164 for its country, without the leading 0', () => {
    expect(toE164('GB', '07700 900123')).toBe('+447700900123');
    expect(toE164('US', '(212) 555-0100')).toBe('+12125550100');
    expect(toE164('UG', '0772 123456')).toBe('+256772123456');
  });

  it('keeps a number typed with its own +', () => {
    expect(toE164('KE', '+44 7700 900123')).toBe('+447700900123');
  });

  it('drops a Kenyan code typed again, as the field always did', () => {
    expect(toE164('KE', '254712345678')).toBe('+254712345678');
    expect(toE164('KE', '0712 345 678')).toBe('+254712345678');
  });

  // In Brazil, area code 55 is also the country code: left alone
  it('does not guess at a code typed again elsewhere', () => {
    expect(toE164('BR', '55 91234 5678')).toBe('+5555912345678');
  });

  it('is empty with no number', () => {
    expect(toE164('GB', '')).toBe('');
  });

  it('reads the country back off a stored number, longest code first', () => {
    expect(countryOfNumber('+254712345678')?.iso).toBe('KE');
    expect(countryOfNumber('+18685551234')?.dialCode).toBe('1');
    expect(countryOfNumber('+447700900123', 'GB')?.iso).toBe('GB');
  });
});
