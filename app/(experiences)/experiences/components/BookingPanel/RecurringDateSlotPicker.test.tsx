import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RecurringDateSlotPicker } from './RecurringDateSlotPicker';

// A weekly Tue/Thu rule over a fixed future window (Aug 2027):
// Sun 15 … Sat 21, where Tue 17 and Thu 19 are occurrences - exactly one
// 7-day page, so the paging arrows stay disabled throughout this fixture
const RULE = 'DTSTART:20270815T060000Z\nRRULE:FREQ=WEEKLY;UNTIL=20270821T205959Z;BYDAY=TU,TH';

const TIME_SLOTS = [
  { id: 'slot-1', label: '6:00 AM - 12:00 PM' },
  { id: 'slot-2', label: '1:00 PM - 6:00 PM' },
];

const defaultProps = {
  recurrenceRule: RULE,
  timeSlots: TIME_SLOTS,
  selectedDate: '2027-08-17',
  onDateChange: jest.fn(),
  selectedSlotId: 'slot-1',
  onSlotChange: jest.fn(),
};

describe('RecurringDateSlotPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the section heading, recurrence note and month header', () => {
    render(<RecurringDateSlotPicker {...defaultProps} />);
    expect(screen.getByText('Select date and slot')).toBeInTheDocument();
    expect(screen.getByText('Recurs Every Tuesday & Thursday')).toBeInTheDocument();
    expect(screen.getByText('August 2027')).toBeInTheDocument();
  });

  it('enables only dates matching the recurrence days', () => {
    render(<RecurringDateSlotPicker {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Tue, Aug 17' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Thu, Aug 19' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Sun, Aug 15' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mon, Aug 16' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Wed, Aug 18' })).toBeDisabled();
  });

  it('calls onDateChange when an available date is clicked', async () => {
    const user = userEvent.setup();
    render(<RecurringDateSlotPicker {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Thu, Aug 19' }));
    expect(defaultProps.onDateChange).toHaveBeenCalledWith('2027-08-19');
  });

  it('renders every time slot and calls onSlotChange on click', async () => {
    const user = userEvent.setup();
    render(<RecurringDateSlotPicker {...defaultProps} />);

    expect(screen.getByText('6:00 AM - 12:00 PM')).toBeInTheDocument();
    expect(screen.getByText('1:00 PM - 6:00 PM')).toBeInTheDocument();

    await user.click(screen.getByText('1:00 PM - 6:00 PM'));
    expect(defaultProps.onSlotChange).toHaveBeenCalledWith('slot-2');
  });

  it('defaults the selection to the first available date when none is selected', () => {
    render(<RecurringDateSlotPicker {...defaultProps} selectedDate={null} />);
    expect(defaultProps.onDateChange).toHaveBeenCalledWith('2027-08-17');
  });

  it('renders nothing for an unparseable rule', () => {
    const { container } = render(
      <RecurringDateSlotPicker {...defaultProps} recurrenceRule="not-a-rule" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  // An elapsed slot is shown, not hidden - struck through and unselectable,
  // rather than removed from the day's schedule
  it('shows a past slot struck through and disabled, never selectable', async () => {
    const user = userEvent.setup();
    const onSlotChange = jest.fn();
    render(
      <RecurringDateSlotPicker
        {...defaultProps}
        timeSlots={[
          { id: 'slot-1', label: '6:00 AM - 12:00 PM', isPast: true },
          { id: 'slot-2', label: '1:00 PM - 6:00 PM', isPast: false },
        ]}
        onSlotChange={onSlotChange}
      />,
    );

    const pastSlot = screen.getByRole('button', { name: '6:00 AM - 12:00 PM' });
    expect(pastSlot).toBeDisabled();
    expect(pastSlot).toHaveClass('line-through');

    await user.click(pastSlot);
    expect(onSlotChange).not.toHaveBeenCalled();
  });

  describe('paging through weeks', () => {
    // A longer open-ended rule (no UNTIL), so more than one 7-day page exists
    const LONG_RULE = 'DTSTART:20270815T060000Z\nRRULE:FREQ=WEEKLY;BYDAY=TU,TH';

    it('starts with Previous disabled and Next enabled when more dates follow', () => {
      render(
        <RecurringDateSlotPicker {...defaultProps} recurrenceRule={LONG_RULE} timeSlots={[]} />,
      );

      expect(screen.getByRole('button', { name: 'Previous dates' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next dates' })).toBeEnabled();
    });

    it('advances to the next 7 days and back without changing the selected date', async () => {
      const user = userEvent.setup();
      render(
        <RecurringDateSlotPicker {...defaultProps} recurrenceRule={LONG_RULE} timeSlots={[]} />,
      );

      await user.click(screen.getByRole('button', { name: 'Next dates' }));

      expect(screen.getByText('August 2027')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tue, Aug 24' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Tue, Aug 17' })).not.toBeInTheDocument();
      expect(defaultProps.onDateChange).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Previous dates' }));
      expect(screen.getByRole('button', { name: 'Tue, Aug 17' })).toBeInTheDocument();
    });
  });
});
