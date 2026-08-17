import { render, screen } from '@testing-library/react';

import { ExperienceStepSidePanel } from './index';

jest.mock('../SharedExperiencePreview', () => ({
  SharedExperiencePreview: ({ step }: any) => <div>{`preview-step-${step}`}</div>,
}));

jest.mock('../customiseItinerary', () => ({
  CustomiseItinerary: ({ startDate, endDate }: any) => (
    <div>{`itinerary-${startDate}-${endDate}`}</div>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('ExperienceStepSidePanel', () => {
  const defaultProps = {
    step: 'dates-type' as const,
  };

  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(<ExperienceStepSidePanel {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('renders community step placeholder content', () => {
      render(<ExperienceStepSidePanel {...defaultProps} step="dates-type" />);
      expect(screen.getByText('Select a Community')).toBeInTheDocument();
      expect(screen.getByText(/Please add the details/i)).toBeInTheDocument();
    });

    it('renders placeholder image for community step', () => {
      render(<ExperienceStepSidePanel {...defaultProps} step="dates-type" />);
      expect(screen.getByAltText('Select a Community')).toBeInTheDocument();
    });
  });

  describe('About Step', () => {
    it('renders preview for about step', () => {
      render(
        <ExperienceStepSidePanel {...defaultProps} step="about" aboutTitle="Test Experience" />,
      );
      expect(screen.getByText('preview-step-about')).toBeInTheDocument();
    });

    it('passes props to SharedExperiencePreview on about step', () => {
      const mockOnEdit = jest.fn();
      render(
        <ExperienceStepSidePanel
          {...defaultProps}
          step="about"
          aboutTitle="Test Experience"
          onEditStep={mockOnEdit}
        />,
      );
      expect(screen.getByText('preview-step-about')).toBeInTheDocument();
    });
  });

  describe('Dates-Tickets Step', () => {
    it('shows placeholder when cannot show tickets', () => {
      render(
        <ExperienceStepSidePanel {...defaultProps} step="tickets" canShowDateTickets={false} />,
      );
      expect(screen.getByText('Create Tickets')).toBeInTheDocument();
      expect(screen.getByText(/Update and save experience date and time/i)).toBeInTheDocument();
    });

    it('shows CustomiseItinerary when itinerary config provided', () => {
      render(
        <ExperienceStepSidePanel
          {...defaultProps}
          step="tickets"
          canShowDateTickets={true}
          itineraryConfig={{ startDate: '2026-06-01', endDate: '2026-06-05' }}
        />,
      );
      expect(screen.getByText('itinerary-2026-06-01-2026-06-05')).toBeInTheDocument();
    });

    it('shows preview when can show tickets and no itinerary', () => {
      render(
        <ExperienceStepSidePanel {...defaultProps} step="tickets" canShowDateTickets={true} />,
      );
      expect(screen.getByText('preview-step-tickets')).toBeInTheDocument();
    });
  });

  describe('Guests Step', () => {
    it('renders preview for guests step', () => {
      render(
        <ExperienceStepSidePanel {...defaultProps} step="guests" aboutTitle="Test Experience" />,
      );
      expect(screen.getByText('preview-step-guests')).toBeInTheDocument();
    });
  });

  describe('Wallet Step', () => {
    it('renders preview for wallet step', () => {
      render(
        <ExperienceStepSidePanel {...defaultProps} step="wallet" aboutTitle="Test Experience" />,
      );
      expect(screen.getByText('preview-step-wallet')).toBeInTheDocument();
    });
  });

  describe('Props Passing', () => {
    it('passes all about props to preview', () => {
      const mockOnEdit = jest.fn();
      render(
        <ExperienceStepSidePanel
          {...defaultProps}
          step="about"
          aboutTitle="Test Title"
          aboutDescription="Test Description"
          aboutVisibility="public"
          aboutLocation="Test Location"
          aboutMeetingPoint="Park Entrance"
          onEditStep={mockOnEdit}
        />,
      );
      expect(screen.getByText('preview-step-about')).toBeInTheDocument();
    });

    it('passes recurring props to preview', () => {
      render(
        <ExperienceStepSidePanel
          {...defaultProps}
          step="about"
          isRecurring={true}
          experienceType="one-time"
          selectedRecurringDays={['mon', 'wed', 'fri']}
        />,
      );
      expect(screen.getByText('preview-step-about')).toBeInTheDocument();
    });

    it('passes multi-day props to preview', () => {
      render(
        <ExperienceStepSidePanel
          {...defaultProps}
          step="tickets"
          canShowDateTickets={true}
          experienceType="multi-day"
          multiDayStartDate="2026-06-15"
          multiDayEndDate="2026-06-17"
        />,
      );
      expect(screen.getByText('preview-step-tickets')).toBeInTheDocument();
    });
  });

  describe('Experience Types', () => {
    it('handles one-time experience type', () => {
      render(<ExperienceStepSidePanel {...defaultProps} step="about" experienceType="one-time" />);
      expect(screen.getByText('preview-step-about')).toBeInTheDocument();
    });

    it('handles multi-day experience type', () => {
      render(<ExperienceStepSidePanel {...defaultProps} step="about" experienceType="multi-day" />);
      expect(screen.getByText('preview-step-about')).toBeInTheDocument();
    });

    it('handles itinerary experience type', () => {
      render(<ExperienceStepSidePanel {...defaultProps} step="about" experienceType="itinerary" />);
      expect(screen.getByText('preview-step-about')).toBeInTheDocument();
    });
  });
});
