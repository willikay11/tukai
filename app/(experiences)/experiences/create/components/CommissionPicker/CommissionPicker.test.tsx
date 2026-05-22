import { render, screen } from '@testing-library/react';

import { CommissionPicker } from './CommissionPicker';

jest.mock('@/components/ui/radio-group', () => ({
  RadioGroup: ({ children, value, onValueChange }: any) => (
    <div data-testid="radio-group" data-value={value}>
      {Array.isArray(children) ? children : [children]}
    </div>
  ),
  RadioGroupItem: ({ value, id }: any) => (
    <input type="radio" value={value} id={id} data-testid={`radio-item-${value}`} />
  ),
}));

describe('CommissionPicker', () => {
  it('renders all commission options', () => {
    render(<CommissionPicker value="host" onChange={() => {}} />);
    expect(screen.getByText('I will fully pay the commission')).toBeInTheDocument();
    expect(screen.getByText('The customer will pay the commission')).toBeInTheDocument();
    expect(screen.getByText('Split 50-50 between the customer and myself')).toBeInTheDocument();
  });

  it('renders label about 4% commission', () => {
    render(<CommissionPicker value="host" onChange={() => {}} />);
    expect(screen.getByText(/Tukai charges a 4% commission/i)).toBeInTheDocument();
  });

  it('receives correct props', () => {
    const onChange = jest.fn();
    const { rerender } = render(<CommissionPicker value="host" onChange={onChange} />);
    expect(screen.getByTestId('radio-group')).toHaveAttribute('data-value', 'host');
    rerender(<CommissionPicker value="customer" onChange={onChange} />);
    expect(screen.getByTestId('radio-group')).toHaveAttribute('data-value', 'customer');
  });
});
