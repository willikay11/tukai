import { useEffect } from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  CreateExperienceDrawerProvider,
  OpenCreateExperienceOptions,
  useCreateExperienceDrawer,
} from '@/context/CreateExperienceDrawerContext';
import { HostingPlanProvider } from '@/context/HostingPlanContext';
import { HOSTING_PLAN_STORAGE_KEY } from '@/types/hostingPlan';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-1' } }, status: 'authenticated' }),
}));

// Pulled in transitively by HostingPlanDrawer (mounted by HostingPlanProvider
// below), for its "Compare every feature" link - not under test here.
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({
  toast: (...args: unknown[]) => toast(...args),
  useToast: () => ({ toast }),
}));

const cancelExperience = jest.fn().mockResolvedValue({});
jest.mock('@/services/experience', () => ({
  cancelExperience: (id: string) => cancelExperience(id),
}));

jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperiences: jest.fn(() => ({
    data: { data: { results: [] } },
    isLoading: false,
    refetch: jest.fn(),
  })),
}));

// The wizard hook has its own extensive test suite
// (useCreateExperienceFlow.test.ts) - mocked here as a controllable fake so
// this file can focus on the drawer's own entry-gate and Leave-guard logic.
const mockFlow: Record<string, unknown> = {};
jest.mock('@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow', () => ({
  useCreateExperienceFlow: () => mockFlow,
}));

jest.mock('@/app/(experiences)/experiences/create/components/steps', () => ({
  CreateExperienceSteps: () => <div data-testid="wizard" />,
}));

jest.mock('@/app/(experiences)/experiences/create/components/ResumeDraft', () => ({
  ResumeDraft: ({
    onContinue,
    onClearAndStartFresh,
  }: {
    onContinue: () => void;
    onClearAndStartFresh: () => void;
  }) => (
    <div data-testid="resume-draft">
      <button onClick={onContinue}>Continue draft</button>
      <button onClick={onClearAndStartFresh}>Start fresh</button>
    </div>
  ),
}));

const setMockFlow = (overrides: Record<string, unknown>) => {
  Object.keys(mockFlow).forEach((key) => delete mockFlow[key]);
  Object.assign(mockFlow, {
    activeStep: 'dates-type',
    experienceId: null,
    experience: undefined,
    isLoadingExperience: false,
    formData: { dateType: {}, about: {}, tickets: {}, invite: {}, wallet: {}, itineraryDays: [] },
    updateFormData: jest.fn(),
    updateAboutFormData: jest.fn(),
    updateTicketsFormData: jest.fn(),
    updateInviteFormData: jest.fn(),
    updateItineraryDays: jest.fn(),
    updateWalletFormData: jest.fn(),
    dateTypeErrors: {},
    aboutErrors: {},
    ticketsErrors: {},
    walletErrors: {},
    communitiesForSelector: [],
    validateDateType: jest.fn(() => true),
    validateAbout: jest.fn(() => true),
    validateTickets: jest.fn(() => true),
    validateWallet: jest.fn(() => true),
    wallets: [],
    isWalletsLoading: false,
    hasSavedWallets: false,
    walletMutations: {},
    isSavingExperience: false,
    apiError: null,
    registerFlusher: jest.fn(),
    previewExperience: undefined,
    slotTemplateRecords: [],
    handlers: {
      handleStepChange: jest.fn(),
      handleExperienceCreated: jest.fn(),
      handleDatesUpdatedSuccess: jest.fn(),
      handleItineraryCustomise: jest.fn(),
      handleInvitesChange: jest.fn(),
      handleSaveAbout: jest.fn(),
      handleSaveItineraryDays: jest.fn(),
      handleDeleteItineraryDay: jest.fn(),
      handlePublish: jest.fn().mockResolvedValue(true),
      handleUpdateFeesAllocation: jest.fn(),
    },
    ...overrides,
  });
};

