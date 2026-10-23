import { useEffect } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  HostingPlanProvider,
  OpenHostingPlanOptions,
  useHostingPlan,
} from '@/context/HostingPlanContext';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const openCreateCommunity = jest.fn();
jest.mock('@/context/CreateCommunityDrawerContext', () => ({
  useCreateCommunityDrawer: () => ({ openCreateCommunity, isOpen: false, closeCreateCommunity: jest.fn() }),
}));

// The real component is a Paystack-hosted iframe watched via postMessage -
// stood in here with buttons that drive its onPaymentSuccess callback directly.
jest.mock('@/components/ui/paystack', () => ({
  Paystack: ({ onPaymentSuccess }: { onPaymentSuccess: (success: boolean) => void }) => (
    <div data-testid="paystack-checkout">
      <button type="button" onClick={() => onPaymentSuccess(true)}>
        Simulate successful payment
      </button>
      <button type="button" onClick={() => onPaymentSuccess(false)}>
        Simulate cancelled payment
      </button>
    </div>
  ),
}));

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Start hosting experiences on Tukai.',
    priceAmount: 1,
    priceCurrency: 'USD',
    priceLabel: '$1 / month',
    commissionPct: 8,
    icon: 'Plant02Icon',
    features: ['Up to 3 live experiences'],
    backendId: 'plan-basic-uuid',
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Grow your experience business with advanced tools & visibility.',
    priceAmount: 15,
    priceCurrency: 'USD',
    priceLabel: '$15 / month',
    commissionPct: 3.5,
    icon: 'Rocket01Icon',
    features: ['Unlimited live experiences'],
    isMostPopular: true,
    backendId: 'plan-premium-uuid',
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For operators managing teams & high-volume bookings.',
    priceAmount: 49,
    priceCurrency: 'USD',
    priceLabel: '$49 / month',
    commissionPct: 3,
    icon: 'Building03Icon',
    features: ['Everything in Premium'],
    aiFeatures: [{ icon: 'SparklesIcon', text: 'Writes experience pages' }],
    backendId: 'plan-business-uuid',
  },
];

const fetchCurrentHostingSubscription = jest.fn(() => Promise.resolve(null));

const startHostingCheckout = jest.fn((planId: string) =>
  Promise.resolve({
    subscriptionId: `sub-${planId}`,
    authorizationUrl: 'https://checkout.paystack.com/test-ref',
  }),
);

const confirmHostingSubscription = jest.fn((subscriptionId: string) =>
  Promise.resolve({
    planId: subscriptionId.replace('sub-', ''),
    status: 'active',
    currentPeriodEnd: '2026-12-01T00:00:00.000Z',
    dateSubscribed: '2026-11-01T00:00:00.000Z',
    subscriptionId,
  }),
);

const cancelHostingSubscription = jest.fn((_subscriptionId: string) =>
  Promise.resolve({
    planId: null,
    status: 'none',
    currentPeriodEnd: null,
    dateSubscribed: null,
    subscriptionId: null,
  }),
);

jest.mock('@/services/hostingPlans', () => ({
  fetchHostingPlans: () => Promise.resolve(PLANS),
  fetchCurrentHostingSubscription: () => fetchCurrentHostingSubscription(),
  getHostingPlan: (id: string) => PLANS.find((plan) => plan.id === id),
  startHostingCheckout: (planId: string) => startHostingCheckout(planId),
  confirmHostingSubscription: (subscriptionId: string) => confirmHostingSubscription(subscriptionId),
  cancelHostingSubscription: (subscriptionId: string) => cancelHostingSubscription(subscriptionId),
  resumeHostingSubscription: jest.fn((current) => Promise.resolve({ ...current, status: 'active' })),
}));

/**
 * Opens the drawer on mount with the given options, through the real
 * context - and exposes a button to reopen it, since there's no
 * localStorage to seed an "already has a plan" state from: a test that
 * needs change mode drives a real subscribe first, then reopens.
 */
