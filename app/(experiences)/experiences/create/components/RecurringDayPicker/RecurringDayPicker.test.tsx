import { render, screen, fireEvent } from '@testing-library/react';
import { RecurringDayPicker } from './RecurringDayPicker';

describe('RecurringDayPicker', () => {
  it('renders all day buttons', () => {
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

  it('highlights selected days with green background', () => {
    const onChange = jest.fn();
    render(<RecurringDayPicker value={['mon', 'wed']} onChange={onChange} />);

    const monButton = screen.getByText('Mon').closest('button');
    const wedButton = screen.getByText('Wed').closest('button');
    const tueButton = screen.getByText('Tue').closest('button');

    expect(monButton).toHaveClass('bg-emerald-700');
    expect(wedButton).toHaveClass('bg-emerald-700');
    expect(tueButton).toHaveClass('border-2');
  });

  it('toggles day selection on click', () => {
    const onChange = jest.fn();
    render(<RecurringDayPicker value={['mon']} onChange={onChange} />);

    const monButton = screen.getByText('Mon').closest('button');
    fireEvent.click(monButton!);

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('adds a day when clicked while unselected', () => {
    const onChange = jest.fn();
    render(<RecurringDayPicker value={['mon']} onChange={onChange} />);

    const tueButton = screen.getByText('Tue').closest('button');
    fireEvent.click(tueButton!);

    expect(onChange).toHaveBeenCalledWith(['mon', 'tue']);
  });
});
