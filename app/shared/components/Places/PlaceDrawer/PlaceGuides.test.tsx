import { render, screen } from '@testing-library/react';

import { PlaceGuides } from './PlaceGuides';

let mockGuides: unknown[] = [];
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceGuides: () => ({ data: mockGuides }),
}));
jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));
jest.mock('@/app/shared/components/Images', () => ({ PhotoImage: () => null }));

// DEV-386: the tour guides who lead experiences at a place
describe('PlaceGuides', () => {
  it('lists each guide with the experiences they lead here and their rating', () => {
    mockGuides = [
      {
        id: 'g1',
        headline: '',
        user: { id: 'u1', firstName: 'Amina', lastName: 'Hassan', picture: null },
        averageRating: 4.75,
        experiencesCount: 12,
      },
      {
        id: 'g2',
        headline: '',
        user: { id: 'u2', displayName: 'Kamau', picture: null },
        averageRating: null,
        experiencesCount: 1,
      },
    ];
    render(<PlaceGuides placeId="pl1" />);

    expect(screen.getByRole('heading', { name: 'Tour guides' })).toBeInTheDocument();
    expect(screen.getByText('Amina Hassan')).toBeInTheDocument();
    expect(screen.getByText('12 experiences here · ★ 4.8')).toBeInTheDocument();
    expect(screen.getByText('Kamau')).toBeInTheDocument();
    expect(screen.getByText('1 experience here')).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: 'Verified guide' })).toHaveLength(2);
  });

  it('renders nothing when no guide leads anything here', () => {
    mockGuides = [];
    const { container } = render(<PlaceGuides placeId="pl1" />);

    expect(container).toBeEmptyDOMElement();
  });
});
