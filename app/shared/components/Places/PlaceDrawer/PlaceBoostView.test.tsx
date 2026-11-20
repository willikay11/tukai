import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Place } from '@/types/place';

import { PlaceBoostView } from './PlaceBoostView';

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ toast: (...args: unknown[]) => toast(...args) }));
jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));

let paystackResult: ((paid: boolean) => void) | null = null;
jest.mock('@/components/ui/paystack', () => ({
  Paystack: ({
    url,
    onPaymentSuccess,
  }: {
    url: string;
    onPaymentSuccess: (paid: boolean) => void;
  }) => {
    paystackResult = onPaymentSuccess;
    return <iframe title="Paystack" src={url} />;
  },
}));

const PACKAGES = [
  {
    id: 'pk-week',
    name: 'One week',
    description: 'Top of search',
    durationDays: 7,
    price: { amount: '1000.00', currency: 'KES' },
  },
  {
    id: 'pk-month',
    name: 'One month',
    description: '',
    durationDays: 30,
    price: { amount: '3500.00', currency: 'KES' },
  },
];
let mockBoosts: unknown[] = [];
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useBoostPackages: () => ({ data: PACKAGES, isLoading: false }),
  usePlaceBoosts: () => ({ data: mockBoosts }),
}));

const buyPlaceBoost = jest.fn();
const fetchPlaceBoosts = jest.fn();
jest.mock('@/services/place', () => ({
  buyPlaceBoost: (...args: unknown[]) => buyPlaceBoost(...args),
  fetchPlaceBoosts: (...args: unknown[]) => fetchPlaceBoosts(...args),
}));

const place = { id: 'pl1', title: 'Kraftory', status: 'published' } as unknown as Place;

const renderView = (extra: Partial<Place> = {}) => {
  const onDone = jest.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PlaceBoostView place={{ ...place, ...extra } as Place} onDone={onDone} />
    </QueryClientProvider>,
  );
  return { onDone };
};

// DEV-392: a manager boosts a place, paying on Paystack in the drawer
describe('PlaceBoostView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBoosts = [];
    paystackResult = null;
  });

  it('offers the packages, the first picked, with its price on the button', () => {
    renderView();

    expect(screen.getByRole('radio', { name: /One week/ })).toBeChecked();
    expect(screen.getByText('7 days · Top of search')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /One month/ }));
    expect(screen.getByRole('button', { name: 'Pay KES 3,500.00' })).toBeInTheDocument();
  });

  it('starts the payment and shows Paystack’s checkout', async () => {
    buyPlaceBoost.mockResolvedValue({
      boost: { id: 'b9', status: 'pending' },
      checkoutUrl: 'https://checkout.paystack.com/x',
    });
    renderView();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Pay KES 1,000.00' }));
    });

    expect(buyPlaceBoost).toHaveBeenCalledWith(
      'pl1',
      'pk-week',
      expect.stringMatching(/^boost-pl1-/),
    );
    expect(screen.getByTitle('Paystack')).toHaveAttribute('src', 'https://checkout.paystack.com/x');
  });

  it('confirms the boost once Paystack and Tukai agree it is paid', async () => {
    buyPlaceBoost.mockResolvedValue({
      boost: { id: 'b9' },
      checkoutUrl: 'https://checkout.paystack.com/x',
    });
    fetchPlaceBoosts.mockResolvedValue([
      { id: 'b9', status: 'paid', startsAt: '2026-11-20T12:00:00', endsAt: '2026-11-27T12:00:00' },
    ]);
    const { onDone } = renderView();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Pay KES 1,000.00' }));
    });

    await act(async () => {
      paystackResult?.(true);
    });

    expect(toast).toHaveBeenCalledWith({
      title: 'Kraftory is boosted',
      description: 'It shows first from Fri 20 Nov to Fri 27 Nov.',
      variant: 'success',
    });
    expect(onDone).toHaveBeenCalled();
  });

  it('goes back to the packages when the payment is cancelled', async () => {
    buyPlaceBoost.mockResolvedValue({
      boost: { id: 'b9' },
      checkoutUrl: 'https://checkout.paystack.com/x',
    });
    renderView();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Pay KES 1,000.00' }));
    });

    act(() => paystackResult?.(false));

    expect(screen.queryByTitle('Paystack')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /One week/ })).toBeInTheDocument();
  });

  it('says why a boost could not be started', async () => {
    buyPlaceBoost.mockRejectedValue(new Error('Publish the place before boosting it.'));
    renderView();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Pay KES 1,000.00' }));
    });

    expect(toast).toHaveBeenCalledWith({
      title: 'The boost could not be started',
      description: 'Publish the place before boosting it.',
      variant: 'destructive',
    });
  });

  it('says how long a running boost lasts', () => {
    mockBoosts = [
      {
        id: 'b1',
        status: 'paid',
        isLive: true,
        startsAt: '2026-01-01T00:00:00Z',
        endsAt: '2099-11-28T12:00:00',
      },
    ];
    renderView();

    expect(screen.getByText(/Boosted until Sat 28 Nov\./)).toBeInTheDocument();
  });

  it('asks for the place to be published first', () => {
    renderView({ status: 'draft' } as unknown as Partial<Place>);

    expect(screen.getByText('Publish Kraftory before boosting it.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pay/ })).not.toBeInTheDocument();
  });
});
