import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiDayDateSection } from './MultiDayDateSection';

jest.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ value, onChange }: any) => (
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      data-testid="date-picker"
    />
  ),
}));

jest.mock('@/components/ui/time-picker', () => ({
  TimePicker: ({ value, onChange, placeholder }: any) => (
    <input
      type="time"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid="time-picker"
    />
  ),
}));

describe('MultiDayDateSection', () => {
  const mockHandlers = {
    onStartDateChange: jest.fn(),
    onStartTimeChange: jest.fn(),
    onEndDateChange: jest.fn(),
    onEndTimeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all date and time labels', () => {
    render(
      <MultiDayDateSection
        startDate={null}
        startTime={null}
        endDate={null}
        endTime={null}
        errors={{}}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('Start Time')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('End Time')).toBeInTheDocument();
  });

  it('calls handlers when dates/times change', async () => {
    const user = userEvent.setup();
    render(
      <MultiDayDateSection
        startDate={null}
        startTime={null}
        endDate={null}
        endTime={null}
        errors={{}}
        {...mockHandlers}
      />
    );

    const datePickers = screen.getAllByTestId('date-picker');
    const timePickers = screen.getAllByTestId('time-picker');

    await user.clear(datePickers[0]);
    await user.type(datePickers[0], '2026-05-15');
    expect(mockHandlers.onStartDateChange).toHaveBeenCalledWith('2026-05-15');

    await user.clear(timePickers[0]);
    await user.type(timePickers[0], '09:00');
    expect(mockHandlers.onStartTimeChange).toHaveBeenCalledWith('09:00');
  });

  it('displays error messages', () => {
    const errors = {
      multiDayStartDate: 'Start date is required',
      multiDayEndDate: 'End date is required',
    };

    render(
      <MultiDayDateSection
        startDate={null}
        startTime={null}
        endDate={null}
        endTime={null}
        errors={errors}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Start date is required')).toBeInTheDocument();
    expect(screen.getByText('End date is required')).toBeInTheDocument();
  });

  it('populates pickers with provided values', () => {
    render(
      <MultiDayDateSection
        startDate="2026-05-15"
        startTime="09:00"
        endDate="2026-05-20"
        endTime="17:00"
        errors={{}}
        {...mockHandlers}
      />
    );

    const datePickers = screen.getAllByTestId('date-picker') as HTMLInputElement[];
    const timePickers = screen.getAllByTestId('time-picker') as HTMLInputElement[];

    expect(datePickers[0].value).toBe('2026-05-15');
    expect(timePickers[0].value).toBe('09:00');
    expect(datePickers[1].value).toBe('2026-05-20');
    expect(timePickers[1].value).toBe('17:00');
  });
});
