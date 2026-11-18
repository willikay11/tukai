import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PromoCode } from '@/types/promoCode';

import { DiscountCodeForm } from './index';

const createCode = jest.fn();
const updateCode = jest.fn();

jest.mock('@/app/shared/hooks/usePromoCodes', () => ({
  useCreatePromoCode: () => ({ mutate: createCode, isPending: false }),
  useUpdatePromoCode: () => ({ mutate: updateCode, isPending: false }),
}));

const mockToast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast: mockToast }) }));

const mockPlanAction = <button type="button">See plans</button>;
jest.mock('@/app/shared/hooks/usePlanLimitAction', () => ({
  usePlanLimitAction: () => (error: { errors?: { code: string }[] }) =>
    error.errors?.[0]?.code.startsWith('plan_limit_') ? mockPlanAction : undefined,
}));

const renderForm = (props: Partial<React.ComponentProps<typeof DiscountCodeForm>> = {}) =>
  render(
    <DiscountCodeForm
      experienceId="e1"
      currency="KES"
      existingCodes={['TRVL2024']}
      editing={null}
      isOpen
      onClose={jest.fn()}
      {...props}
    />,
  );

const primary = () => screen.getByRole('button', { name: 'Generate discount code' });

/**
 * The canvas normalises the code field as you type and enables its primary
 * button only when the whole form is good, so both are behaviour, not styling.
 */
describe('generating a discount code', () => {
  beforeEach(() => jest.clearAllMocks());

  it('will not submit an empty form', () => {
    renderForm();

    expect(primary()).toBeDisabled();
  });

  it('uppercases the code and drops punctuation as it is typed', async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText(/Discount code/), 'trvl-2026!');

    expect(screen.getByLabelText(/Discount code/)).toHaveValue('TRVL2026');
  });

  it('stops the code at ten characters', async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText(/Discount code/), 'ABCDEFGHIJKLMN');

    expect(screen.getByLabelText(/Discount code/)).toHaveValue('ABCDEFGHIJ');
  });

  it('names a code the host already has', async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText(/Discount code/), 'TRVL2024');
    await userEvent.type(screen.getByLabelText(/Enter amount/), '500');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You already have a code called TRVL2024.',
    );
    expect(primary()).toBeDisabled();
  });

  it('opens on a fixed amount, and says which currency', () => {
    renderForm();

    expect(screen.getByRole('radio', { name: 'Fixed amount' })).toBeChecked();
    expect(screen.getByText('In Kenya shillings, taken off each ticket.')).toBeInTheDocument();
  });

  it('changes the value field when the type changes', async () => {
    renderForm();

    await userEvent.click(screen.getByRole('radio', { name: 'Percentage (%)' }));

    expect(screen.getByLabelText('Enter percentage to discount')).toBeInTheDocument();
    expect(screen.getByText('Taken off the ticket price.')).toBeInTheDocument();
  });

  // A percentage and an amount are not the same number
  it('clears the value when the type changes', async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText(/Enter amount/), '500');
    await userEvent.click(screen.getByRole('radio', { name: 'Percentage (%)' }));

    expect(screen.getByLabelText(/Enter percentage/)).toHaveValue('');
  });

  it('refuses a percentage over 100', async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText(/Discount code/), 'HALFOFF');
    await userEvent.click(screen.getByRole('radio', { name: 'Percentage (%)' }));
    await userEvent.type(screen.getByLabelText(/Enter percentage/), '120');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A percentage discount can’t be more than 100%.',
    );
  });

  it('sends the amount on the experience it belongs to', async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText(/Discount code/), 'JULY500');
    await userEvent.type(screen.getByLabelText(/Enter amount/), '500');
    await waitFor(() => expect(primary()).toBeEnabled());
    await userEvent.click(primary());

    expect(createCode).toHaveBeenCalledWith(
      {
        code: 'JULY500',
        experience: 'e1',
        discountType: 'fixed',
        discountAmount: 500,
      },
      expect.anything(),
    );
  });

  // DEV-351: a plan without discount codes is refused with the API's own words
  it('offers the hosting plans when the plan has no discount codes', async () => {
    createCode.mockImplementation((_payload, { onError }) =>
      onError(
        Object.assign(new Error("Discount codes aren't included in the host's Basic plan."), {
          errors: [{ code: 'plan_limit_discount_codes', detail: '…', attr: 'discount_type' }],
        }),
      ),
    );
    renderForm();

    await userEvent.type(screen.getByLabelText(/Discount code/), 'JULY500');
    await userEvent.type(screen.getByLabelText(/Enter amount/), '500');
    await waitFor(() => expect(primary()).toBeEnabled());
    await userEvent.click(primary());

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Discount codes aren't included in the host's Basic plan.",
        action: mockPlanAction,
      }),
    );
  });

  it('sends a percentage under its own field', async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText(/Discount code/), 'EARLY15');
    await userEvent.click(screen.getByRole('radio', { name: 'Percentage (%)' }));
    await userEvent.type(screen.getByLabelText(/Enter percentage/), '15');
    await waitFor(() => expect(primary()).toBeEnabled());
    await userEvent.click(primary());

    expect(createCode).toHaveBeenCalledWith(
      expect.objectContaining({ discountType: 'percentage', discountPercentage: 15 }),
      expect.anything(),
    );
  });
});

describe('editing a discount code', () => {
  const editing = {
    id: 'p1',
    code: 'TRVL2024',
    kind: 'promotion',
    experience: 'e1',
    discountType: 'fixed',
    discountAmount: '500',
    isActive: true,
    redeemedCount: 3,
  } as PromoCode;

  beforeEach(() => jest.clearAllMocks());

  it('opens on the code as it stands', () => {
    renderForm({ editing });

    expect(screen.getByRole('heading', { name: 'Edit discount code' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Discount code/)).toHaveValue('TRVL2024');
    expect(screen.getByLabelText(/Enter amount/)).toHaveValue('500');
  });

  // Its own name is not a clash
  it('saves without renaming it', async () => {
    renderForm({ editing });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(updateCode).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p1' }),
      expect.anything(),
    );
  });
});
