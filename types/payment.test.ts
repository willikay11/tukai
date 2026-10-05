import {
  HostPayout,
  PAYOUT_KIND_LABEL,
  PAYOUT_STATUS_LABEL,
  payoutAmount,
  payoutDestinationLabel,
} from './payment';

/**
 * Every money field on the payments endpoints is a decimal string, and a
 * missing one has to read as nothing rather than as NaN in the middle of a
 * balance.
 */
describe('payoutAmount', () => {
  it('reads a decimal string', () => {
    expect(payoutAmount('1500.50')).toBe(1500.5);
  });

  it('takes a number as it is', () => {
    expect(payoutAmount(2000)).toBe(2000);
  });

  it.each([[''], [null], [undefined], ['not money']])('reads %s as zero', (value) => {
    expect(payoutAmount(value as string)).toBe(0);
  });

  it('keeps a real zero', () => {
    expect(payoutAmount('0.00')).toBe(0);
  });
});

describe('the words for a payout', () => {
  // A host should not have to read "awaiting_settlement"
  it('says each status in plain words', () => {
    expect(PAYOUT_STATUS_LABEL.awaiting_settlement).toBe('Awaiting settlement');
    expect(PAYOUT_STATUS_LABEL.settled).toBe('Paid out');
    expect(PAYOUT_STATUS_LABEL.pending).toBe('Requested');
  });

  it('names each kind', () => {
    expect(PAYOUT_KIND_LABEL.split_advance).toBe('Advance');
    expect(PAYOUT_KIND_LABEL.withdrawal).toBe('Withdrawal');
  });

  it('says where the money went', () => {
    expect(payoutDestinationLabel('bank')).toBe('Bank account');
    expect(payoutDestinationLabel('mobile_money')).toBe('Mobile money');
  });

  it('covers every status the API can send', () => {
    const statuses: HostPayout['status'][] = [
      'pending',
      'processing',
      'awaiting_settlement',
      'settled',
      'failed',
      'reversed',
    ];

    statuses.forEach((status) => expect(PAYOUT_STATUS_LABEL[status]).toBeTruthy());
  });
});
