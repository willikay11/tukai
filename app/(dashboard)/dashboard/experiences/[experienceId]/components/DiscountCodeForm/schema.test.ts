import { currencyName, discountCodeSchema, valueCopy } from './schema';

const values = (
  overrides: Partial<{ code: string; discountType: string; value: string }> = {},
) => ({
  code: 'TRVL2026',
  discountType: 'fixed',
  value: '500',
  ...overrides,
});

const errorFor = (
  result: ReturnType<ReturnType<typeof discountCodeSchema>['safeParse']>,
  field: string,
) =>
  result.success
    ? undefined
    : result.error.issues.find((issue) => issue.path[0] === field)?.message;

/**
 * The canvas states these rules itself, and two of them are the only thing
 * standing between a host and a 400 from the API.
 */
describe('discountCodeSchema', () => {
  const schema = discountCodeSchema(['TRVL2024', 'EARLY10']);

  it('accepts a fixed amount', () => {
    expect(schema.safeParse(values()).success).toBe(true);
  });

  it('accepts a percentage up to 100', () => {
    expect(schema.safeParse(values({ discountType: 'percentage', value: '100' })).success).toBe(
      true,
    );
  });

  it('names the code that is already taken', () => {
    const result = schema.safeParse(values({ code: 'TRVL2024' }));

    expect(errorFor(result, 'code')).toBe('You already have a code called TRVL2024.');
  });

  // Editing a code must not read as a clash with itself
  it('lets the code being edited keep its own name', () => {
    const editing = discountCodeSchema(['TRVL2024', 'EARLY10'], 'TRVL2024');

    expect(editing.safeParse(values({ code: 'TRVL2024' })).success).toBe(true);
  });

  it('refuses a percentage over 100', () => {
    const result = schema.safeParse(values({ discountType: 'percentage', value: '150' }));

    expect(errorFor(result, 'value')).toBe('A percentage discount can’t be more than 100%.');
  });

  // An over-100 fixed amount is a legitimate discount
  it('allows a fixed amount over 100', () => {
    expect(schema.safeParse(values({ value: '2500' })).success).toBe(true);
  });

  it('refuses a discount of nothing', () => {
    expect(errorFor(schema.safeParse(values({ value: '0' })), 'value')).toBe(
      'Enter a value greater than zero',
    );
  });

  it('refuses a code shorter than three characters', () => {
    expect(errorFor(schema.safeParse(values({ code: 'AB' })), 'code')).toBe(
      'Use at least 3 characters',
    );
  });

  it('refuses a code longer than ten characters', () => {
    expect(errorFor(schema.safeParse(values({ code: 'ABCDEFGHIJK' })), 'code')).toBe(
      'Use no more than 10 characters',
    );
  });
});

describe('valueCopy', () => {
  it('asks for a percentage, and says what it comes off', () => {
    expect(valueCopy('percentage', 'Kenya shillings')).toMatchObject({
      label: 'Enter percentage to discount',
      note: 'Taken off the ticket price.',
    });
  });

  it('names the currency on a fixed amount', () => {
    expect(valueCopy('fixed', 'Kenya shillings').note).toBe(
      'In Kenya shillings, taken off each ticket.',
    );
  });
});

describe('currencyName', () => {
  // The app writes the currency several ways; only two currencies exist
  it.each([['KES'], ['Ksh.'], ['']])('reads %s as shillings', (currency) => {
    expect(currencyName(currency)).toBe('Kenya shillings');
  });

  it.each([['USD'], ['$']])('reads %s as dollars', (currency) => {
    expect(currencyName(currency)).toBe('US dollars');
  });
});
