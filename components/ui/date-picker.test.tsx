import React from 'react';

import { fireEvent, render, screen, within } from '@testing-library/react';

import { DatePicker } from '@/components/ui/date-picker';

// Radix popovers need these in jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.releasePointerCapture = jest.fn();
});

const openCalendar = () => {
  fireEvent.click(screen.getByRole('button', { name: /select date/i }));
  return screen.getByRole('grid');
};

// The day is a button inside the gridcell, and the cell carries the ISO date -
// reading it keeps these assertions independent of which month opens
const clickDay = (label: string) => {
  const cell = screen.getAllByRole('gridcell', { name: label })[0];
  const isoDate = cell.getAttribute('data-day');
  fireEvent.click(within(cell).getByRole('button'));
  return isoDate;
};

describe('DatePicker', () => {
  it('opens the calendar when the trigger is clicked', () => {
    render(<DatePicker placeholder="Select Date" />);

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    openCalendar();

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('closes the calendar once a day is selected', () => {
    const onChange = jest.fn();
    render(<DatePicker onChange={onChange} placeholder="Select Date" />);

    const grid = openCalendar();
    clickDay('15');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(grid).not.toBeInTheDocument();
  });

  it('reports the selected day in yyyy-MM-dd', () => {
    const onChange = jest.fn();
    render(<DatePicker onChange={onChange} placeholder="Select Date" />);

    openCalendar();
    const isoDate = clickDay('15');

    expect(isoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(onChange).toHaveBeenCalledWith(isoDate);
  });

  it('reopens after a selection so the date can be changed', () => {
    render(<DatePicker placeholder="Select Date" />);

    openCalendar();
    clickDay('15');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('stays open when the selected day is clicked again to clear it', () => {
    const onChange = jest.fn();
    render(<DatePicker onChange={onChange} placeholder="Select Date" />);

    openCalendar();
    clickDay('15');

    fireEvent.click(screen.getAllByRole('button')[0]);
    clickDay('15');

    // Deselecting leaves the calendar up so another day can be picked
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});

/**
 * The canvas's Date Field is 56px and knows which end of a range it is -
 * `range-start`, `range-end` - so a pair of fields reads as one span. Two
 * single pickers showed one day each and nothing in between.
 */
describe('the field as one end of a range', () => {
  // The calendar opens on the current month, so the span is built inside it and
  // these assertions do not depend on the date they run on
  const dayInThisMonth = (dayOfMonth: number) => {
    const date = new Date();
    date.setDate(dayOfMonth);
    date.setHours(12, 0, 0, 0);
    return date;
  };

  const iso = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;

  // The cell carries its own ISO date, which is stable wherever this runs
  const cellFor = (date: Date) =>
    screen.getAllByRole('gridcell').find((cell) => cell.getAttribute('data-day') === iso(date));

  const openSpan = (from: Date, to?: Date) => {
    render(
      <DatePicker
        placeholder="Select Date"
        value={iso(from)}
        rangeStart={iso(from)}
        rangeEnd={to ? iso(to) : undefined}
      />,
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
  };

  it('stands 56px tall, as the canvas has it', () => {
    render(<DatePicker placeholder="Select Date" />);

    expect(screen.getByRole('button', { name: /select date/i })).toHaveClass('h-14');
  });

  it('shades the days between the two ends', () => {
    openSpan(dayInThisMonth(5), dayInThisMonth(8));

    expect(cellFor(dayInThisMonth(6))?.className).toContain('bg-surface-brand');
    expect(cellFor(dayInThisMonth(7))?.className).toContain('bg-surface-brand');
  });

  it('rounds the span at its ends', () => {
    openSpan(dayInThisMonth(5), dayInThisMonth(8));

    expect(cellFor(dayInThisMonth(5))?.className).toContain('rounded-l-md');
    expect(cellFor(dayInThisMonth(8))?.className).toContain('rounded-r-md');
  });

  it('leaves the days outside the span alone', () => {
    openSpan(dayInThisMonth(5), dayInThisMonth(8));

    expect(cellFor(dayInThisMonth(10))?.className).not.toContain('bg-surface-brand');
  });

  // Until both ends are chosen there is no span to draw
  it('shades nothing while only one end is set', () => {
    openSpan(dayInThisMonth(5));

    expect(cellFor(dayInThisMonth(6))?.className).not.toContain('bg-surface-brand');
  });

  // An end before its start is a state the form is about to reject; it must not
  // paint a backwards span in the meantime
  it('shades nothing when the span runs backwards', () => {
    openSpan(dayInThisMonth(8), dayInThisMonth(5));

    expect(cellFor(dayInThisMonth(6))?.className).not.toContain('bg-surface-brand');
  });
});
