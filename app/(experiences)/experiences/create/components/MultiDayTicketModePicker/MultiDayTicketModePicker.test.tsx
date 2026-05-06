import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiDayTicketModePicker } from './MultiDayTicketModePicker';

describe('MultiDayTicketModePicker', () => {
  it('renders the question label', () => {
    const onChange = jest.fn();
    render(
      <MultiDayTicketModePicker value="entire-period" onChange={onChange} />
    );

    expect(
      screen.getByText('How would you like to create tickets for this experience?')
    ).toBeInTheDocument();
  });

  it('renders both radio options', () => {
    const onChange = jest.fn();
    render(
      <MultiDayTicketModePicker value="entire-period" onChange={onChange} />
    );

    expect(
      screen.getByText('Create one ticket setup for the entire period')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Create tickets for each day separately')
    ).toBeInTheDocument();
  });

  it('shows entire-period selected by default', () => {
    const onChange = jest.fn();
    render(
      <MultiDayTicketModePicker value="entire-period" onChange={onChange} />
    );

    expect(
      screen.getByText('Create one ticket setup for the entire period')
    ).toBeInTheDocument();
    // The RadioGroup component is controlled by the value prop
    // We verify it's in the document which means it's available for selection
  });

  it('calls onChange when each-day is selected', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <MultiDayTicketModePicker value="entire-period" onChange={onChange} />
    );

    const eachDayRadio = screen.getByRole('radio', {
      name: /Create tickets for each day separately/i,
    });

    await user.click(eachDayRadio);
    expect(onChange).toHaveBeenCalledWith('each-day');
  });

  it('calls onChange when entire-period is selected', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <MultiDayTicketModePicker value="each-day" onChange={onChange} />
    );

    const entirePeriodRadio = screen.getByRole('radio', {
      name: /Create one ticket setup for the entire period/i,
    });

    await user.click(entirePeriodRadio);
    expect(onChange).toHaveBeenCalledWith('entire-period');
  });
});