const OpenOnMount = ({ options }: { options?: OpenCreateExperienceOptions }) => {
  const { openCreateExperience } = useCreateExperienceDrawer()!;

  useEffect(() => {
    openCreateExperience(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

const renderDrawer = (options?: OpenCreateExperienceOptions) =>
  render(
    <HostingPlanProvider>
      <CreateExperienceDrawerProvider>
        <OpenOnMount options={options} />
      </CreateExperienceDrawerProvider>
    </HostingPlanProvider>,
  );

describe('CreateExperienceDrawer', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
    setMockFlow({});
  });

  it('with no active hosting plan, opening the drawer opens Choose a plan instead', async () => {
    renderDrawer();

    await screen.findByText('Pick a plan to start hosting');
    expect(screen.queryByTestId('wizard')).not.toBeInTheDocument();
  });

  it('with an active plan and no draft, opens straight into the wizard', async () => {
    window.localStorage.setItem(
      HOSTING_PLAN_STORAGE_KEY,
      JSON.stringify({ planId: 'basic', status: 'active', paymentMethod: 'mpesa' }),
    );

    renderDrawer();

    expect(await screen.findByTestId('wizard')).toBeInTheDocument();
  });

  it('jumps straight to the wizard when opened with an explicit step or experienceId', async () => {
    window.localStorage.setItem(
      HOSTING_PLAN_STORAGE_KEY,
      JSON.stringify({ planId: 'basic', status: 'active', paymentMethod: 'mpesa' }),
    );

    renderDrawer({ experienceId: 'exp-1' });

    expect(await screen.findByTestId('wizard')).toBeInTheDocument();
  });

  it('closing with no in-progress draft closes immediately, no Leave confirm', async () => {
    window.localStorage.setItem(
      HOSTING_PLAN_STORAGE_KEY,
      JSON.stringify({ planId: 'basic', status: 'active', paymentMethod: 'mpesa' }),
    );
    setMockFlow({ experienceId: null });

    renderDrawer();
    await screen.findByTestId('wizard');

    fireEvent.click(screen.getByLabelText('Close'));

    await waitFor(() => expect(screen.queryByTestId('wizard')).not.toBeInTheDocument());
    expect(screen.queryByText('Save your experience before you leave?')).not.toBeInTheDocument();
  });

  it('closing with an in-progress draft opens the Leave confirm; Keep editing dismisses it', async () => {
    window.localStorage.setItem(
      HOSTING_PLAN_STORAGE_KEY,
      JSON.stringify({ planId: 'basic', status: 'active', paymentMethod: 'mpesa' }),
    );
    setMockFlow({ experienceId: 'exp-1' });

    renderDrawer();
    await screen.findByTestId('wizard');

    fireEvent.click(screen.getByLabelText('Close'));
    await screen.findByText('Save your experience before you leave?');

    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));

    await waitFor(() =>
      expect(screen.queryByText('Save your experience before you leave?')).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId('wizard')).toBeInTheDocument();
  });

  it('Discard experience cancels the draft and closes the drawer', async () => {
    window.localStorage.setItem(
      HOSTING_PLAN_STORAGE_KEY,
      JSON.stringify({ planId: 'basic', status: 'active', paymentMethod: 'mpesa' }),
    );
    setMockFlow({ experienceId: 'exp-1' });

    renderDrawer();
    await screen.findByTestId('wizard');

    fireEvent.click(screen.getByLabelText('Close'));
    await screen.findByText('Save your experience before you leave?');

    fireEvent.click(screen.getByRole('button', { name: 'Discard experience' }));

    await waitFor(() => expect(cancelExperience).toHaveBeenCalledWith('exp-1'));
    await waitFor(() => expect(screen.queryByTestId('wizard')).not.toBeInTheDocument());
  });

  it('a saved draft shows Resume first; Continue proceeds to the wizard', async () => {
    window.localStorage.setItem(
      HOSTING_PLAN_STORAGE_KEY,
      JSON.stringify({ planId: 'basic', status: 'active', paymentMethod: 'mpesa' }),
    );

    const useExperiences = jest.requireMock('@/app/shared/hooks/useExperiences').useExperiences;
    useExperiences.mockReturnValue({
      data: { data: { results: [{ id: 'draft-1', status: 'draft', dateCreated: '2026-01-01' }] } },
      isLoading: false,
      refetch: jest.fn(),
    });

    renderDrawer();

    expect(await screen.findByTestId('resume-draft')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue draft' }));

    expect(await screen.findByTestId('wizard')).toBeInTheDocument();
  });
});
