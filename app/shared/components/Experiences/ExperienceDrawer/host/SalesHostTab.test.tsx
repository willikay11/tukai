import { fireEvent, render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { SalesHostTab } from './SalesHostTab';

const toast = jest.fn();
let mockStats: unknown = undefined;

jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperienceTicketPurchases: () => ({ data: { data: { results: [] } }, isLoading: false }),
  useExperienceSalesStats: () => ({ data: mockStats }),
}));
jest.mock('@/app/shared/components/Images', () => ({ PlainImage: () => null }));
jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));
jest.mock('./HostActionBar', () => ({
  HostActionBar: () => null,
  messageAllBuyersAction: () => ({ label: 'Message all buyers', onClick: jest.fn() }),
}));

const kes = (amount: string) => ({ amount, currency: 'KES' });

const experience = {
  id: 'exp-1',
  title: 'Sunrise hike',
  currency: 'KES',
  timezone: 'Africa/Nairobi',
} as unknown as Experience;

describe('SalesHostTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStats = {
      currency: 'KES',
      revenue: kes('34839.00'),
      pendingBalance: kes('19959.00'),
      availableBalance: kes('12000.00'),
      ticketsSold: 30,
    };
  });

  // DEV-371: what buyers paid and what's still clearing, from the API
  it('shows sales, pending and tickets sold from the sales stats', () => {
    render(<SalesHostTab experience={experience} />);

    expect(screen.getByText('KES 34,839.00')).toBeInTheDocument();
    expect(screen.getByText('KES 19,959.00')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('says what can be withdrawn, without naming a fixed account', () => {
    render(<SalesHostTab experience={experience} />);

    fireEvent.click(screen.getByRole('button', { name: /Withdraw/ }));

    const { description } = toast.mock.calls[0][0];
    expect(description).toContain('KES 12,000.00 is available now');
    expect(description).toContain('KES 19,959.00 is still clearing');
    expect(description).not.toMatch(/ending 815/);
  });

  it('shows dashes until the sales stats load', () => {
    mockStats = undefined;
    render(<SalesHostTab experience={experience} />);

    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(2);
  });
});
