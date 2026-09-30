import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PromoCode } from '@/types/promoCode';

import { DiscountCodesSection, codesForExperience, redeemedLabel } from './index';

const updateCode = jest.fn();
let codes: PromoCode[] = [];
let isLoading = false;

jest.mock('@/app/shared/hooks/usePromoCodes', () => ({
  useMyPromoCodes: () => ({ data: { data: { results: codes } }, isLoading }),
  useUpdatePromoCode: () => ({ mutate: updateCode, isPending: false, variables: undefined }),
  useCreatePromoCode: () => ({ mutate: jest.fn(), isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

jest.mock('../DiscountCodeForm', () => ({ DiscountCodeForm: () => null }));

// Both open over the list; here it only matters which code they were handed
jest.mock('../DiscountCodeRedemptions', () => ({
  DiscountCodeRedemptions: ({ code }: { code: { code: string } | null }) =>
    code ? <div>redemptions for {code.code}</div> : null,
}));

jest.mock('../DeleteDiscountCodeDialog', () => ({
  DeleteDiscountCodeDialog: ({ code }: { code: { code: string } | null }) =>
    code ? <div>delete {code.code}?</div> : null,
}));

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

const renderSection = () => render(<DiscountCodesSection experienceId="e1" currency="KES" />);

/**
 * `mine/` returns every code the host owns and takes no experience filter, so
 * a host with codes on three experiences would otherwise see all of them here.
 */
describe('codesForExperience', () => {
  it('keeps only the codes on this experience', () => {
    const mine = [promo(), promo({ id: 'p2', code: 'OTHER', experience: 'e2' })];

    expect(codesForExperience(mine, 'e1').map((code) => code.code)).toEqual(['TRVL2024']);
  });

  it('drops a code with no experience of its own', () => {
    expect(codesForExperience([promo({ experience: null })], 'e1')).toHaveLength(0);
  });
});

describe('redeemedLabel', () => {
  it('counts one use in the singular', () => {
    expect(redeemedLabel(1)).toBe('1 time');
  });

  it.each([
    [0, '0 times'],
    [32, '32 times'],
  ])('counts %i in the plural', (count, expected) => {
    expect(redeemedLabel(count)).toBe(expected);
  });
});

describe('the discount codes list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    codes = [promo()];
    isLoading = false;
  });

  it('shows a code with its type, amount and redemptions', () => {
    renderSection();

    expect(screen.getByRole('heading', { name: 'TRVL2024' })).toBeInTheDocument();
    expect(screen.getByText('Fixed amount')).toBeInTheDocument();
    expect(screen.getByText('KES 500')).toBeInTheDocument();
    expect(screen.getByText('32 times')).toBeInTheDocument();
  });

  it('shows a percentage as a percentage', () => {
    codes = [
      promo({ discountType: 'percentage', discountPercentage: '15.00', discountAmount: null }),
    ];
    renderSection();

    expect(screen.getByText('Percentage')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('offers to pause a live code', () => {
    renderSection();

    expect(screen.getByRole('button', { name: /Pause code/ })).toBeInTheDocument();
    expect(screen.queryByText('Paused')).not.toBeInTheDocument();
  });

  it('marks a paused code and offers to resume it', () => {
    codes = [promo({ isActive: false })];
    renderSection();

    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Resume code/ })).toBeInTheDocument();
  });

  // Pausing is `is_active` on the API; the canvas calls it pause and resume
  it('pauses through the active flag', async () => {
    renderSection();

    await userEvent.click(screen.getByRole('button', { name: /Pause code/ }));

    expect(updateCode).toHaveBeenCalledWith(
      { id: 'p1', payload: { isActive: false } },
      expect.anything(),
    );
  });

  it('resumes through the same flag', async () => {
    codes = [promo({ isActive: false })];
    renderSection();

    await userEvent.click(screen.getByRole('button', { name: /Resume code/ }));

    expect(updateCode).toHaveBeenCalledWith(
      { id: 'p1', payload: { isActive: true } },
      expect.anything(),
    );
  });

  it('says so when there are no codes yet', () => {
    codes = [];
    renderSection();

    expect(screen.getByText('No discount codes yet for this experience.')).toBeInTheDocument();
  });

  it('does not claim there are none while it is still loading', () => {
    codes = [];
    isLoading = true;
    renderSection();

    expect(
      screen.queryByText('No discount codes yet for this experience.'),
    ).not.toBeInTheDocument();
  });

  it('will not share a paused code', async () => {
    codes = [promo({ isActive: false })];
    renderSection();

    await userEvent.click(screen.getByRole('button', { name: 'Share TRVL2024' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'TRVL2024 is paused', variant: 'destructive' }),
    );
  });

  it('opens the redemptions for the code that was asked about', async () => {
    renderSection();

    await userEvent.click(screen.getByRole('button', { name: /Redemptions/ }));

    expect(screen.getByText('redemptions for TRVL2024')).toBeInTheDocument();
  });

  // Deleting is not reversible, so it asks first rather than acting on the click
  it('confirms before deleting a code', async () => {
    renderSection();

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }));

    expect(screen.getByText('delete TRVL2024?')).toBeInTheDocument();
  });
});
