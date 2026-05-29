import { render, screen } from '@testing-library/react';

import { PreviewMeetingSection } from './index';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewMeetingSection', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const { container } = render(
        <PreviewMeetingSection meetingPoint={null} meetingTime={null} />,
      );
      expect(container).toBeInTheDocument();
    });

    it('renders the heading', () => {
      render(<PreviewMeetingSection meetingPoint={null} meetingTime={null} />);
      expect(screen.getByText('Meeting/Pick-up Point & Time')).toBeInTheDocument();
    });

    it('renders edit button when onEdit provided', () => {
      const onEdit = jest.fn();
      render(<PreviewMeetingSection meetingPoint={null} meetingTime={null} onEdit={onEdit} />);
      expect(screen.getByText('Edit02Icon')).toBeInTheDocument();
    });

    it('does not render edit button when onEdit not provided', () => {
      render(<PreviewMeetingSection meetingPoint={null} meetingTime={null} />);
      expect(screen.queryByText('Edit02Icon')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays "Not set yet" when no meeting point', () => {
      render(<PreviewMeetingSection meetingPoint={null} meetingTime={null} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });

    it('displays "Not set yet" when meeting point is empty', () => {
      render(<PreviewMeetingSection meetingPoint="" meetingTime={null} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });
  });

  describe('Meeting Point Display', () => {
    it('displays meeting point only', () => {
      render(<PreviewMeetingSection meetingPoint="Park Entrance" meetingTime={null} />);
      expect(screen.getByText('Park Entrance')).toBeInTheDocument();
      expect(screen.queryByText('Not set yet')).not.toBeInTheDocument();
    });

    it('displays location icon', () => {
      render(<PreviewMeetingSection meetingPoint="Park Entrance" meetingTime={null} />);
      expect(screen.getByText('Image02Icon')).toBeInTheDocument();
    });
  });

  describe('Meeting Time Display', () => {
    it('displays both meeting point and time', () => {
      render(<PreviewMeetingSection meetingPoint="Park Entrance" meetingTime="08:00 AM" />);
      expect(screen.getByText('Park Entrance')).toBeInTheDocument();
      expect(screen.getByText('08:00 AM')).toBeInTheDocument();
    });

    it('displays separator between point and time', () => {
      const { container } = render(
        <PreviewMeetingSection meetingPoint="Hotel Lobby" meetingTime="09:30 AM" />,
      );
      const separator = container.querySelector('.h-1.w-1.rounded-full');
      expect(separator).toBeInTheDocument();
    });

    it('does not display time when not provided', () => {
      render(<PreviewMeetingSection meetingPoint="Park Entrance" meetingTime={null} />);
      expect(screen.queryByText('08:00 AM')).not.toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = jest.fn();
      render(<PreviewMeetingSection meetingPoint="Park" meetingTime={null} onEdit={onEdit} />);
      const editButton = screen.getByText('Edit02Icon').closest('button');
      editButton?.click();
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Props Updates', () => {
    it('updates meeting point when prop changes', () => {
      const { rerender } = render(
        <PreviewMeetingSection meetingPoint="Old Point" meetingTime={null} />,
      );
      expect(screen.getByText('Old Point')).toBeInTheDocument();

      rerender(<PreviewMeetingSection meetingPoint="New Point" meetingTime={null} />);
      expect(screen.queryByText('Old Point')).not.toBeInTheDocument();
      expect(screen.getByText('New Point')).toBeInTheDocument();
    });

    it('updates meeting time when prop changes', () => {
      const { rerender } = render(
        <PreviewMeetingSection meetingPoint="Point" meetingTime="08:00 AM" />,
      );
      expect(screen.getByText('08:00 AM')).toBeInTheDocument();

      rerender(<PreviewMeetingSection meetingPoint="Point" meetingTime="10:00 AM" />);
      expect(screen.queryByText('08:00 AM')).not.toBeInTheDocument();
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    });

    it('transitions from empty to filled state', () => {
      const { rerender } = render(<PreviewMeetingSection meetingPoint={null} meetingTime={null} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();

      rerender(<PreviewMeetingSection meetingPoint="Park" meetingTime="09:00 AM" />);
      expect(screen.queryByText('Not set yet')).not.toBeInTheDocument();
      expect(screen.getByText('Park')).toBeInTheDocument();
    });

    it('transitions from filled to empty state', () => {
      const { rerender } = render(
        <PreviewMeetingSection meetingPoint="Park" meetingTime="09:00 AM" />,
      );
      expect(screen.getByText('Park')).toBeInTheDocument();

      rerender(<PreviewMeetingSection meetingPoint={null} meetingTime={null} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });
  });

  describe('Special Cases', () => {
    it('handles time without meeting point', () => {
      const { container } = render(
        <PreviewMeetingSection meetingPoint={null} meetingTime="08:00 AM" />,
      );
      // Should show "Not set yet" because meetingPoint is required
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });

    it('handles special characters in meeting point', () => {
      render(<PreviewMeetingSection meetingPoint="Location & Time (Special)" meetingTime={null} />);
      expect(screen.getByText('Location & Time (Special)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has semantic heading', () => {
      render(<PreviewMeetingSection meetingPoint={null} meetingTime={null} />);
      const heading = screen.getByText('Meeting/Pick-up Point & Time');
      expect(heading.tagName).toBe('H3');
    });
  });
});
