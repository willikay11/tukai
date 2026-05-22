import { fireEvent, render, screen } from '@testing-library/react';

import { DuplicateTicketsCheckbox } from './DuplicateTicketsCheckbox';

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, id }: any) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="checkbox"
    />
  ),
}));

describe('DuplicateTicketsCheckbox', () => {
  it('renders checkbox with label', () => {
    const onChange = jest.fn();
    render(<DuplicateTicketsCheckbox value={false} onChange={onChange} />);

    expect(screen.getByText('Duplicate ticket(s) for the entire period')).toBeInTheDocument();
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  it('reflects checked state', () => {
    const onChange = jest.fn();
    render(<DuplicateTicketsCheckbox value={true} onChange={onChange} />);

    const checkbox = screen.getByTestId('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('calls onChange when toggled', () => {
    const onChange = jest.fn();
    render(<DuplicateTicketsCheckbox value={false} onChange={onChange} />);

    const checkbox = screen.getByTestId('checkbox') as HTMLInputElement;
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
