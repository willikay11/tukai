import { ReactNode, useEffect } from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  CreateExperienceDrawerProvider,
  OpenCreateExperienceOptions,
  useCreateExperienceDrawer,
} from '@/context/CreateExperienceDrawerContext';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

// The Hosting plan drawer's own UI has its own test suite
// (HostingPlanDrawer.test.tsx) - mocked here as a controllable fake so this
// file can focus on the create-experience gate and the drawer's own
// entry-gate / Leave-guard logic, without depending on a real plan state.
const openHostingPlanFlow = jest.fn();
const mockHostingPlan: Record<string, unknown> = {};
const setMockHostingPlan = (overrides: Record<string, unknown>) => {
  Object.keys(mockHostingPlan).forEach((key) => delete mockHostingPlan[key]);
  Object.assign(mockHostingPlan, { hasActivePlan: false, openHostingPlanFlow, ...overrides });
};

jest.mock('@/context/HostingPlanContext', () => ({
  HostingPlanProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useHostingPlan: () => mockHostingPlan,
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
    <CreateExperienceDrawerProvider>
      <OpenOnMount options={options} />
    </CreateExperienceDrawerProvider>,
  );

// The step-tabs nav (aria-label="Steps") only renders once the wizard is
// showing Date & type (or another step) rather than the Intro or Resume
// screens - a stable, accessible stand-in for the old mocked "wizard" testid.
const findWizard = () => screen.findByRole('navigation', { name: 'Steps' });
const queryWizard = () => screen.queryByRole('navigation', { name: 'Steps' });

describe('CreateExperienceDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockFlow({});
    setMockHostingPlan({});
    jest.requireMock('@/app/shared/hooks/useExperiences').useExperiences.mockReturnValue({
      data: { data: { results: [] } },
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  it('with no active hosting plan, opening the drawer opens Choose a plan instead of the wizard', async () => {
    renderDrawer();

    await waitFor(() => expect(openHostingPlanFlow).toHaveBeenCalledWith({ view: 'choose' }));
    expect(queryWizard()).not.toBeInTheDocument();
  });

  it('with an active plan, no draft but a hosting history, opens straight into the wizard', async () => {
    setMockHostingPlan({ hasActivePlan: true });
    // A returning host (has a published experience, just no draft) skips the
    // Intro screen entirely - only a host who has never hosted sees it.
    jest.requireMock('@/app/shared/hooks/useExperiences').useExperiences.mockReturnValue({
      data: { data: { results: [{ id: 'live-1', status: 'published', dateCreated: '2026-01-01' }] } },
      isLoading: false,
      refetch: jest.fn(),
    });

    renderDrawer();

    expect(await findWizard()).toBeInTheDocument();
    expect(openHostingPlanFlow).not.toHaveBeenCalled();
  });

  it('a first-time host with no hosting history sees the Intro screen first', async () => {
    setMockHostingPlan({ hasActivePlan: true });

    renderDrawer();

    expect(await screen.findByText('No experiences... yet!')).toBeInTheDocument();
    expect(queryWizard()).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create experience' }));

    expect(await findWizard()).toBeInTheDocument();
  });

  it('jumps straight to the wizard when opened with an explicit step or experienceId', async () => {
    setMockHostingPlan({ hasActivePlan: true });
    // The real useCreateExperienceFlow seeds `experienceId` from this option
    // synchronously; the mocked hook below ignores its arguments, so this
    // stands in for that seeding.
    setMockFlow({ experienceId: 'exp-1' });

    renderDrawer({ experienceId: 'exp-1' });

    expect(await findWizard()).toBeInTheDocument();
  });

  it('closing with no in-progress draft closes immediately, no Leave confirm', async () => {
    setMockHostingPlan({ hasActivePlan: true });
    setMockFlow({ experienceId: null });

    renderDrawer();
    await screen.findByLabelText('Close');

    fireEvent.click(screen.getByLabelText('Close'));

    await waitFor(() => expect(screen.queryByLabelText('Close')).not.toBeInTheDocument());
    expect(screen.queryByText('Save your experience before you leave?')).not.toBeInTheDocument();
  });

  it('closing with an in-progress draft opens the Leave confirm; Keep editing dismisses it', async () => {
    setMockHostingPlan({ hasActivePlan: true });
    setMockFlow({ experienceId: 'exp-1' });

    renderDrawer();
    await findWizard();

    fireEvent.click(screen.getByLabelText('Close'));
    await screen.findByText('Save your experience before you leave?');

    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));

    await waitFor(() =>
      expect(screen.queryByText('Save your experience before you leave?')).not.toBeInTheDocument(),
    );
    expect(queryWizard()).toBeInTheDocument();
  });

  it('Discard experience cancels the draft and closes the drawer', async () => {
    setMockHostingPlan({ hasActivePlan: true });
    setMockFlow({ experienceId: 'exp-1' });

    renderDrawer();
    await findWizard();

    fireEvent.click(screen.getByLabelText('Close'));
    await screen.findByText('Save your experience before you leave?');

    fireEvent.click(screen.getByRole('button', { name: 'Discard experience' }));

    await waitFor(() => expect(cancelExperience).toHaveBeenCalledWith('exp-1'));
    await waitFor(() => expect(screen.queryByLabelText('Close')).not.toBeInTheDocument());
  });

  it('a saved draft shows Resume first; Continue proceeds to the wizard', async () => {
    setMockHostingPlan({ hasActivePlan: true });

    jest.requireMock('@/app/shared/hooks/useExperiences').useExperiences.mockReturnValue({
      data: { data: { results: [{ id: 'draft-1', status: 'draft', dateCreated: '2026-01-01' }] } },
      isLoading: false,
      refetch: jest.fn(),
    });

    renderDrawer();

    expect(await screen.findByText('Continue your draft?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue your draft' }));

    expect(await findWizard()).toBeInTheDocument();
  });
});
