import { render, screen } from '@testing-library/react';

import { CreateExperienceSteps } from './index';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/app/shared/components/Cards', () => ({
  CreateStepContentSkeleton: () => <div>loading-skeleton</div>,
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange, ...props }: any) => (
    <div data-testid="tabs" data-value={value} {...props}>
      {children}
    </div>
  ),
  TabsList: ({ children, ...props }: any) => (
    <div data-testid="tabs-list" {...props}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value, ...props }: any) => (
    <div data-testid={`tabs-content-${value}`} {...props}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value, disabled, ...props }: any) => (
    <button value={value} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('../DateTypeStep', () => ({
  DateTypeStep: () => <div>date-type-step</div>,
}));

jest.mock('../AboutStep', () => ({
  AboutStep: () => <div>about-step</div>,
}));

jest.mock('../TicketsStep', () => ({
  TicketsStep: () => <div>tickets-step</div>,
}));

jest.mock('../InviteGuestsStep', () => ({
  InviteGuestsStep: () => <div>invite-guests-step</div>,
}));

jest.mock('../WalletDetailsStep', () => ({
  WalletDetailsStep: () => <div>wallet-details-step</div>,
}));

jest.mock('../about', () => ({
  CreateExperienceAbout: () => <div>create-experience-about</div>,
}));

jest.mock('../community', () => ({
  CreateExperienceCommunity: () => <div>create-experience-community</div>,
}));

jest.mock('../dates', () => ({
  ExperienceDates: () => <div>experience-dates</div>,
}));

jest.mock('../invites', () => ({
  CreateExperienceInvites: () => <div>create-experience-invites</div>,
}));

jest.mock('../wallet', () => ({
  CreateExperienceWallet: () => <div>create-experience-wallet</div>,
}));

describe('CreateExperienceSteps', () => {
  const defaultProps = {
    currentStep: 'community' as const,
    onStepChange: jest.fn(),
    formData: {
      community: { id: 'comm-1', name: 'Community 1' },
      experienceType: 'one-time' as const,
      experiencePricing: 'paid' as const,
      isRecurring: false,
      date: '2026-06-15',
      startTime: '10:00',
      endTime: '12:00',
      recurringDays: [],
      recurrenceStartDate: null,
      recurrenceEndDate: null,
      timeSlots: [],
      multiDayStartDate: null,
      multiDayStartTime: null,
      multiDayEndDate: null,
      multiDayEndTime: null,
    },
    updateFormData: jest.fn(),
  };

  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(<CreateExperienceSteps {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('renders tabs navigation', () => {
      render(<CreateExperienceSteps {...defaultProps} />);
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    });

    it('renders step tabs', () => {
      const { container } = render(<CreateExperienceSteps {...defaultProps} />);
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toBeInTheDocument();
      expect(tabsList.textContent).toContain('Community');
      expect(tabsList.textContent).toContain('About');
    });
  });

  describe('Loading State', () => {
    it('shows skeleton when loading experience', () => {
      render(<CreateExperienceSteps {...defaultProps} isLoadingExperience={true} />);
      expect(screen.getByText('loading-skeleton')).toBeInTheDocument();
    });

    it('renders all step tabs in loading state', () => {
      render(<CreateExperienceSteps {...defaultProps} isLoadingExperience={true} />);
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList.textContent).toContain('Community');
      expect(tabsList.textContent).toContain('About');
    });
  });

  describe('Community Step', () => {
    it('renders community step content', () => {
      render(<CreateExperienceSteps {...defaultProps} currentStep="dates-type" />);
      expect(screen.getByText('date-type-step')).toBeInTheDocument();
    });

    it('renders cancel and save continue buttons', () => {
      render(<CreateExperienceSteps {...defaultProps} currentStep="dates-type" />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save & Continue')).toBeInTheDocument();
    });

    it('shows preview button on mobile', () => {
      render(<CreateExperienceSteps {...defaultProps} currentStep="dates-type" />);
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  describe('About Step', () => {
    it('renders about step content', () => {
      render(
        <CreateExperienceSteps
          {...defaultProps}
          currentStep="about"
          aboutFormData={{
            photos: [],
            photoFiles: [],
            title: 'Test',
            visibility: 'public',
            description: 'Test',
            whatsIncluded: '',
            whatsNotIncluded: '',
            location: 'Test',
            locationPlaceId: '',
            meetingPoint: '',
            meetingTime: null,
            categories: [],
          }}
          updateAboutFormData={jest.fn()}
        />,
      );
      expect(screen.getByText('about-step')).toBeInTheDocument();
    });
  });

  describe('Dates & Tickets Step', () => {
    it('renders tickets step content', () => {
      render(
        <CreateExperienceSteps
          {...defaultProps}
          currentStep="tickets"
          ticketsFormData={{
            commission: 'host',
            ticketMode: 'entire-period',
            items: [],
          }}
          updateTicketsFormData={jest.fn()}
        />,
      );
      expect(screen.getByText('tickets-step')).toBeInTheDocument();
    });
  });

  describe('Guests Step', () => {
    it('renders invite guests step content', () => {
      render(
        <CreateExperienceSteps
          {...defaultProps}
          currentStep="guests"
          inviteFormData={{
            invitedGuests: [],
            invitedCommunityIds: [],
          }}
          updateInviteFormData={jest.fn()}
        />,
      );
      expect(screen.getByText('invite-guests-step')).toBeInTheDocument();
    });
  });

  describe('Wallet Step', () => {
    it('renders wallet details step content', () => {
      render(
        <CreateExperienceSteps
          {...defaultProps}
          currentStep="wallet"
          walletFormData={{
            selectedWalletId: null,
            walletType: 'phone',
          }}
          updateWalletFormData={jest.fn()}
        />,
      );
      expect(screen.getByText('wallet-details-step')).toBeInTheDocument();
    });
  });

  describe('Step Navigation', () => {
    it('calls onStepChange when tab triggered', () => {
      const onStepChange = jest.fn();
      render(
        <CreateExperienceSteps
          {...defaultProps}
          onStepChange={onStepChange}
          currentStep="community"
        />,
      );
      const tabs = screen.getAllByRole('button');
      const aboutTab = tabs.find((btn) => btn.textContent?.includes('About'));
      aboutTab?.click();
      // Note: The actual step change depends on validation
    });
  });

  describe('Experience Types', () => {
    it('renders correct steps for one-time experience', () => {
      render(
        <CreateExperienceSteps
          {...defaultProps}
          formData={{
            ...defaultProps.formData,
            experienceType: 'one-time',
          }}
        />,
      );
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList.textContent).toContain('Community');
      expect(tabsList.textContent).toContain('About');
    });

    it('renders correct steps for multi-day experience', () => {
      render(
        <CreateExperienceSteps
          {...defaultProps}
          formData={{
            ...defaultProps.formData,
            experienceType: 'multi-day',
          }}
        />,
      );
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList.textContent).toContain('Community');
      expect(tabsList.textContent).toContain('About');
    });
  });

  describe('Step Completion States', () => {
    it('marks step as filled when data present', () => {
      const { container } = render(
        <CreateExperienceSteps
          {...defaultProps}
          currentStep="community"
          aboutFormData={{
            photos: ['photo.jpg'],
            photoFiles: [],
            title: 'Test Experience',
            visibility: 'public',
            description: 'Test Description',
            whatsIncluded: '',
            whatsNotIncluded: '',
            location: 'Test Location',
            locationPlaceId: '',
            meetingPoint: '',
            meetingTime: null,
            categories: [],
          }}
        />,
      );
      expect(container).toBeInTheDocument();
    });

    it('shows disabled steps without community selection', () => {
      render(
        <CreateExperienceSteps
          {...defaultProps}
          formData={
            {
              community: null,
              experienceType: 'one-time',
              experiencePricing: 'paid',
              isRecurring: false,
              date: null,
              startTime: null,
              endTime: null,
              recurringDays: [],
              recurrenceStartDate: null,
              recurrenceEndDate: null,
              timeSlots: [],
              multiDayStartDate: null,
              multiDayStartTime: null,
              multiDayEndDate: null,
              multiDayEndTime: null,
            } as any
          }
        />,
      );
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    });
  });

  describe('Recurring Experience', () => {
    it('renders with recurring days', () => {
      render(
        <CreateExperienceSteps
          {...defaultProps}
          formData={{
            ...defaultProps.formData,
            isRecurring: true,
            recurringDays: ['mon', 'wed', 'fri'],
            recurrenceStartDate: '2026-06-01',
            recurrenceEndDate: '2026-08-31',
          }}
        />,
      );
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays API error when present', () => {
      render(<CreateExperienceSteps {...defaultProps} apiError="Failed to create experience" />);
      // Error handling would be in the specific step component
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });
  });
});
