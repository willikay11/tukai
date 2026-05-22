import { render, screen } from '@testing-library/react';

import { RelativeValidityPicker } from './RelativeValidityPicker';

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => <div />,
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: () => <span data-testid="icon" />,
}));

describe('RelativeValidityPicker', () => {
  it('renders start and end sections', () => {
    const onChange = jest.fn();
    render(
      <RelativeValidityPicker
        startValue={{ amount: 1, unit: 'hour', anchor: 'start' }}
        endValue={{ amount: 1, unit: 'hour', anchor: 'end' }}
        onStartChange={onChange}
        onEndChange={onChange}
        errors={{}}
      />,
    );

    expect(screen.getByText('Sales Start')).toBeInTheDocument();
    expect(screen.getByText('Sales End')).toBeInTheDocument();
  });

  it('renders label with info icon', () => {
    const onChange = jest.fn();
    render(
      <RelativeValidityPicker
        startValue={{ amount: 1, unit: 'hour', anchor: 'start' }}
        endValue={{ amount: 1, unit: 'hour', anchor: 'end' }}
        onStartChange={onChange}
        onEndChange={onChange}
        errors={{}}
      />,
    );

    expect(screen.getByText(/Ticket Sales Validity/)).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('displays error messages', () => {
    const onChange = jest.fn();
    render(
      <RelativeValidityPicker
        startValue={{ amount: 1, unit: 'hour', anchor: 'start' }}
        endValue={{ amount: 1, unit: 'hour', anchor: 'end' }}
        onStartChange={onChange}
        onEndChange={onChange}
        errors={{
          salesStartRelative: 'Start time is required',
          salesEndRelative: 'End time is required',
        }}
      />,
    );

    expect(screen.getByText('Start time is required')).toBeInTheDocument();
    expect(screen.getByText('End time is required')).toBeInTheDocument();
  });
});
