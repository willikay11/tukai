import { render, screen, fireEvent } from '@testing-library/react';
import { TimeSlotList } from './TimeSlotList';

jest.mock('@/components/ui/time-picker', () => ({
  TimePicker: ({ placeholder, value }: { placeholder: string; value?: string }) => (
    <input
      data-testid="time-picker"
      placeholder={placeholder}
      defaultValue={value}
      type="text"
    />
  ),
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: () => <span data-testid="trash-icon" />,
}));

describe('TimeSlotList', () => {
  it('renders initial slot', () => {
    const onChange = jest.fn();
    render(
      <TimeSlotList
        slots={[{ startTime: null, endTime: null }]}
        onChange={onChange}
        errors={{}}
      />,
    );

    const timePickers = screen.getAllByTestId('time-picker');
    expect(timePickers).toHaveLength(2);
  });

  it('renders add button', () => {
    const onChange = jest.fn();
    render(
      <TimeSlotList
        slots={[{ startTime: null, endTime: null }]}
        onChange={onChange}
        errors={{}}
      />,
    );

    expect(screen.getByText('+ Add another time slot')).toBeInTheDocument();
  });

  it('calls onChange when add button is clicked', () => {
    const onChange = jest.fn();
    render(
      <TimeSlotList
        slots={[{ startTime: null, endTime: null }]}
        onChange={onChange}
        errors={{}}
      />,
    );

    const addButton = screen.getByText('+ Add another time slot');
    fireEvent.click(addButton);

    expect(onChange).toHaveBeenCalledWith([
      { startTime: null, endTime: null },
      { startTime: null, endTime: null },
    ]);
  });

  it('does not show delete button for single slot', () => {
    const onChange = jest.fn();
    render(
      <TimeSlotList
        slots={[{ startTime: null, endTime: null }]}
        onChange={onChange}
        errors={{}}
      />,
    );

    expect(screen.queryByTestId('trash-icon')).not.toBeInTheDocument();
  });

  it('shows delete button for multiple slots', () => {
    const onChange = jest.fn();
    render(
      <TimeSlotList
        slots={[
          { startTime: null, endTime: null },
          { startTime: null, endTime: null },
        ]}
        onChange={onChange}
        errors={{}}
      />,
    );

    const trashIcons = screen.getAllByTestId('trash-icon');
    expect(trashIcons.length).toBeGreaterThan(0);
  });

  it('displays error messages', () => {
    const onChange = jest.fn();
    render(
      <TimeSlotList
        slots={[{ startTime: null, endTime: null }]}
        onChange={onChange}
        errors={{ timeSlots: 'At least one time slot is required' }}
      />,
    );

    expect(screen.getByText('At least one time slot is required')).toBeInTheDocument();
  });
});
