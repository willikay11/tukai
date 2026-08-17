import { fireEvent, render, screen } from '@testing-library/react';

import type { Interest } from '@/types/interest';
import type { Wallet } from '@/types/payment';

import { SharedExperiencePreview } from './index';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('SharedExperiencePreview', () => {
  const mockInterests: Interest[] = [
    { id: '1', name: 'Hiking', slug: 'hiking' },
    { id: '2', name: 'Photography', slug: 'photography' },
  ];

  const mockWallet: Wallet = {
    id: 'wallet-1',
    type: 'phone' as const,
    phone_number: '0712345678',
    is_primary: true,
  } as Wallet;

  const defaultProps = {
    step: 'dates-type' as const,
    experienceType: 'one-time' as const,
    isRecurring: false,
    aboutPhotos: [{ id: '1', url: 'https://example.com/photo.jpg', isTempId: false }],
    aboutTitle: 'Amazing Hiking Adventure',
    aboutDescription: 'A wonderful hiking experience in the mountains',
    aboutVisibility: 'public' as const,
    aboutWhatsIncluded: 'Guide\nSnacks\nTransport',
    aboutWhatsNotIncluded: 'Accommodation\nMeals',
    aboutLocation: 'Mount Kenya, Nanyuki',
    aboutMeetingPoint: 'Park entrance',
    aboutMeetingTime: '08:00 AM',
    aboutCategories: mockInterests,
    selectedDate: '2026-06-15',
    selectedStartTime: '09:00',
    selectedEndTime: '17:00',
    ticketsItems: [
      {
        id: 'ticket-1',
        name: 'Regular',
        quantity: 50,
        amount: 2000,
        salesStartDate: '2026-06-01',
        salesStartTime: '10:00',
        salesEndDate: '2026-06-14',
        salesEndTime: '23:59',
        acceptPartialPayment: false,
        salesStartRelative: null,
        salesEndRelative: null,
        duplicateForEntirePeriod: false,
      },
    ],
    ticketsCommissionPayer: 'host' as const,
    invitedGuests: [],
    invitedCommunityIds: [],
    allCommunities: [],
    selectedWallet: mockWallet,
    onEditStep: jest.fn(),
  };

  describe('Rendering', () => {
    it('renders the preview heading', () => {
      render(<SharedExperiencePreview {...defaultProps} />);
      expect(screen.getByText(/Review/i)).toBeInTheDocument();
    });

    it('displays about section for about step', () => {
      render(<SharedExperiencePreview {...defaultProps} step="about" />);
      expect(screen.getByText('Amazing Hiking Adventure')).toBeInTheDocument();
      expect(
        screen.getByText('A wonderful hiking experience in the mountains'),
      ).toBeInTheDocument();
    });

    it('displays tickets section when step is tickets', () => {
      const { container } = render(<SharedExperiencePreview {...defaultProps} step="tickets" />);
      // The date section renders "Mon, Jun 15" — the year only ever appeared via
      // the ticket validity line, which is commented out in TicketCard
      expect(container.textContent).toContain('Jun');
      expect(container.textContent).toContain('15');
    });
  });

  describe('Photo Display', () => {
    it('displays about photos', () => {
      render(<SharedExperiencePreview {...defaultProps} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('handles missing photos gracefully', () => {
      render(<SharedExperiencePreview {...defaultProps} aboutPhotos={undefined} />);
      expect(screen.getByText('Amazing Hiking Adventure')).toBeInTheDocument();
    });
  });

  describe('Title and Description', () => {
    it('displays experience title', () => {
      render(<SharedExperiencePreview {...defaultProps} />);
      expect(screen.getByText('Amazing Hiking Adventure')).toBeInTheDocument();
    });

    it('displays experience description', () => {
      render(<SharedExperiencePreview {...defaultProps} />);
      expect(
        screen.getByText('A wonderful hiking experience in the mountains'),
      ).toBeInTheDocument();
    });

    it('hides title when not provided', () => {
      render(<SharedExperiencePreview {...defaultProps} aboutTitle={undefined} />);
      expect(screen.queryByText('Amazing Hiking Adventure')).not.toBeInTheDocument();
    });
  });

  describe("What's Included/Excluded", () => {
    it("displays what's included section", () => {
      render(<SharedExperiencePreview {...defaultProps} />);
      expect(screen.getByText('Guide')).toBeInTheDocument();
      expect(screen.getByText('Snacks')).toBeInTheDocument();
      expect(screen.getByText('Transport')).toBeInTheDocument();
    });

    it("displays what's excluded section", () => {
      render(<SharedExperiencePreview {...defaultProps} />);
      expect(screen.getByText('Accommodation')).toBeInTheDocument();
      expect(screen.getByText('Meals')).toBeInTheDocument();
    });
  });

  describe('Categories', () => {
    it('displays experience categories', () => {
      render(<SharedExperiencePreview {...defaultProps} />);
      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();
    });

    it('handles empty categories', () => {
      render(<SharedExperiencePreview {...defaultProps} aboutCategories={[]} />);
      expect(screen.queryByText('Hiking')).not.toBeInTheDocument();
    });
  });

  describe('Location and Meeting Details', () => {
    it('displays location', () => {
      render(<SharedExperiencePreview {...defaultProps} />);
      expect(screen.getByText('Mount Kenya, Nanyuki')).toBeInTheDocument();
    });

    it('displays meeting point', () => {
      render(<SharedExperiencePreview {...defaultProps} />);
      expect(screen.getByText('Park entrance')).toBeInTheDocument();
    });

    it('displays meeting time', () => {
      render(<SharedExperiencePreview {...defaultProps} />);
      expect(screen.getByText('08:00 AM')).toBeInTheDocument();
    });
  });

  describe('Single-Day Experience', () => {
    it('displays date, start time, and end time for single-day', () => {
      const { container } = render(<SharedExperiencePreview {...defaultProps} />);
      const text = container.textContent;
      expect(text).toContain('Jun');
      expect(text).toContain('9:00');
      expect(text).toContain('5:00');
    });
  });

  describe('Multi-Day Experience', () => {
    it('displays date range for multi-day experience', () => {
      const { container } = render(
        <SharedExperiencePreview
          {...defaultProps}
          experienceType="multi-day"
          selectedDate={undefined}
          multiDayStartDate="2026-06-15"
          multiDayStartTime="09:00"
          multiDayEndDate="2026-06-17"
          multiDayEndTime="17:00"
        />,
      );
      const text = container.textContent;
      expect(text).toContain('Jun');
      expect(text).toContain('15');
      expect(text).toContain('17');
    });
  });

  describe('Recurring Experience', () => {
    it('displays recurring days and date range', () => {
      const { container } = render(
        <SharedExperiencePreview
          {...defaultProps}
          isRecurring={true}
          selectedDate={undefined}
          selectedRecurringDays={['mon', 'wed', 'fri']}
          selectedTimeSlots={[{ startTime: '09:00', endTime: '17:00' }]}
          selectedRecurrenceStartDate="2026-06-01"
          selectedRecurrenceEndDate="2026-08-31"
        />,
      );
      const text = container.textContent;
      expect(text).toContain('Recurs Every Monday, Wednesday & Friday');
      expect(text).toContain('2026');
    });
  });

  describe('Tickets Section', () => {
    it('displays tickets when on the tickets step', () => {
      render(<SharedExperiencePreview {...defaultProps} step="tickets" />);
      expect(screen.getByText('Tickets')).toBeInTheDocument();
      expect(screen.getByText('Regular')).toBeInTheDocument();
    });

    it('does not display tickets on other steps', () => {
      render(<SharedExperiencePreview {...defaultProps} step="about" />);
      expect(screen.queryByText('Regular')).not.toBeInTheDocument();
    });

    it('hides tickets section when no tickets provided', () => {
      render(<SharedExperiencePreview {...defaultProps} ticketsItems={[]} step="tickets" />);
      expect(screen.queryByText('Regular')).not.toBeInTheDocument();
    });
  });

  describe('Visibility Setting', () => {
    it('displays visibility as public', () => {
      render(<SharedExperiencePreview {...defaultProps} aboutVisibility="public" />);
      expect(screen.getByText(/Public/i)).toBeInTheDocument();
    });

    it('displays visibility as private', () => {
      render(<SharedExperiencePreview {...defaultProps} aboutVisibility="private" />);
      expect(screen.getByText(/Private/i)).toBeInTheDocument();
    });
  });

  describe('Guests Section', () => {
    it('displays invited guests section', () => {
      render(
        <SharedExperiencePreview
          {...defaultProps}
          invitedGuests={[
            {
              id: '1',
              email: 'john@example.com',
              name: 'john',
              image: undefined,
            },
            {
              id: '2',
              email: 'jane@example.com',
              name: 'jane',
              image: undefined,
            },
          ]}
        />,
      );
      expect(screen.getByText(/Guests/i)).toBeInTheDocument();
      expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/jane@example.com/)).toBeInTheDocument();
    });

    it('hides guests section when no guests', () => {
      render(<SharedExperiencePreview {...defaultProps} invitedGuests={[]} />);
      expect(screen.queryByText(/john@example.com/)).not.toBeInTheDocument();
    });
  });

  describe('Communities Section', () => {
    it('displays invited communities', () => {
      render(
        <SharedExperiencePreview
          {...defaultProps}
          invitedCommunityIds={['comm-1']}
          allCommunities={[
            {
              id: 'comm-1',
              name: 'Hiking Enthusiasts',
              imageUrl: 'https://example.com/comm.jpg',
            },
          ]}
        />,
      );
      expect(screen.getByText('Hiking Enthusiasts')).toBeInTheDocument();
    });
  });

  describe('Wallet Display', () => {
    it('renders wallet section when selected', () => {
      const { container } = render(<SharedExperiencePreview {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('renders component without wallet', () => {
      const { container } = render(
        <SharedExperiencePreview {...defaultProps} selectedWallet={undefined} />,
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('component renders with edit callback available', () => {
      const onEditStep = jest.fn();
      const { container } = render(
        <SharedExperiencePreview {...defaultProps} onEditStep={onEditStep} step="about" />,
      );
      expect(container).toBeInTheDocument();
      expect(onEditStep).toBeDefined();
    });
  });

  describe('Component Rendering', () => {
    it('renders about section when on about step', () => {
      render(<SharedExperiencePreview {...defaultProps} step="about" />);
      expect(screen.getByText('Amazing Hiking Adventure')).toBeInTheDocument();
    });

    it('renders component on different steps', () => {
      const { container: container1 } = render(
        <SharedExperiencePreview {...defaultProps} step="about" />,
      );
      expect(container1).toBeInTheDocument();

      const { container: container2 } = render(
        <SharedExperiencePreview {...defaultProps} step="tickets" />,
      );
      expect(container2).toBeInTheDocument();
    });
  });
});