const OpenOnMount = ({ options }: { options?: OpenHostingPlanOptions }) => {
  const hostingPlan = useHostingPlan()!;

  useEffect(() => {
    hostingPlan.openHostingPlanFlow(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button type="button" onClick={() => hostingPlan.openHostingPlanFlow(options)}>
      Reopen
    </button>
  );
};

const renderDrawer = (options?: OpenHostingPlanOptions) =>
  render(
    <HostingPlanProvider>
      <OpenOnMount options={options} />
    </HostingPlanProvider>,
  );

describe('HostingPlanDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchCurrentHostingSubscription.mockResolvedValue(null);
  });

  it('Continue starts a Paystack checkout straight away, no billing form of our own', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await screen.findByText('Pick a plan to start hosting');

    await user.click(screen.getByRole('radio', { name: /Premium/ }));
    await user.click(screen.getByRole('button', { name: 'Continue with Premium' }));

    await screen.findByText('Subscribe to Premium');
    await screen.findByTestId('paystack-checkout');
    // No billing form anywhere in this view - Paystack's own page collects payment details
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(startHostingCheckout).toHaveBeenCalledWith('premium');
    expect(confirmHostingSubscription).not.toHaveBeenCalled();
  });

  it('a successful payment shows the confirming panel, then activates the plan and opens Create community', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await screen.findByText('Pick a plan to start hosting');
    await user.click(screen.getByRole('radio', { name: /Premium/ }));
    await user.click(screen.getByRole('button', { name: 'Continue with Premium' }));

    await screen.findByTestId('paystack-checkout');
    await user.click(screen.getByRole('button', { name: 'Simulate successful payment' }));

    await screen.findByText('Paying Tukai');
    screen.getByText('$15.00');
    screen.getByText('Confirming your payment with Paystack. This takes a few seconds.');
    expect(confirmHostingSubscription).not.toHaveBeenCalled();

    await waitFor(() => expect(confirmHostingSubscription).toHaveBeenCalledWith('sub-premium'), {
      timeout: 3000,
    });
    // No toast - straight into Create community, since a new host needs one
    // to publish an experience under.
    await waitFor(() => expect(openCreateCommunity).toHaveBeenCalled());
  });

  it('a failed payment shows the error above the checkout, which stays open to retry', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await screen.findByText('Pick a plan to start hosting');
    await user.click(screen.getByRole('radio', { name: /Premium/ }));
    await user.click(screen.getByRole('button', { name: 'Continue with Premium' }));

    await screen.findByTestId('paystack-checkout');
    await user.click(screen.getByRole('button', { name: 'Simulate cancelled payment' }));

    await screen.findByRole('alert');
    expect(
      screen.getByText(/The payment didn.t go through, so nothing was charged/),
    ).toBeInTheDocument();
    // The same checkout frame is still there to try again
    expect(screen.getByTestId('paystack-checkout')).toBeInTheDocument();
    expect(confirmHostingSubscription).not.toHaveBeenCalled();
  });

  it('Back on Subscribe returns to Choose a plan with nothing charged', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await screen.findByText('Pick a plan to start hosting');
    await user.click(screen.getByRole('radio', { name: /Premium/ }));
    await user.click(screen.getByRole('button', { name: 'Continue with Premium' }));

    await screen.findByText('Subscribe to Premium');
    await user.click(screen.getByLabelText('Back'));

    await screen.findByText('Pick a plan to start hosting');
    expect(screen.getByRole('radio', { name: /Premium/ })).toHaveAttribute('aria-checked', 'true');
    expect(confirmHostingSubscription).not.toHaveBeenCalled();
  });

  /** Drives a real subscribe to Basic through the UI, then closes - the
   * only way to reach "already has a plan" now that there's no
   * localStorage to seed it from. */
  const subscribeToBasicThenClose = async (user: ReturnType<typeof userEvent.setup>) => {
    await screen.findByText('Pick a plan to start hosting');
    await user.click(screen.getByRole('radio', { name: /Basic/ }));
    await user.click(screen.getByRole('button', { name: 'Continue with Basic' }));

    await screen.findByTestId('paystack-checkout');
    await user.click(screen.getByRole('button', { name: 'Simulate successful payment' }));

    await waitFor(() => expect(confirmHostingSubscription).toHaveBeenCalledWith('sub-basic'), {
      timeout: 3000,
    });
  };

  it('with an active plan, picking a different one cancels it and starts a fresh checkout', async () => {
    const user = userEvent.setup();
    renderDrawer();
    await subscribeToBasicThenClose(user);

    await user.click(screen.getByRole('button', { name: 'Reopen' }));

    await screen.findByText('Change your plan');
    expect(screen.getByText('Current plan')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /Premium/ }));
    await user.click(screen.getByRole('button', { name: 'Switch to Premium' }));

    await waitFor(() => expect(cancelHostingSubscription).toHaveBeenCalledWith('sub-basic'));
    // No atomic "change plan" endpoint - switching cancels the old
    // subscription, then pays for the new one through the same checkout.
    await screen.findByText('Subscribe to Premium');
    expect(startHostingCheckout).toHaveBeenCalledWith('premium');
  });

  it('the current plan cannot be re-picked in change mode', async () => {
    const user = userEvent.setup();
    renderDrawer();
    await subscribeToBasicThenClose(user);

    await user.click(screen.getByRole('button', { name: 'Reopen' }));

    await screen.findByText('Change your plan');
    expect(screen.getByRole('radio', { name: /Basic/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Your current plan' })).toBeDisabled();
  });

  it('Compare every feature closes the drawer and goes to the Pricing page', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await screen.findByText('Pick a plan to start hosting');
    await user.click(screen.getByRole('button', { name: /Compare every feature/ }));

    expect(push).toHaveBeenCalledWith('/pricing');
  });
});
