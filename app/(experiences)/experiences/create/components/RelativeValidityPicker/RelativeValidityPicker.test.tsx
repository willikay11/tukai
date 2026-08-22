import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RelativeValidityPicker } from './index';

describe('RelativeValidityPicker', () => {
  it('renders the label with subtitle', () => {
    const onChange = jest.fn();
    render(<RelativeValidityPicker value={null} onChange={onChange} errors={{}} />);

    expect(screen.getByText(/Ticket Sales Validity/)).toBeInTheDocument();
    expect(screen.getByText(/When should the sales of these tickets end/)).toBeInTheDocument();
  });

  it('renders all predefined option pills', () => {
    const onChange = jest.fn();
    render(<RelativeValidityPicker value={null} onChange={onChange} errors={{}} />);

    expect(screen.getByText('1 hour before the experience starts')).toBeInTheDocument();
    expect(screen.getByText('1 hour before the experience ends')).toBeInTheDocument();
    expect(screen.getByText('1 day before the experience starts')).toBeInTheDocument();
  });

  it('calls onChange when a pill is clicked', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<RelativeValidityPicker value={null} onChange={onChange} errors={{}} />);

    const pill = screen.getByText('1 hour before the experience starts');
    await user.click(pill);

    expect(onChange).toHaveBeenCalledWith({
      amount: 1,
      unit: 'hour',
      anchor: 'start',
    });
  });

  // The selected pill is a brand gradient with white text, not a flat fill
  it('fills the selected pill', () => {
    const onChange = jest.fn();
    const selectedValue = { amount: 1, unit: 'hour', anchor: 'start' };
    render(<RelativeValidityPicker value={selectedValue} onChange={onChange} errors={{}} />);

    const selectedPill = screen.getByText('1 hour before the experience starts');
    expect(selectedPill).toHaveClass('text-white');
    expect(selectedPill.className).toContain('bg-gradient-to-b');

    const unselected = screen.getByText('1 day before the experience starts');
    expect(unselected).not.toHaveClass('text-white');
  });

  it('displays error messages', () => {
    const onChange = jest.fn();
    render(
      <RelativeValidityPicker
        value={null}
        onChange={onChange}
        errors={{
          salesEndRelative: 'Ticket sales validity is required',
        }}
      />,
    );

    expect(screen.getByText('Ticket sales validity is required')).toBeInTheDocument();
  });
});
