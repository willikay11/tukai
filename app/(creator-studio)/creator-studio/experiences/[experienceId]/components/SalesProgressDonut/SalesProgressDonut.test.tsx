import React from 'react';

import { render, screen } from '@testing-library/react';

import { SalesProgressDonut } from './index';

// recharts needs a measurable container, which jsdom does not provide
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ data, children }: { data: { name: string; value: number }[]; children: React.ReactNode }) => (
    <div data-testid="pie" data-slices={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Cell: () => null,
}));

const slices = () => JSON.parse(screen.getByTestId('pie').getAttribute('data-slices') ?? '[]');

describe('SalesProgressDonut', () => {
  it('shows the percentage and the sold-of-total label', () => {
    render(<SalesProgressDonut sold={4} total={15} percent={27} />);

    expect(screen.getByText('27%')).toBeInTheDocument();
    expect(screen.getByText('4 / 15 sold')).toBeInTheDocument();
  });

  it('splits the ring into sold and remaining', () => {
    render(<SalesProgressDonut sold={4} total={15} percent={27} />);

    expect(slices()).toEqual([
      { name: 'sold', value: 4 },
      { name: 'remaining', value: 11 },
    ]);
  });

  it('shows a full ring rather than an empty chart when nothing exists', () => {
    render(<SalesProgressDonut sold={0} total={0} percent={0} />);

    expect(slices()).toEqual([{ name: 'remaining', value: 1 }]);
    expect(screen.getByText('0 / 0 sold')).toBeInTheDocument();
  });

  it('never renders a negative remaining slice when oversold', () => {
    render(<SalesProgressDonut sold={20} total={15} percent={100} />);

    expect(slices()).toEqual([
      { name: 'sold', value: 20 },
      { name: 'remaining', value: 0 },
    ]);
  });
});
