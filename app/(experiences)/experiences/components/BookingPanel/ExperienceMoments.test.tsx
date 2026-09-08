import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExperienceMoments } from './ExperienceMoments';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

let sessionStatus = 'authenticated';
jest.mock('next-auth/react', () => ({ useSession: () => ({ status: sessionStatus }) }));

const useMoments = jest.fn();
jest.mock('@/app/shared/hooks/useMoments', () => ({
  useMoments: (params: Record<string, unknown>) => useMoments(params),
}));

jest.mock('@/app/shared/components/Moments', () => ({
  MomentComposer: ({
    open,
    contextLabel,
    placeLabel,
    communityLabel,
  }: {
    open: boolean;
    contextLabel: string;
    placeLabel?: string;
    communityLabel?: string;
  }) =>
    open ? (
      <div data-testid="composer">{[contextLabel, placeLabel, communityLabel].join(' | ')}</div>
    ) : null,
  MomentComposerTrigger: ({ onOpen }: { onOpen: () => void }) => (
    <button type="button" onClick={onOpen}>
      What are you up to?
    </button>
  ),
  MomentsMasonry: ({
    moments,
    onSelect,
  }: {
    moments: { id: string }[];
    onSelect: (id: string) => void;
  }) => (
    <div>
      {moments.map((moment) => (
        <button key={moment.id} type="button" onClick={() => onSelect(moment.id)}>
          {`moment-${moment.id}`}
        </button>
      ))}
    </div>
  ),
}));

const withMoments = (results: unknown[], isLoading = false) =>
  useMoments.mockReturnValue({ data: { data: { results } }, isLoading });

describe('ExperienceMoments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStatus = 'authenticated';
    withMoments([]);
  });

  // The API filters moments by experience; without it the tab would show the
  // whole feed
  it('asks only for this experience’s moments', () => {
    render(<ExperienceMoments experienceId="e1" experienceTitle="Karura Entry Fees" />);

    expect(useMoments).toHaveBeenCalledWith(expect.objectContaining({ experience: 'e1' }));
  });

  it('lists what was posted there', () => {
    withMoments([{ id: 'm1' }, { id: 'm2' }]);

    render(<ExperienceMoments experienceId="e1" experienceTitle="Karura Entry Fees" />);

    expect(screen.getByText('moment-m1')).toBeInTheDocument();
    expect(screen.getByText('moment-m2')).toBeInTheDocument();
  });

  // The feed owns the viewer — this tab is a way in, not a second copy of it
  it('opens a moment in the moments feed', async () => {
    withMoments([{ id: 'm1' }]);
    const user = userEvent.setup();

    render(<ExperienceMoments experienceId="e1" experienceTitle="Karura Entry Fees" />);
    await user.click(screen.getByText('moment-m1'));

    expect(push).toHaveBeenCalledWith('/moments?momentId=m1');
  });

  it('says so when the experience has none', () => {
    render(<ExperienceMoments experienceId="e1" experienceTitle="Karura Entry Fees" />);

    expect(screen.getByText('No moments from this experience yet')).toBeInTheDocument();
  });

  // Posting a moment needs an account — every moments endpoint is authenticated
  // A field, the way the moments feed asks for a comment — not a button
  it('opens the composer from the field, naming everywhere the moment lands', async () => {
    const user = userEvent.setup();

    render(
      <ExperienceMoments
        experienceId="e1"
        experienceTitle="Karura Entry Fees"
        place={{ id: 'pl1', title: 'Karura Forest' }}
        community={{ id: 'c1', title: 'Nairobi Runners' }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'What are you up to?' }));

    expect(screen.getByTestId('composer')).toHaveTextContent(
      'Karura Entry Fees | Karura Forest | Nairobi Runners',
    );
  });

  it('does not offer to post when signed out', () => {
    sessionStatus = 'unauthenticated';

    render(<ExperienceMoments experienceId="e1" experienceTitle="Karura Entry Fees" />);

    expect(screen.queryByRole('button', { name: 'What are you up to?' })).not.toBeInTheDocument();
  });

  it('holds its shape while loading', () => {
    withMoments([], true);

    render(<ExperienceMoments experienceId="e1" experienceTitle="Karura Entry Fees" />);

    expect(screen.getByRole('status', { name: 'Loading moments' })).toBeInTheDocument();
  });
});
