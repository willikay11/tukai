import {
  aboutSchema,
  buildTicketDraftSchema,
  buildTicketsSchema,
  buildWalletSchema,
  dateTypeSchema,
  zodErrorsToMap,
} from './index';

const errorsFor = (schema: { safeParse: (v: unknown) => any }, value: unknown) => {
  const result = schema.safeParse(value);
  return result.success ? {} : zodErrorsToMap(result.error);
};

const dateType = (overrides: Record<string, unknown> = {}) => ({
  community: { id: 'c1', name: 'Hikers', imageUrl: '' },
  experiencePricing: 'paid',
  experienceType: 'one-time',
  isRecurring: false,
  date: '2026-09-01',
  startTime: '08:00',
  endTime: '17:00',
  recurringDays: [],
  recurrenceStartDate: null,
  recurrenceEndDate: null,
  timeSlots: [],
  multiDayStartDate: null,
  multiDayStartTime: null,
  multiDayEndDate: null,
  multiDayEndTime: null,
  itineraryStartDate: null,
  itineraryEndDate: null,
  ...overrides,
});

describe('dateTypeSchema', () => {
  it('accepts a complete single-day experience', () => {
    expect(errorsFor(dateTypeSchema, dateType())).toEqual({});
  });

  // A strict object schema would fail on shape and skip every rule below
  it('still reports business rules when a field is shaped loosely', () => {
    const errors = errorsFor(
      dateTypeSchema,
      dateType({ community: { id: 'c1', name: 'Hikers' }, endTime: null }),
    );

    expect(errors.endTime).toBe('End time is required');
  });

  it('requires a community', () => {
    expect(errorsFor(dateTypeSchema, dateType({ community: null })).community).toBe(
      'Community is required',
    );
  });

  it('rejects a single-day end time before its start', () => {
    const errors = errorsFor(dateTypeSchema, dateType({ startTime: '18:00', endTime: '09:00' }));
    expect(errors.endTime).toBe('End time must be after start time');
  });

  it('keys recurring slot errors as slots.<index>.<field>', () => {
    const errors = errorsFor(
      dateTypeSchema,
      dateType({
        isRecurring: true,
        recurringDays: ['mon'],
        recurrenceStartDate: '2026-09-01',
        recurrenceEndDate: '2026-09-30',
        timeSlots: [
          { startTime: '08:00', endTime: null },
          { startTime: '18:00', endTime: '09:00' },
        ],
      }),
    );

    expect(errors['slots.0.endTime']).toBe('End time is required');
    expect(errors['slots.1.endTime']).toBe('End time must be after start time');
  });

  it('allows a multi-day run to end earlier in the day than it started', () => {
    const errors = errorsFor(
      dateTypeSchema,
      dateType({
        experienceType: 'multi-day',
        multiDayStartDate: '2026-09-01',
        multiDayStartTime: '18:00',
        multiDayEndDate: '2026-09-03',
        multiDayEndTime: '09:00',
      }),
    );

    expect(errors).toEqual({});
  });

  it('rejects an out-of-order multi-day run on a single day', () => {
    const errors = errorsFor(
      dateTypeSchema,
      dateType({
        experienceType: 'multi-day',
        multiDayStartDate: '2026-09-01',
        multiDayStartTime: '18:00',
        multiDayEndDate: '2026-09-01',
        multiDayEndTime: '09:00',
      }),
    );

    expect(errors.multiDayEndTime).toBe('End time must be after start time');
  });
});

describe('aboutSchema', () => {
  const about = (overrides: Record<string, unknown> = {}) => ({
    photos: [{ id: 'p1', url: 'a.jpg' }],
    title: 'Ngong Hills',
    visibility: 'public',
    description: 'A trek',
    whatsIncluded: '',
    whatsNotIncluded: '',
    location: 'Nairobi',
    locationPlaceId: '',
    placeId: null,
    placeImageUrl: null,
    meetingPoint: '',
    meetingTime: null,
    categories: [],
    ...overrides,
  });

  it('accepts a filled About step', () => {
    expect(errorsFor(aboutSchema, about())).toEqual({});
  });

  it('treats whitespace as empty', () => {
    expect(errorsFor(aboutSchema, about({ title: '   ' })).title).toBe('Title is required');
  });

  it('requires at least one photo', () => {
    expect(errorsFor(aboutSchema, about({ photos: [] })).photos).toBe(
      'At least one photo is required',
    );
  });
});

