import React from 'react';

import { render, screen } from '@testing-library/react';

import { PlaceDrawerReviews } from './PlaceDrawerReviews';

const reviewsList = jest.fn();
jest.mock('@/app/(places)/places/components/reviews', () => ({
  Reviews: (props: { placeId: string; variant?: string }) => {
    reviewsList(props);
    return <div data-testid="list" />;
  },
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

describe('PlaceDrawerReviews', () => {
  beforeEach(() => reviewsList.mockClear());

  it('shows the rating to one decimal and the count with a plural noun', () => {
    render(<PlaceDrawerReviews placeId="p1" rating={4.25} reviewCount={1280} />);

    expect(screen.getByText('4.3')).toBeInTheDocument();
    expect(screen.getByText('1,280 reviews')).toBeInTheDocument();
  });

  it('says so when nobody has reviewed the place, and leaves out the rating', () => {
    render(<PlaceDrawerReviews placeId="p1" rating={0} reviewCount={null} />);

    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
    expect(screen.queryByTestId('StarIcon')).not.toBeInTheDocument();
  });

  it('passes the panel variant to the list', () => {
    render(<PlaceDrawerReviews placeId="p1" rating={4} reviewCount={3} />);

    expect(reviewsList).toHaveBeenLastCalledWith({ placeId: 'p1', variant: 'panel' });
  });
});
