import { render, screen } from '@testing-library/react';

import { PreviewDateSection } from './index';

describe('PreviewDateSection', () => {
  it('renders section title', () => {
    render(<PreviewDateSection mode="single" date={null} startTime={null} endTime={null} />);
    expect(screen.getByText('Date of the Experience')).toBeInTheDocument();
  });

  it('displays "Not selected yet" when date is not provided', () => {
    render(<PreviewDateSection mode="single" date={null} startTime={null} endTime={null} />);
    expect(screen.getByText('Not selected yet')).toBeInTheDocument();
  });

  it('displays formatted date and time when provided', () => {
    render(
      <PreviewDateSection mode="single" date="2026-05-15" startTime="09:00" endTime="17:00" />,
    );
    expect(screen.getByText('Fri, May 15')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM - 5:00 PM')).toBeInTheDocument();
  });

  it('renders edit button when onEdit is provided', () => {
    const onEdit = jest.fn();
    render(
      <PreviewDateSection
        mode="single"
        date={null}
        startTime={null}
        endTime={null}
        onEdit={onEdit}
      />,
    );
    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();
  });

  it('displays multi-day dates and times correctly', () => {
    render(
      <PreviewDateSection
        mode="multi-day"
        startDate="2026-05-15"
        startTime="09:00"
        endDate="2026-05-20"
        endTime="17:00"
      />,
    );

    // Multi-day uses the same strip layout as recurring
    expect(screen.getByText('May 2026')).toBeInTheDocument();
    expect(screen.getByText('Runs for 6 Days')).toBeInTheDocument();
    expect(screen.getByText(/9:00 AM - 5:00 PM/)).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('pads the multi-day run with surrounding days for context', () => {
    render(
      <PreviewDateSection
        mode="multi-day"
        startDate="2026-05-15"
        startTime="09:00"
        endDate="2026-05-20"
        endTime="17:00"
      />,
    );

    // Three days either side of the 15th–20th run, dimmed rather than active
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.queryByText('11')).not.toBeInTheDocument();
    expect(screen.queryByText('24')).not.toBeInTheDocument();
  });

  it('shows a past multi-day run in full rather than dropping it', () => {
    render(
      <PreviewDateSection
        mode="multi-day"
        startDate="2020-05-15"
        startTime="09:00"
        endDate="2020-05-16"
        endTime="17:00"
      />,
    );

    expect(screen.getByText('Runs for 2 Days')).toBeInTheDocument();
    expect(screen.queryByText('No upcoming dates for this experience.')).not.toBeInTheDocument();
  });

  it('displays "Not selected yet" for multi-day when dates are missing', () => {
    render(
      <PreviewDateSection
        mode="multi-day"
        startDate={null}
        startTime={null}
        endDate={null}
        endTime={null}
      />,
    );
    expect(screen.getByText('Not selected yet')).toBeInTheDocument();
  });

  describe('itinerary mode', () => {
    it('shows the run of days without time pills', () => {
      render(<PreviewDateSection mode="itinerary" startDate="2026-09-10" endDate="2026-09-12" />);

      expect(screen.getByText('September 2026')).toBeInTheDocument();
      expect(screen.getByText('Runs for 3 Days')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      // Activity times live on the itinerary section, not here
      expect(screen.queryByText(/AM -/)).not.toBeInTheDocument();
    });

    it('pads the run with surrounding days, as multi-day does', () => {
      render(<PreviewDateSection mode="itinerary" startDate="2026-09-10" endDate="2026-09-12" />);

      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.queryByText('6')).not.toBeInTheDocument();
      expect(screen.queryByText('16')).not.toBeInTheDocument();
    });

    it('displays "Not selected yet" when the range is incomplete', () => {
      render(<PreviewDateSection mode="itinerary" startDate="2026-09-10" endDate={null} />);
      expect(screen.getByText('Not selected yet')).toBeInTheDocument();
    });
  });

  describe('recurring mode', () => {
    it('renders a time range for every time slot, not just the first', () => {
      render(
        <PreviewDateSection
          mode="recurring"
          days={['thu', 'fri', 'sat']}
          timeSlots={[
            { startTime: '14:00', endTime: '17:00' },
            { startTime: '18:00', endTime: '21:00' },
          ]}
          recurrenceStartDate="2026-08-27"
          recurrenceEndDate="2026-08-29"
        />,
      );

      expect(screen.getByText(/2:00 PM - 5:00 PM/)).toBeInTheDocument();
      expect(screen.getByText(/6:00 PM - 9:00 PM/)).toBeInTheDocument();
    });

    it('ignores incomplete slots but still renders complete ones', () => {
      render(
        <PreviewDateSection
          mode="recurring"
          days={['mon']}
          timeSlots={[
            { startTime: '10:00', endTime: '12:00' },
            { startTime: null, endTime: null },
          ]}
          recurrenceStartDate="2026-08-27"
          recurrenceEndDate="2026-08-29"
        />,
      );

      expect(screen.getByText(/10:00 AM - 12:00 PM/)).toBeInTheDocument();
      expect(screen.queryByText('Not selected yet')).not.toBeInTheDocument();
    });

    it('labels the recurrence the way the booking panel does', () => {
      render(
        <PreviewDateSection
          mode="recurring"
          days={['mon', 'wed', 'fri']}
          timeSlots={[{ startTime: '09:00', endTime: '17:00' }]}
          recurrenceStartDate="2026-08-27"
          recurrenceEndDate="2026-09-30"
        />,
      );

      // Full day names, matching RecurringDateSlotPicker's chip
      expect(screen.getByText('Recurs Every Monday, Wednesday & Friday')).toBeInTheDocument();
    });

    it('renders a date strip with the matching weekdays available', () => {
      render(
        <PreviewDateSection
          mode="recurring"
          days={['thu']}
          timeSlots={[{ startTime: '14:00', endTime: '17:00' }]}
          recurrenceStartDate="2026-08-27"
          recurrenceEndDate="2026-08-29"
        />,
      );

      // 27 Aug 2026 is a Thursday, so the strip runs Thu 27 – Sat 29
      expect(screen.getByText('27')).toBeInTheDocument();
      expect(screen.getByText('28')).toBeInTheDocument();
      expect(screen.getByText('29')).toBeInTheDocument();
      expect(screen.getByText('August 2026')).toBeInTheDocument();
    });

    it('displays "Not selected yet" when no slot is complete', () => {
      render(
        <PreviewDateSection
          mode="recurring"
          days={['mon']}
          timeSlots={[{ startTime: null, endTime: null }]}
          recurrenceStartDate="2026-08-27"
          recurrenceEndDate="2026-08-29"
        />,
      );

      expect(screen.getByText('Not selected yet')).toBeInTheDocument();
    });
  });
});
