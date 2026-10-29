import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Claim, ClaimStatus } from '@/types/claim';

import { YourClaimView } from './YourClaimView';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ src }: { src?: string }) => <span data-testid="photo" data-src={src} />,
}));

const openPlace = jest.fn();
let drawer: { openPlace: typeof openPlace } | null = null;
jest.mock('@/context/PlaceDrawerContext', () => ({ usePlaceDrawer: () => drawer }));
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceReservationProfiles: () => ({ data: undefined }),
}));

const claimWith = (status: ClaimStatus, overrides: Partial<Claim> = {}): Claim => ({
  id: 'claim-1',
  communityId: 'c1',
  communityName: 'Weekend Readers',
  places: [
    {
      id: 'place-1',
      title: 'Karura Forest',
      slug: 'karura-forest',
      locality: 'Gigiri',
      isOnTukai: true,
    },
  ],
  documents: [
    {
      id: 'doc-1',
      documentType: 'business_license',
      fileName: 'license.pdf',
      fileSizeLabel: '12 KB',
    },
  ],
  status,
  sentAt: '2026-11-02T09:00:00.000Z',
  ...overrides,
});

const renderClaim = (claim: Claim, onCancelClaim = jest.fn()) => {
  render(<YourClaimView claim={claim} onCancelClaim={onCancelClaim} />);
  return { onCancelClaim };
};

describe('YourClaimView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    drawer = null;
  });

  it('opens the place drawer on its settings from an approved claim, and steps out of the way', () => {
    drawer = { openPlace };
    const onNavigate = jest.fn();
    render(
      <YourClaimView
        claim={claimWith('approved')}
        onCancelClaim={jest.fn()}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Set up reservations/ }));

    expect(openPlace).toHaveBeenCalledWith('place-1', { view: 'reservations' });
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('sends an approved claim to the place reservation settings, not the public place page', () => {
    renderClaim(claimWith('approved'));

    expect(screen.getByRole('link', { name: /Set up reservations/ })).toHaveAttribute(
      'href',
      '/control-center/places/place-1/reservations',
    );
    expect(screen.getByRole('link', { name: 'Open Karura Forest' })).not.toHaveAttribute(
      'href',
      '/control-center/places/place-1/reservations',
    );
  });

  it.each<ClaimStatus>(['review', 'more', 'rejected', 'cancelled'])(
    'does not offer reservation setup on a %s claim',
    (status) => {
      renderClaim(claimWith(status));

      expect(screen.queryByRole('link', { name: /Set up reservations/ })).not.toBeInTheDocument();
    },
  );

  it('does not offer reservation setup for a place that is not on Tukai yet', () => {
    renderClaim(
      claimWith('approved', {
        places: [{ id: 'new-1', title: 'Fresh Bakery', isOnTukai: false }],
      }),
    );

    expect(screen.queryByRole('link', { name: /Set up reservations/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open Fresh Bakery' })).not.toBeInTheDocument();
  });

  it('falls back to the place initial when it has no photo', () => {
    renderClaim(claimWith('review'));

    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('shows the place photo instead of the initial when it has one', () => {
    renderClaim(
      claimWith('review', {
        places: [
          {
            id: 'place-1',
            title: 'Karura Forest',
            photo: 'https://img/karura.jpg',
            isOnTukai: true,
          },
        ],
      }),
    );

    expect(screen.getAllByTestId('photo')[0]).toHaveAttribute('data-src', 'https://img/karura.jpg');
    expect(screen.queryByText('K')).not.toBeInTheDocument();
  });

  it('lets the owner cancel a claim that is under review or waiting on documents', () => {
    const { onCancelClaim } = renderClaim(claimWith('more'));

    fireEvent.click(screen.getByRole('button', { name: /Cancel claim/ }));

    expect(onCancelClaim).toHaveBeenCalledTimes(1);
  });

  it.each<ClaimStatus>(['approved', 'rejected', 'cancelled'])(
    'does not offer to cancel a %s claim',
    (status) => {
      renderClaim(claimWith(status));

      expect(screen.queryByRole('button', { name: /Cancel claim/ })).not.toBeInTheDocument();
    },
  );

  it('names the sent documents by type and file', () => {
    renderClaim(claimWith('review'));

    expect(screen.getByText('Business license')).toBeInTheDocument();
    expect(screen.getByText('license.pdf')).toBeInTheDocument();
  });

  it("shows Tukai's note on a claim that needs more documents", () => {
    renderClaim(claimWith('more', { reviewNote: 'The licence has expired.' }));

    expect(screen.getByText('Needs more documents')).toBeInTheDocument();
    expect(screen.getByText('The licence has expired.')).toBeInTheDocument();
  });
});