describe('buildTicketsSchema', () => {
  const schema = (pricing: 'paid' | 'free' = 'paid', type: any = 'one-time') =>
    buildTicketsSchema({ experiencePricing: pricing, experienceType: type });

  const ticket = (overrides: Record<string, unknown> = {}) => ({
    id: 't1',
    name: 'Standard',
    quantity: 10,
    amount: 1500,
    ...overrides,
  });

  it('requires at least one ticket, and reports nothing else', () => {
    const errors = errorsFor(schema(), { commission: 'host', ticketMode: null, items: [] });

    expect(errors).toEqual({ items: 'At least one ticket is required' });
  });

  it('requires a ticket mode for multi-day before checking items', () => {
    const errors = errorsFor(schema('paid', 'multi-day'), {
      commission: 'host',
      ticketMode: null,
      items: [ticket({ name: '' })],
    });

    expect(errors).toEqual({ ticketMode: 'Please select how you want to create tickets' });
  });

  it('keys per-ticket errors as tickets.<index>.<field>', () => {
    const errors = errorsFor(schema(), {
      commission: 'host',
      ticketMode: null,
      items: [ticket({ name: '  ', quantity: 0, amount: null })],
    });

    expect(errors['tickets.0.name']).toBe('Ticket name is required');
    expect(errors['tickets.0.quantity']).toBe('Quantity must be greater than 0');
    expect(errors['tickets.0.amount']).toBe('Amount is required');
  });

  it('accepts a zero-cost ticket on a paid experience', () => {
    const errors = errorsFor(schema(), {
      commission: 'host',
      ticketMode: null,
      items: [ticket({ amount: 0 })],
    });

    expect(errors['tickets.0.amount']).toBeUndefined();
  });

  it('rejects a negative amount', () => {
    const errors = errorsFor(schema(), {
      commission: 'host',
      ticketMode: null,
      items: [ticket({ amount: -5 })],
    });

    expect(errors['tickets.0.amount']).toBe('Amount cannot be negative');
  });

  it('does not require an amount on a free experience', () => {
    const errors = errorsFor(schema('free'), {
      commission: 'host',
      ticketMode: null,
      items: [ticket({ amount: 0 })],
    });

    expect(errors['tickets.0.amount']).toBeUndefined();
  });
});

describe('buildWalletSchema', () => {
  const wallet = { paymentMethod: 'phone', phoneNumber: '' };

  it('requires a payment method when the account has none saved', () => {
    const errors = errorsFor(buildWalletSchema({ hasSavedWallets: false }), wallet);

    expect(errors.wallet).toBe('Please set up a payment method before continuing.');
  });

  it('passes when the account already has a saved wallet', () => {
    expect(errorsFor(buildWalletSchema({ hasSavedWallets: true }), wallet)).toEqual({});
  });

  it('passes when a phone number has been entered', () => {
    expect(
      errorsFor(buildWalletSchema({ hasSavedWallets: false }), {
        ...wallet,
        phoneNumber: '+254712345678',
      }),
    ).toEqual({});
  });
});

describe('buildTicketDraftSchema', () => {
  const draft = (overrides: Record<string, unknown> = {}) => ({
    name: 'Standard',
    quantity: 10,
    amount: 1500,
    ...overrides,
  });

  it('accepts a zero-cost ticket', () => {
    expect(errorsFor(buildTicketDraftSchema({ isPaid: true }), draft({ amount: 0 }))).toEqual({});
  });

  it('still requires an amount to be entered', () => {
    expect(
      errorsFor(buildTicketDraftSchema({ isPaid: true }), draft({ amount: null })).amount,
    ).toBe('Amount is required');
  });

  it('rejects a negative amount', () => {
    expect(errorsFor(buildTicketDraftSchema({ isPaid: true }), draft({ amount: -1 })).amount).toBe(
      'Amount cannot be negative',
    );
  });

  it('ignores the amount entirely on a free experience', () => {
    expect(
      errorsFor(buildTicketDraftSchema({ isPaid: false }), draft({ amount: null })).amount,
    ).toBeUndefined();
  });

  it('still requires a name and a positive quantity', () => {
    const errors = errorsFor(
      buildTicketDraftSchema({ isPaid: true }),
      draft({ name: '  ', quantity: 0 }),
    );

    expect(errors.name).toBe('Ticket name is required');
    expect(errors.quantity).toBe('Quantity must be greater than 0');
  });
});
