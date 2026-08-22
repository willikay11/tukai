import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RecurringDayPicker } from '.';

// The days are toggle pills now, not checkboxes — selection shows as a filled
// pill rather than a checked box.
const dayPill = (label: string) => screen.getByRole('button', { name: label });
const isSelected = (label: string) => dayPill(label).className.includes('text-white');

describe('RecurringDayPicker', () => {
  it('renders all day labels', () => {
    const onChange = jest.fn();
    render(<RecurringDayPicker value={[]} onChange={onChange} />);

    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('fills the pills for the selected days only', () => {
    render(<RecurringDayPicker value={['mon', 'wed']} onChange={jest.fn()} />);

    expect(isSelected('Mon')).toBe(true);
    expect(isSelected('Wed')).toBe(true);
    expect(isSelected('Tue')).toBe(false);
  });

  it('removes a day when its pill is tapped again', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<RecurringDayPicker value={['mon']} onChange={onChange} />);

    await user.click(dayPill('Mon'));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('adds a day when an unselected pill is tapped', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<RecurringDayPicker value={['mon']} onChange={onChange} />);

    await user.click(dayPill('Tue'));

    expect(onChange).toHaveBeenCalledWith(['mon', 'tue']);
  });
});
