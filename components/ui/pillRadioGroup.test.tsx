import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PillRadioGroup } from './pillRadioGroup';

describe('PillRadioGroup disabled options', () => {
  const options = [
    { value: 'paid', label: 'Paid' },
    { value: 'free', label: 'Free', disabled: true, icon: 'LockIcon' },
  ];

  it('does not report a choice the reader cannot make', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<PillRadioGroup options={options} value="paid" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /Free/ }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('marks a locked option as disabled rather than hiding it', () => {
    render(<PillRadioGroup options={options} value="paid" onChange={jest.fn()} />);

    const free = screen.getByRole('button', { name: /Free/ });
    expect(free).toBeDisabled();
    expect(free).toHaveAttribute('aria-disabled', 'true');
  });

  it('leaves an option without a flag pressable, as before', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<PillRadioGroup options={options} value="free" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Paid' }));

    expect(onChange).toHaveBeenCalledWith('paid');
  });
});
