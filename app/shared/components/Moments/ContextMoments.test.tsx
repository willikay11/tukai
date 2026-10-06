import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ContextMoments } from './ContextMoments';

jest.mock('@/app/shared/components/Moments/MomentDrawer', () => ({
  MomentDrawer: ({ moment }: { moment: { id: string } | null }) =>
    moment ? <div data-testid="drawer">{`drawer-${moment.id}`}</div> : null,
}));

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

const setOpenSignIn = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ setOpenSignIn }),
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
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

  it('opens a moment in a drawer over the page', async () => {
    withMoments([{ id: 'm1' }]);
    const user = userEvent.setup();

    renderForExperience();
    await user.click(screen.getByText('moment-m1'));

    expect(screen.getByTestId('drawer')).toHaveTextContent('drawer-m1');
  });

  it('says so when there are none', () => {
    renderForExperience();

    expect(screen.getByText('No moments from this experience yet')).toBeInTheDocument();
  });

  it('opens the composer, naming everywhere the moment lands', async () => {
    const user = userEvent.setup();

    renderForExperience();
    await user.click(screen.getByRole('button', { name: /share moment/i }));

    expect(screen.getByTestId('composer')).toHaveTextContent(
      'Karura Entry Fees | Karura Forest | Nairobi Runners',
    );
  });

  /**
   * Posting needs an account - every moments endpoint is authenticated - but
   * the invitation still shows, or the section looks like nothing can be done
   * with it.
   */
  describe('signed out', () => {
    beforeEach(() => {
      sessionStatus = 'unauthenticated';
    });

    it('still offers to share one', () => {
      renderForExperience();

      expect(screen.getByRole('button', { name: /share moment/i })).toBeInTheDocument();
    });

    it('asks them to sign in rather than opening the composer', async () => {
      const user = userEvent.setup();

      renderForExperience();
      await user.click(screen.getByRole('button', { name: /share moment/i }));

      expect(setOpenSignIn).toHaveBeenCalledWith(true);
      expect(screen.queryByTestId('composer')).not.toBeInTheDocument();
    });
  });

  // The booking panel's tab already names the section; the drawer's does not
  describe('the heading', () => {
    it('is left out unless a caller asks for one', () => {
      renderForExperience();

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('is shown where one is given', () => {
      render(
        <ContextMoments
          title="Moments"
          contextLabel="Kazuri"
          emptyMessage="None yet"
          placeId="p1"
        />,
      );

      expect(screen.getByRole('heading', { name: 'Moments' })).toBeInTheDocument();
    });
  });

  it('holds its shape while loading', () => {
    withMoments([], true);

    renderForExperience();

    expect(screen.getByRole('status', { name: 'Loading moments' })).toBeInTheDocument();
  });

  // A surface that shows the composer in place - the place drawer - owns the
  // form itself, so there must not be a second one here
  describe('onShare', () => {
    it('hands the press over instead of opening the dialog', async () => {
      const onShare = jest.fn();
      const user = userEvent.setup();

      render(
        <ContextMoments
          contextLabel="Kazuri"
          emptyMessage="None yet"
          placeId="p1"
          onShare={onShare}
        />,
      );
      await user.click(screen.getByRole('button', { name: /share moment/i }));

      expect(onShare).toHaveBeenCalled();
      expect(screen.queryByTestId('composer')).not.toBeInTheDocument();
    });

    it('still asks a signed-out reader to sign in', async () => {
      const onShare = jest.fn();
      sessionStatus = 'unauthenticated';
      const user = userEvent.setup();

      render(
        <ContextMoments
          contextLabel="Kazuri"
          emptyMessage="None yet"
          placeId="p1"
          onShare={onShare}
        />,
      );
      await user.click(screen.getByRole('button', { name: /share moment/i }));

      expect(setOpenSignIn).toHaveBeenCalledWith(true);
      expect(onShare).not.toHaveBeenCalled();
    });
  });
});
