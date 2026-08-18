import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CommissionPicker } from './index';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span data-testid={`icon-${iconName}`} />,
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

  it('reports the picked option', async () => {
    const onChange = jest.fn();
    render(<CommissionPicker value="host" onChange={onChange} />);

    await userEvent.click(screen.getByText('The customer will pay the commission'));

    expect(onChange).toHaveBeenCalledWith('customer');
  });

  it('locks the options and shows a spinner while the pick is saving', () => {
    render(<CommissionPicker value="split" onChange={() => {}} isSaving />);

    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
    expect(screen.getByTestId('icon-Loading03Icon')).toBeInTheDocument();
  });

  it('leaves the options clickable when nothing is saving', () => {
    render(<CommissionPicker value="split" onChange={() => {}} />);

    screen.getAllByRole('button').forEach((button) => expect(button).toBeEnabled());
    expect(screen.queryByTestId('icon-Loading03Icon')).not.toBeInTheDocument();
  });
});
