import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ContextMoments } from './ContextMoments';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

let sessionStatus = 'authenticated';
jest.mock('next-auth/react', () => ({ useSession: () => ({ status: sessionStatus }) }));

const useMoments = jest.fn();
jest.mock('@/app/shared/hooks/useMoments', () => ({
  useMoments: (params: Record<string, unknown>) => useMoments(params),
}));

jest.mock('./MomentComposer', () => ({
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
}));

jest.mock('./MomentComposerTrigger', () => ({
  MomentComposerTrigger: ({ onOpen }: { onOpen: () => void }) => (
    <button type="button" onClick={onOpen}>
      What are you up to?
    </button>
  ),
}));

jest.mock('./MomentsMasonry', () => ({
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

const renderForExperience = () =>
  render(
    <ContextMoments
      contextLabel="Karura Entry Fees"
      emptyMessage="No moments from this experience yet"
      experienceId="e1"
      placeId="pl1"
      placeLabel="Karura Forest"
      communityId="c1"
      communityLabel="Nairobi Runners"
    />,
  );

describe('ContextMoments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStatus = 'authenticated';
    withMoments([]);
  });

  it('asks only for this experience’s moments', () => {
    renderForExperience();

    expect(useMoments).toHaveBeenCalledWith(expect.objectContaining({ experience: 'e1' }));
  });

  // A place page has no experience to narrow by, so it filters on itself
  it('asks for a place’s moments when there is no experience', () => {
    render(
      <ContextMoments
        contextLabel="Kraftory Biergarten"
        emptyMessage="No moments here yet"
        placeId="pl1"
      />,
    );

    expect(useMoments).toHaveBeenCalledWith(expect.objectContaining({ place: 'pl1' }));
  });

  // An experience's own place would otherwise widen the query to everything
  // posted at that place
  it('does not narrow by place when an experience is given', () => {
    renderForExperience();

    expect(useMoments).toHaveBeenCalledWith(expect.objectContaining({ place: undefined }));
  });

  it('lists what was posted there', () => {
    withMoments([{ id: 'm1' }, { id: 'm2' }]);

    renderForExperience();

    expect(screen.getByText('moment-m1')).toBeInTheDocument();
    expect(screen.getByText('moment-m2')).toBeInTheDocument();
  });

  // The feed owns the viewer — this is a way in, not a second copy of it
  it('opens a moment in the moments feed', async () => {
    withMoments([{ id: 'm1' }]);
    const user = userEvent.setup();

    renderForExperience();
    await user.click(screen.getByText('moment-m1'));

    expect(push).toHaveBeenCalledWith('/moments?momentId=m1');
  });

  it('says so when there are none', () => {
    renderForExperience();

    expect(screen.getByText('No moments from this experience yet')).toBeInTheDocument();
  });

  it('opens the composer from the field, naming everywhere the moment lands', async () => {
    const user = userEvent.setup();

    renderForExperience();
    await user.click(screen.getByRole('button', { name: 'What are you up to?' }));

    expect(screen.getByTestId('composer')).toHaveTextContent(
      'Karura Entry Fees | Karura Forest | Nairobi Runners',
    );
  });

  // Posting a moment needs an account — every moments endpoint is authenticated
  it('does not offer to post when signed out', () => {
    sessionStatus = 'unauthenticated';

    renderForExperience();

    expect(screen.queryByRole('button', { name: 'What are you up to?' })).not.toBeInTheDocument();
  });

  it('holds its shape while loading', () => {
    withMoments([], true);

    renderForExperience();

    expect(screen.getByRole('status', { name: 'Loading moments' })).toBeInTheDocument();
  });
});
