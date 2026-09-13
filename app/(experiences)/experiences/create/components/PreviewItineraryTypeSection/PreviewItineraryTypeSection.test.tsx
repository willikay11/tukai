import { render, screen } from '@testing-library/react';

import { PreviewItineraryTypeSection } from '.';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('PreviewItineraryTypeSection', () => {
  it('renders section title', () => {
    render(<PreviewItineraryTypeSection visibility="public" />);
    expect(screen.getByText('Itinerary Type')).toBeInTheDocument();
  });

  it('displays "Public" when visibility is public', () => {
    render(<PreviewItineraryTypeSection visibility="public" />);
    expect(screen.getByText('Public (Everyone can join)')).toBeInTheDocument();
  });

  it('displays "Private" when visibility is private', () => {
    render(<PreviewItineraryTypeSection visibility="private" />);
    expect(screen.getByText('Private (Only invited guests can join)')).toBeInTheDocument();
  });

  it('renders edit button when onEdit is provided', () => {
    const onEdit = jest.fn();
    render(<PreviewItineraryTypeSection visibility="public" onEdit={onEdit} />);
    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();
  });
});
