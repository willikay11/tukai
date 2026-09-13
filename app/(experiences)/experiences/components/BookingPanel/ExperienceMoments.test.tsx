import React from 'react';

import { render, screen } from '@testing-library/react';

import { ExperienceMoments } from './ExperienceMoments';

// The behaviour lives in ContextMoments and is tested there; this only checks
// that an experience is shaped into it correctly
jest.mock('@/app/shared/components/Moments', () => ({
  ContextMoments: (props: Record<string, unknown>) => (
    <div data-testid="context-moments">{JSON.stringify(props)}</div>
  ),
}));

describe('ExperienceMoments', () => {
  it('narrows to the experience, and names the place and community it belongs to', () => {
    render(
      <ExperienceMoments
        experienceId="e1"
        experienceTitle="Karura Entry Fees"
        place={{ id: 'pl1', title: 'Karura Forest' }}
        community={{ id: 'c1', title: 'Nairobi Runners' }}
      />,
    );

    expect(JSON.parse(screen.getByTestId('context-moments').textContent ?? '{}')).toEqual({
      contextLabel: 'Karura Entry Fees',
      emptyMessage: 'No moments from this experience yet',
      experienceId: 'e1',
      placeId: 'pl1',
      placeLabel: 'Karura Forest',
      communityId: 'c1',
      communityLabel: 'Nairobi Runners',
    });
  });

  it('copes with an experience that has neither', () => {
    render(<ExperienceMoments experienceId="e1" experienceTitle="Karura Entry Fees" />);

    expect(screen.getByTestId('context-moments')).toHaveTextContent('Karura Entry Fees');
  });
});
