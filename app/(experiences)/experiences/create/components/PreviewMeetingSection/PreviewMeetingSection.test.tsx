import { render, screen } from '@testing-library/react';
import { PreviewMeetingSection } from './PreviewMeetingSection';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewMeetingSection', () => {
  it('renders section title', () => {
    render(<PreviewMeetingSection meetingPoint={null} meetingTime={null} />);
    expect(screen.getByText('Meeting Details')).toBeInTheDocument();
  });

  it('displays "Not set yet" when meeting point is not provided', () => {
    render(<PreviewMeetingSection meetingPoint={null} meetingTime={null} />);
    expect(screen.getByText('Not set yet')).toBeInTheDocument();
  });

  it('displays meeting point when provided', () => {
    render(<PreviewMeetingSection meetingPoint="Nairobi National Park" meetingTime={null} />);
    expect(screen.getByText('Nairobi National Park')).toBeInTheDocument();
  });

  it('displays meeting time when provided', () => {
    render(<PreviewMeetingSection meetingPoint="Nairobi National Park" meetingTime="9:00 AM" />);
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
  });

  it('renders edit button when onEdit is provided', () => {
    const onEdit = jest.fn();
    render(<PreviewMeetingSection meetingPoint={null} meetingTime={null} onEdit={onEdit} />);
    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();
  });
});
