import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecurringDayPicker } from './RecurringDayPicker';

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, id }: any) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid={`checkbox-${id}`}
    />
  ),
}));

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

  it('shows selected days as checked', () => {
    const onChange = jest.fn();
    render(<RecurringDayPicker value={['mon', 'wed']} onChange={onChange} />);

    const monCheckbox = screen.getByTestId('checkbox-day-mon') as HTMLInputElement;
    const wedCheckbox = screen.getByTestId('checkbox-day-wed') as HTMLInputElement;
    const tueCheckbox = screen.getByTestId('checkbox-day-tue') as HTMLInputElement;

    expect(monCheckbox.checked).toBe(true);
    expect(wedCheckbox.checked).toBe(true);
    expect(tueCheckbox.checked).toBe(false);
  });

  it('removes a day when unchecked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<RecurringDayPicker value={['mon']} onChange={onChange} />);

    const monCheckbox = screen.getByTestId('checkbox-day-mon');
    await user.click(monCheckbox);

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('adds a day when checked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<RecurringDayPicker value={['mon']} onChange={onChange} />);

    const tueCheckbox = screen.getByTestId('checkbox-day-tue');
    await user.click(tueCheckbox);

    expect(onChange).toHaveBeenCalledWith(['mon', 'tue']);
  });
});
