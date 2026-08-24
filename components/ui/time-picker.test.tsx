import React, { useState } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TimePicker, formatTimeLabel } from './time-picker';

const setup = () => userEvent.setup({ pointerEventsCheck: 0 });

const openList = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('combobox'));
};

describe('formatTimeLabel', () => {
  it.each([
    ['00:00', '12:00 AM'],
    ['00:30', '12:30 AM'],
    ['01:30', '01:30 AM'],
    ['11:30', '11:30 AM'],
    ['12:00', '12:00 PM'],
    ['13:30', '01:30 PM'],
    ['23:30', '11:30 PM'],
  ])('renders %s as %s', (value, label) => {
    expect(formatTimeLabel(value)).toBe(label);
  });

  it('leaves an unparsable value alone', () => {
    expect(formatTimeLabel('nonsense')).toBe('nonsense');
  });
});

describe('TimePicker', () => {
  it('shows the placeholder when nothing is chosen', () => {
    render(<TimePicker placeholder="Select time" />);

    expect(screen.getByText('Select time')).toBeInTheDocument();
  });

  it('shows the chosen time in 12-hour form', () => {
    render(<TimePicker value="13:30" />);

    expect(screen.getByRole('combobox')).toHaveTextContent('01:30 PM');
  });

  it('offers a slot every half hour across the day', async () => {
    const user = setup();
    render(<TimePicker />);
    await openList(user);

    expect(screen.getAllByRole('option')).toHaveLength(48);
  });

  it('starts at midnight and ends at 11:30 PM', async () => {
    const user = setup();
    render(<TimePicker />);
    await openList(user);

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options[0]).toBe('12:00 AM');
    expect(options[1]).toBe('12:30 AM');
    expect(options[47]).toBe('11:30 PM');
  });

  it('reports the 24-hour value, not the label', async () => {
    const onChange = jest.fn();
    const user = setup();

    render(<TimePicker onChange={onChange} />);
    await openList(user);
    await user.click(screen.getByRole('option', { name: '01:30 PM' }));

    expect(onChange).toHaveBeenCalledWith('13:30');
  });

  describe('minTime', () => {
    // Stops an end time landing at or before its start
    it('drops every slot at or before the floor', async () => {
      const user = setup();
      render(<TimePicker minTime="22:00" />);
      await openList(user);

      const options = screen.getAllByRole('option').map((option) => option.textContent);
      expect(options).toEqual(['10:30 PM', '11:00 PM', '11:30 PM']);
    });

    it('excludes the floor itself', async () => {
      const user = setup();
      render(<TimePicker minTime="22:00" />);
      await openList(user);

      expect(screen.queryByRole('option', { name: '10:00 PM' })).not.toBeInTheDocument();
    });

    it('says so when the floor leaves nothing', async () => {
      const user = setup();
      render(<TimePicker minTime="23:30" />);
      await openList(user);

      expect(screen.getByText(/No times left after 11:30 PM/)).toBeInTheDocument();
    });

    it('offers the whole day when there is no floor', async () => {
      const user = setup();
      render(<TimePicker />);
      await openList(user);

      expect(screen.getAllByRole('option')).toHaveLength(48);
    });
  });

  // A time saved before this picker existed, or set through the API, is not on
  // the half hour — opening the list must not silently drop or round it
  it('keeps an off-step value selectable', async () => {
    const user = setup();
    render(<TimePicker value="09:15" />);
    await openList(user);

    expect(screen.getByRole('option', { name: '09:15 AM' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(49);
  });

  it('keeps an off-step value in time order', async () => {
    const user = setup();
    const { container } = render(<TimePicker value="09:15" />);
    await openList(user);

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options.indexOf('09:15 AM')).toBe(options.indexOf('09:00 AM') + 1);
    expect(container).toBeInTheDocument();
  });

  // The trigger must reflect the choice. It came up blank once, because
  // passing children to SelectValue makes Radix render those instead of
  // mirroring the selected item's label.
  describe('the trigger reflects the selection', () => {
    const Controlled = ({ initial }: { initial?: string }) => {
      const [time, setTime] = useState<string | undefined>(initial);
      return <TimePicker value={time} onChange={setTime} placeholder="Select time" />;
    };

    it('shows the time the reader just picked', async () => {
      const user = setup();
      render(<Controlled />);

      await openList(user);
      await user.click(screen.getByRole('option', { name: '01:30 PM' }));

      expect(screen.getByRole('combobox')).toHaveTextContent('01:30 PM');
    });

    it('shows a time that was already stored', () => {
      render(<Controlled initial="09:30" />);

      expect(screen.getByRole('combobox')).toHaveTextContent('09:30 AM');
    });

    it('goes back to the placeholder with nothing chosen', () => {
      render(<Controlled />);

      expect(screen.getByRole('combobox')).toHaveTextContent('Select time');
    });
  });

  it('can be disabled', () => {
    render(<TimePicker disabled />);

    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
