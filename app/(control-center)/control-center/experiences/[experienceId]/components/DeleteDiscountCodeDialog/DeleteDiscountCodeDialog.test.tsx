import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PromoCode } from '@/types/promoCode';

import { DeleteDiscountCodeDialog } from './index';

const deleteCode = jest.fn();
jest.mock('@/app/shared/hooks/usePromoCodes', () => ({
  useDeletePromoCode: () => ({ mutate: deleteCode, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const promo = (overrides: Partial<PromoCode> = {}): PromoCode =>
  ({
    id: 'p1',
    code: 'TRVL2024',
    kind: 'promotion',
    experience: 'e1',
    discountType: 'fixed',
    discountAmount: '500',
    isActive: true,
    redeemedCount: 0,
    ...overrides,
  }) as PromoCode;

describe('deleting a discount code', () => {
  beforeEach(() => jest.clearAllMocks());

  it('names the code it is about to delete', () => {
    render(<DeleteDiscountCodeDialog code={promo()} onClose={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Delete TRVL2024?' })).toBeInTheDocument();
  });

  // Pausing is the reversible answer, and it is offered here too
  it('points at pausing instead', () => {
    render(<DeleteDiscountCodeDialog code={promo()} onClose={jest.fn()} />);

    expect(screen.getByText(/pause it instead/i)).toBeInTheDocument();
  });

  it('says how many people already used it', () => {
    render(<DeleteDiscountCodeDialog code={promo({ redeemedCount: 32 })} onClose={jest.fn()} />);

    expect(screen.getByText(/32 people have already used this code/)).toBeInTheDocument();
    expect(screen.getByText(/They keep their tickets/)).toBeInTheDocument();
  });

  it('counts a single person in the singular', () => {
    render(<DeleteDiscountCodeDialog code={promo({ redeemedCount: 1 })} onClose={jest.fn()} />);

    expect(screen.getByText(/1 person has already used this code/)).toBeInTheDocument();
  });

  it('deletes on confirmation', async () => {
    render(<DeleteDiscountCodeDialog code={promo()} onClose={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete code' }));

    expect(deleteCode).toHaveBeenCalledWith('p1', expect.anything());
  });

  it('closes without deleting when the code is kept', async () => {
    const onClose = jest.fn();
    render(<DeleteDiscountCodeDialog code={promo()} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Keep code' }));

    expect(deleteCode).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('shows nothing when no code is chosen', () => {
    render(<DeleteDiscountCodeDialog code={null} onClose={jest.fn()} />);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
