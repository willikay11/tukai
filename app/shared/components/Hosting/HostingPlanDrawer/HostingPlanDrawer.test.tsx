import { useEffect } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  HostingPlanProvider,
  OpenHostingPlanOptions,
  useHostingPlan,
} from '@/context/HostingPlanContext';
import { HOSTING_PLAN_STORAGE_KEY } from '@/types/hostingPlan';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Start hosting experiences on Tukai.',
    priceAmount: 0,
    priceCurrency: 'USD',
    priceLabel: 'Free',
    commissionPct: 8,
    icon: 'Plant02Icon',
    features: ['Up to 3 live experiences'],
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
  },
];

const subscribeToPlan = jest.fn((planId: string, paymentMethod: string) =>
  Promise.resolve({
    planId,
    status: 'active',
    paymentMethod,
    currentPeriodEnd: '2026-12-01T00:00:00.000Z',
    dateSubscribed: '2026-11-01T00:00:00.000Z',
  }),
);
const startFreePlan = jest.fn((planId: string) =>
  Promise.resolve({
    planId,
    status: 'active',
    paymentMethod: null,
    currentPeriodEnd: '2026-12-01T00:00:00.000Z',
    dateSubscribed: '2026-11-01T00:00:00.000Z',
  }),
);
const changePlan = jest.fn((planId: string, current: Record<string, unknown>) =>
  Promise.resolve({ ...current, planId, status: 'active' }),
);

jest.mock('@/services/hostingPlans', () => ({
  fetchHostingPlans: jest.fn(() => Promise.resolve(PLANS)),
  getHostingPlan: (id: string) => PLANS.find((plan) => plan.id === id),
  subscribeToPlan: (planId: string, paymentMethod: string) =>
    subscribeToPlan(planId, paymentMethod),
  startFreePlan: (planId: string) => startFreePlan(planId),
  changePlan: (planId: string, current: Record<string, unknown>) => changePlan(planId, current),
  cancelPlan: jest.fn((current) => Promise.resolve({ ...current, status: 'cancel_pending' })),
  resumePlan: jest.fn((current) => Promise.resolve({ ...current, status: 'active' })),
}));

/** Opens the drawer on mount with the given options, through the real context. */
const OpenOnMount = ({ options }: { options?: OpenHostingPlanOptions }) => {
  const hostingPlan = useHostingPlan()!;

  useEffect(() => {
    hostingPlan.openHostingPlanFlow(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

const renderDrawer = (options?: OpenHostingPlanOptions) =>
  render(
    <HostingPlanProvider>
      <OpenOnMount options={options} />
    </HostingPlanProvider>,
  );

describe('HostingPlanDrawer', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('picking a plan and continuing opens the Subscribe view, disabled until a number is entered', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await screen.findByText('Pick a plan to start hosting');

    await user.click(screen.getByRole('radio', { name: /Premium/ }));
    await user.click(screen.getByRole('button', { name: 'Continue with Premium' }));

    await screen.findByText('Subscribe to Premium');
    const pay = screen.getByRole('button', { name: /Pay \$15 and subscribe/ });
    expect(pay).toBeDisabled();

    await user.type(screen.getByRole('textbox'), '712345678');
    expect(pay).toBeEnabled();

    await user.click(pay);

    expect(subscribeToPlan).toHaveBeenCalledWith('premium', 'mpesa');
  });

  it('with an active plan, picking a different one switches immediately with no checkout', async () => {
    window.localStorage.setItem(
      HOSTING_PLAN_STORAGE_KEY,
      JSON.stringify({
        planId: 'basic',
        status: 'active',
        paymentMethod: 'mpesa',
        currentPeriodEnd: '2026-12-01T00:00:00.000Z',
        dateSubscribed: '2026-11-01T00:00:00.000Z',
      }),
    );

    const user = userEvent.setup();
    renderDrawer();

    await screen.findByText('Change your plan');
    expect(screen.getByText('Current plan')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /Premium/ }));
    await user.click(screen.getByRole('button', { name: 'Switch to Premium' }));

    expect(changePlan).toHaveBeenCalledWith(
      'premium',
      expect.objectContaining({ planId: 'basic', status: 'active' }),
    );
  });

  it('the current plan cannot be re-picked in change mode', async () => {
    window.localStorage.setItem(
      HOSTING_PLAN_STORAGE_KEY,
      JSON.stringify({
        planId: 'basic',
        status: 'active',
        paymentMethod: 'mpesa',
        currentPeriodEnd: '2026-12-01T00:00:00.000Z',
        dateSubscribed: '2026-11-01T00:00:00.000Z',
      }),
    );

    renderDrawer();

    await screen.findByText('Change your plan');
    expect(screen.getByRole('radio', { name: /Basic/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Your current plan' })).toBeDisabled();
  });

  it('picking the free plan starts it straight away, with no Subscribe step', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await screen.findByText('Pick a plan to start hosting');

    await user.click(screen.getByRole('radio', { name: /Basic/ }));
    await user.click(screen.getByRole('button', { name: 'Start with Basic' }));

    expect(startFreePlan).toHaveBeenCalledWith('basic');
    expect(screen.queryByText('Subscribe to Basic')).not.toBeInTheDocument();
  });

  it('Compare every feature closes the drawer and goes to the Pricing page', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await screen.findByText('Pick a plan to start hosting');
    await user.click(screen.getByRole('button', { name: /Compare every feature/ }));

    expect(push).toHaveBeenCalledWith('/pricing');
  });
});
