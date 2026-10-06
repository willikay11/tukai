import React from 'react';

import { render } from '@testing-library/react';

import { RailPlaceCardSkeleton } from './RailPlaceCardSkeleton';

describe('RailPlaceCardSkeleton', () => {
  it('draws the photo and three text lines as pulsing blocks', () => {
    const { container } = render(<RailPlaceCardSkeleton />);

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
  });
});
