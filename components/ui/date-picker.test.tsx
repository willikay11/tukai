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

// The day is a button inside the gridcell, and the cell carries the ISO date —
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
