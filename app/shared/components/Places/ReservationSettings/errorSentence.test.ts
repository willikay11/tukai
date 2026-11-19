import { reservationErrorSentence } from './errorSentence';
import { ReservationSettingsValues } from './schemas';

const BASE: ReservationSettingsValues = {
  reservationType: 'restaurant_reservation',
  paymentType: 'free',
  depositAmount: '',
  entryFees: [],
  seatingCapacity: '45',
  partySize: '15',
  days: ['Monday'],
  opensAt: '08:00',
  closesAt: '18:00',
  bufferMinutes: '',
  respondWithinHours: '2',
  payWithinHours: '3',
};

describe('reservationErrorSentence', () => {
  it('returns null once everything required is set', () => {
    expect(reservationErrorSentence(BASE)).toBeNull();
  });

  it('lists every missing item, in the handoff order, joined with "and"', () => {
    const values: ReservationSettingsValues = {
      ...BASE,
      seatingCapacity: '',
      partySize: '',
      days: [],
      opensAt: '08:00',
      closesAt: '08:00',
    };

    expect(reservationErrorSentence(values)).toBe(
      'Add your seating capacity, a max party size, at least one active day and opening and closing times.',
    );
  });

  it('flags a party size above capacity instead of a missing one', () => {
    const values: ReservationSettingsValues = { ...BASE, seatingCapacity: '10', partySize: '15' };
    expect(reservationErrorSentence(values)).toBe('Add a party size no bigger than your capacity.');
  });

  it('flags only the missing capacity, not an unenforceable party-size cap', () => {
    const values: ReservationSettingsValues = { ...BASE, seatingCapacity: '', partySize: '15' };
    expect(reservationErrorSentence(values)).toBe('Add your seating capacity.');
  });

  it('flags equal opening and closing times, but not an overnight window', () => {
    expect(reservationErrorSentence({ ...BASE, opensAt: '18:00', closesAt: '18:00' })).toBe(
      'Add opening and closing times.',
    );
    expect(reservationErrorSentence({ ...BASE, opensAt: '18:00', closesAt: '02:00' })).toBeNull();
  });

  it('joins exactly two items with "and", no comma', () => {
    const values: ReservationSettingsValues = { ...BASE, seatingCapacity: '', partySize: '' };
    expect(reservationErrorSentence(values)).toBe(
      'Add your seating capacity and a max party size.',
    );
  });

  it('asks for the deposit or the guest categories first, for a paid type', () => {
    expect(reservationErrorSentence({ ...BASE, paymentType: 'deposit', depositAmount: '0' })).toBe(
      'Add a deposit per guest.',
    );
    expect(
      reservationErrorSentence({ ...BASE, paymentType: 'entry_fee', seatingCapacity: '' }),
    ).toBe('Add at least one guest category with a price and your seating capacity.');
  });

  it('ignores a deposit left over once the type is free again', () => {
    expect(
      reservationErrorSentence({ ...BASE, paymentType: 'free', depositAmount: '' }),
    ).toBeNull();
  });
});
