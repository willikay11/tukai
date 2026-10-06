import React from 'react';

import { render, screen } from '@testing-library/react';

import { PlaceClaimSection } from './PlaceClaimSection';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

describe('PlaceClaimSection', () => {
  it('names the place in its heading', () => {
    render(<PlaceClaimSection placeId="p1" placeName="Java House" />);

    expect(screen.getByRole('heading', { name: 'Claim Java House' })).toBeInTheDocument();
  });

  it('lists the three things a claim gets', () => {
    render(<PlaceClaimSection placeId="p1" placeName="Java House" />);

    expect(screen.getByText('Take reservations')).toBeInTheDocument();
    expect(screen.getByText('Manage it from Control center')).toBeInTheDocument();
    expect(screen.getByText('Own it as a community')).toBeInTheDocument();
  });

  it('links the start-claim button to the claim form for this place', () => {
    render(<PlaceClaimSection placeId="p1" placeName="Java House" />);

    expect(screen.getByRole('link', { name: /Start claim/ })).toHaveAttribute(
      'href',
      '/places/claim?placeId=p1',
    );
  });
});
