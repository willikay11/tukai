import { fireEvent, render, screen } from '@testing-library/react';

import { DashboardPlaceItem } from '../../hooks/useDashboardPlaces';
import { PlaceCard } from './PlaceCard';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const openPlace = jest.fn();
let drawer: { openPlace: typeof openPlace } | null = { openPlace };
jest.mock('@/context/PlaceDrawerContext', () => ({ usePlaceDrawer: () => drawer }));

const PLACE: DashboardPlaceItem = {
  id: 'p1',
  name: 'Karura Forest',
  locality: 'Gigiri',
  onOpenHref: '/places/karura-forest',
  stats: [{ label: 'Set up reservations', value: '', alert: false, onClick: jest.fn() }],
};

describe('PlaceCard', () => {
  beforeEach(() => {
    openPlace.mockClear();
    drawer = { openPlace };
  });

  it('opens the drawer on a plain click, and keeps the link to the place page', () => {
    render(<PlaceCard place={PLACE} />);

    const link = screen.getByRole('link', { name: /Karura Forest/ });
    const notCancelled = fireEvent.click(link);

    expect(openPlace).toHaveBeenCalledWith('p1');
    expect(link).toHaveAttribute('href', '/places/karura-forest');
    expect(notCancelled).toBe(false); // preventDefault was called
  });

  it('leaves a modified click to the browser, so it can still open a new tab', () => {
    render(<PlaceCard place={PLACE} />);

    const notCancelled = fireEvent.click(screen.getByRole('link', { name: /Karura Forest/ }), {
      metaKey: true,
    });

    expect(openPlace).not.toHaveBeenCalled();
    expect(notCancelled).toBe(true);
  });

  it('falls back to a real navigation where there is no place drawer', () => {
    drawer = null;
    render(<PlaceCard place={PLACE} />);

    const notCancelled = fireEvent.click(screen.getByRole('link', { name: /Karura Forest/ }));

    expect(openPlace).not.toHaveBeenCalled();
    expect(notCancelled).toBe(true);
  });

  it('still opens the stat chip, separately from the place itself', () => {
    render(<PlaceCard place={PLACE} />);

    fireEvent.click(screen.getByRole('button', { name: /Set up reservations/ }));

    expect(PLACE.stats[0].onClick).toHaveBeenCalledTimes(1);
    expect(openPlace).not.toHaveBeenCalled();
  });
});
