import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DiscountCodeField } from './DiscountCodeField';

const onApply = jest.fn();
const onRemove = jest.fn();

const renderField = (props: Partial<React.ComponentProps<typeof DiscountCodeField>> = {}) =>
  render(
    <DiscountCodeField
      applied={null}
      isChecking={false}
      currency="KES"
      onApply={onApply}
      onRemove={onRemove}
      {...props}
    />,
  );

describe('DiscountCodeField', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cannot be applied until something is typed', async () => {
    const user = userEvent.setup();
    renderField();

    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    await user.type(screen.getByLabelText('Discount Code'), 'save10');

    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();
  });

  // Codes read back uppercase everywhere they are shown
  it('applies the code uppercased and trimmed', async () => {
    const user = userEvent.setup();
    renderField();

    await user.type(screen.getByLabelText('Discount Code'), 'save10');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onApply).toHaveBeenCalledWith('SAVE10');
  });

  it('applies on Enter, without submitting anything around it', async () => {
    const user = userEvent.setup();
    renderField();

    await user.type(screen.getByLabelText('Discount Code'), 'SAVE10{Enter}');

    expect(onApply).toHaveBeenCalledWith('SAVE10');
  });

  it('says why a code was refused, and keeps the field editable', () => {
    renderField({ error: "This code isn't valid for this order." });

    expect(screen.getByText("This code isn't valid for this order.")).toBeInTheDocument();
    expect(screen.getByLabelText('Discount Code')).toBeEnabled();
  });

  // Once applied the code is part of the order, so it stops being a text field
  it('shows what was applied instead of the input', () => {
    renderField({ applied: { code: 'SAVE10', amount: 240 } });

    expect(screen.getByText('SAVE10 applied')).toBeInTheDocument();
    expect(screen.getByText('KES 240.00 off this order')).toBeInTheDocument();
    expect(screen.queryByLabelText('Discount Code')).not.toBeInTheDocument();
  });

  it('prefers the wording the API gave', () => {
    renderField({ applied: { code: 'SAVE10', amount: 240, description: '10% off' } });

    expect(screen.getByText('10% off')).toBeInTheDocument();
  });

  it('hands the code back when it is removed', async () => {
    const user = userEvent.setup();
    renderField({ applied: { code: 'SAVE10', amount: 240 } });

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(onRemove).toHaveBeenCalled();
  });

  it('locks while a code is being checked', () => {
    renderField({ isChecking: true });

    expect(screen.getByLabelText('Discount Code')).toBeDisabled();
  });

  // The preview panel must not reach the API
  it('is inert in preview', () => {
    renderField({ isDisabled: true });

    expect(screen.getByLabelText('Discount Code')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
  });
});
