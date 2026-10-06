import React from 'react';

import { render } from '@testing-library/react';

import { MomentCardSkeleton } from './MomentCardSkeleton';

describe('MomentCardSkeleton', () => {
  it('draws the photo, author row and two caption lines as pulsing blocks', () => {
    const { container } = render(<MomentCardSkeleton />);

    // Photo, avatar, name, date, and two caption lines
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(6);
  });

  it('is hidden from assistive technology', () => {
    const { container } = render(<MomentCardSkeleton />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});
