import React from 'react';

import { render, screen } from '@testing-library/react';

import { PromoCode } from '@/types/promoCode';

import { DiscountCodeRedemptions, redemptionRows } from './index';

const promo = (overrides: Partial<PromoCode> = {}): PromoCode =>
  ({
    id: 'p1',
    code: 'TRVL2024',
    kind: 'promotion',
    experience: 'e1',
    discountType: 'fixed',
    discountAmount: '500',
    isActive: true,
    redeemedCount: 32,
    ...overrides,
  }) as PromoCode;

const rowFor = (code: PromoCode, label: string) =>
  redemptionRows(code, 'KES').find((row) => row.label === label);

/**
 * The limits are the API's, not the canvas form's — a code made on mobile or by
 * an admin can carry any of them, and each only appears when it is set.
 */
describe('redemptionRows', () => {
  it('always states the count, the discount and whether it is live', () => {
    const labels = redemptionRows(promo(), 'KES').map((row) => row.label);

    expect(labels).toEqual(expect.arrayContaining(['Redeemed', 'Discount', 'Status']));
    expect(rowFor(promo(), 'Redeemed')?.value).toBe('32 times');
    expect(rowFor(promo(), 'Discount')?.value).toBe('KES 500 off');
  });

  it('counts a single use in the singular', () => {
    expect(rowFor(promo({ redeemedCount: 1 }), 'Redeemed')?.value).toBe('1 time');
  });

  it('calls a paused code paused', () => {
    expect(rowFor(promo({ isActive: false }), 'Status')?.value).toBe('Paused');
  });

  it('says there is no limit when the code has no cap', () => {
    expect(rowFor(promo(), 'Redemption limit')?.value).toBe('No limit');
  });

  it('counts the uses left against the cap', () => {
    const row = rowFor(promo({ maxRedemptions: 50 }), 'Uses left');

    expect(row?.value).toBe('18');
    expect(row?.hint).toBe('Of the 50 this code allows.');
  });

  // A cap that has been passed is none left, not a negative
  it('never counts below zero', () => {
    expect(rowFor(promo({ maxRedemptions: 10, redeemedCount: 32 }), 'Uses left')?.value).toBe('0');
  });

  it('leaves out the limits that are not set', () => {
    const labels = redemptionRows(promo(), 'KES').map((row) => row.label);

    expect(labels).not.toContain('Per person');
    expect(labels).not.toContain('Minimum tickets');
    expect(labels).not.toContain('Minimum order');
  });

  it('shows each limit that is set', () => {
    const code = promo({ maxRedemptionsPerUser: 1, minTickets: 2, minOrderAmount: '2500' });

    expect(rowFor(code, 'Per person')?.value).toBe('1 use');
    expect(rowFor(code, 'Minimum tickets')?.value).toBe('2 tickets');
    expect(rowFor(code, 'Minimum order')?.value).toBe('KES 2,500');
  });

  it('ignores a minimum order of nothing', () => {
    expect(rowFor(promo({ minOrderAmount: '0.00' }), 'Minimum order')).toBeUndefined();
  });

  it('reads an open-ended window as such', () => {
    expect(rowFor(promo({ startsAt: '2026-07-01T00:00:00Z' }), 'Can be used')?.value).toBe(
      '1 Jul 2026 — no end date',
    );
  });
});

describe('the redemptions panel', () => {
  it('names the code and its figures', () => {
    render(<DiscountCodeRedemptions code={promo()} currency="KES" onClose={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'TRVL2024' })).toBeInTheDocument();
    expect(screen.getByText('32 times')).toBeInTheDocument();
  });

  it('says plainly when a code has never been used', () => {
    render(
      <DiscountCodeRedemptions
        code={promo({ redeemedCount: 0 })}
        currency="KES"
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText('No one has used this code yet.')).toBeInTheDocument();
  });

  // The API's own redemptions endpoint declares the wrong response schema, so
  // the per-purchase list is not built — and the panel says so
  it('admits that who used it is not available', () => {
    render(<DiscountCodeRedemptions code={promo()} currency="KES" onClose={jest.fn()} />);

    expect(
      screen.getByText('Who used this code, and when, is not available yet.'),
    ).toBeInTheDocument();
  });

  it('renders nothing when no code is open', () => {
    render(<DiscountCodeRedemptions code={null} currency="KES" onClose={jest.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
