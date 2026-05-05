import { render, screen } from '@testing-library/react';
import { RecurrenceDateRange } from './RecurrenceDateRange';

jest.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ placeholder }: { placeholder: string }) => <div data-testid={`date-picker-${placeholder}`} />,
}));

describe('RecurrenceDateRange', () => {
  it('renders start and end date pickers', () => {
    const onChange = jest.fn();
    render(
      <RecurrenceDateRange
        startDate={null}
        endDate={null}
        onStartDateChange={onChange}
        onEndDateChange={onChange}
        errors={{}}
      />,
    );

    expect(screen.getByTestId('date-picker-Start Date')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-End Date')).toBeInTheDocument();
  });

  it('displays error messages when provided', () => {
    const onChange = jest.fn();
    render(
      <RecurrenceDateRange
        startDate={null}
        endDate={null}
        onStartDateChange={onChange}
        onEndDateChange={onChange}
        errors={{
          recurrenceStartDate: 'Start date is required',
          recurrenceEndDate: 'End date must be after start date',
        }}
      />,
    );

    expect(screen.getByText('Start date is required')).toBeInTheDocument();
    expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
  });

  it('renders label', () => {
    const onChange = jest.fn();
    render(
      <RecurrenceDateRange
        startDate={null}
        endDate={null}
        onStartDateChange={onChange}
        onEndDateChange={onChange}
        errors={{}}
      />,
    );

    expect(screen.getByText('Recurrence start and end dates')).toBeInTheDocument();
  });
});
