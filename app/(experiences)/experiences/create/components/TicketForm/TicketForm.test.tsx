import { render, screen } from '@testing-library/react';

import { TicketForm, TicketFormValue } from '.';

jest.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ placeholder, value, onChange }: any) => (
    <input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

jest.mock('@/components/ui/time-picker', () => ({
  TimePicker: ({ placeholder, value, onChange }: any) => (
    <input
      type="time"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, id }: any) => (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

jest.mock('@/components/ui/input', () => ({
  // `suffixIcon` and `id` were dropped here, which made anything in a field's
  // suffix — the quantity stepper, for one — invisible to every test
  Input: ({ placeholder, value, onChange, suffixIcon, id }: any) => (
    <span>
      <input id={id} placeholder={placeholder} value={value} onChange={onChange} />
      {suffixIcon}
    </span>
  ),
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('TicketForm', () => {
  const defaultValue: TicketFormValue = {
    name: '',
    quantity: null,
    amount: null,
    salesStartDate: null,
    salesStartTime: null,
    salesEndDate: null,
    salesEndTime: null,
    acceptPartialPayment: false,
  };

  it('renders all form fields', () => {
    render(<TicketForm value={defaultValue} onChange={() => {}} errors={{}} onSave={() => {}} />);
    expect(
      screen.getByPlaceholderText('Ticket Name e.g. VIP, Early Bird, Locals etc...'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Available Ticket Quantity')).toBeInTheDocument();
  });

  it('displays error messages', () => {
    const errors = { name: 'Name is required', quantity: 'Quantity must be > 0' };
    render(
      <TicketForm value={defaultValue} onChange={() => {}} errors={errors} onSave={() => {}} />,
    );
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Quantity must be > 0')).toBeInTheDocument();
  });

  it('renders cost calculation when quantity and amount provided', () => {
    const valueWithCosts: TicketFormValue = {
      ...defaultValue,
      quantity: 10,
      amount: 100,
    };
    render(
      <TicketForm
        value={valueWithCosts}
        onChange={() => {}}
        errors={{}}
        onSave={() => {}}
        experiencePricing="paid"
      />,
    );
    expect(screen.getByText(/Total Tickets Cost/i)).toBeInTheDocument();
  });

  // The quantity stepper used to be two 16px arrows with a gap — 34px tall,
  // which pushed its field to ~60px while Amount beside it stayed at 44px
  it('keeps the quantity field the same height as the amount field', () => {
    render(<TicketForm value={defaultValue} onChange={() => {}} errors={{}} onSave={() => {}} />);

    // Pinned to the input's own 18px line box, so it cannot drive the field
    // taller than the Amount field sharing its grid row
    const stepper = screen.getByLabelText('Increase quantity').parentElement;
    expect(stepper).toHaveClass('h-[18px]');
  });

  it('calls onSave when Save Ticket button clicked', () => {
    const onSave = jest.fn();
    render(<TicketForm value={defaultValue} onChange={() => {}} errors={{}} onSave={onSave} />);
    const saveButton = screen.getByText('Save Ticket');
    saveButton.click();
    expect(onSave).toHaveBeenCalled();
  });
});
