import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MomentComposer, titleFrom } from './MomentComposer';

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { name: 'Tony Ouma' } } }),
}));

const shareMoment = jest.fn();
jest.mock('@/app/shared/hooks/useMoments', () => ({
  useCreateMoment: () => ({ mutate: shareMoment, isPending: false }),
}));

const onOpenChange = jest.fn();

const renderComposer = () =>
  render(
    <MomentComposer
      open
      onOpenChange={onOpenChange}
      contextLabel="Karura Entry Fees"
      experienceId="e1"
      placeId="pl1"
      placeLabel="Karura Forest"
      communityId="c1"
      communityLabel="Nairobi Runners"
    />,
  );

describe('titleFrom', () => {
  // The API demands a title as well as a description, but the composer asks
  // one question — so the first line stands in
  it('takes the first line', () => {
    expect(titleFrom('Sunrise hike\nWe left at six')).toBe('Sunrise hike');
  });

  it('trims a long opening line rather than sending it whole', () => {
    const title = titleFrom('a'.repeat(90));

    expect(title).toHaveLength(61);
    expect(title.endsWith('…')).toBe(true);
  });
});

describe('MomentComposer', () => {
  beforeEach(() => jest.clearAllMocks());

  // The trail says where else it will be seen: a moment on an experience also
  // surfaces in the place and the community it belongs to
  it('names the author and the whole trail the moment lands in', () => {
    renderComposer();

    expect(screen.getByText('Tony Ouma')).toBeInTheDocument();
    expect(screen.getByText('Karura Forest')).toBeInTheDocument();
    expect(screen.getByText('Nairobi Runners')).toBeInTheDocument();
    expect(screen.getByText('Karura Entry Fees')).toBeInTheDocument();
    expect(
      screen.getByText('Shared with Karura Forest and Nairobi Runners too.'),
    ).toBeInTheDocument();
  });

  it('cannot be shared while empty', () => {
    renderComposer();

    expect(screen.getByRole('button', { name: /Share Moment/ })).toBeDisabled();
  });

  it('posts the text against this experience', async () => {
    const user = userEvent.setup();
    renderComposer();

    await user.type(screen.getByLabelText('What are you up to?'), 'Sunrise hike');
    await user.click(screen.getByRole('button', { name: /Share Moment/ }));

    expect(shareMoment).toHaveBeenCalledWith(
      // The ids go with it, so the moment really does reach those feeds
      expect.objectContaining({
        title: 'Sunrise hike',
        description: 'Sunrise hike',
        experienceId: 'e1',
        placeId: 'pl1',
        communityId: 'c1',
        photos: [],
      }),
      expect.anything(),
    );
  });

  it('closes and clears once the moment is shared', async () => {
    shareMoment.mockImplementation((_input: unknown, { onSuccess }: { onSuccess: () => void }) =>
      onSuccess(),
    );
    const user = userEvent.setup();
    renderComposer();

    await user.type(screen.getByLabelText('What are you up to?'), 'Sunrise hike');
    await user.click(screen.getByRole('button', { name: /Share Moment/ }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' }));
  });

  it('reports a failure instead of closing', async () => {
    shareMoment.mockImplementation(
      (_input: unknown, { onError }: { onError: (error: Error) => void }) =>
        onError(new Error('Moment too long')),
    );
    const user = userEvent.setup();
    renderComposer();

    await user.type(screen.getByLabelText('What are you up to?'), 'Sunrise hike');
    await user.click(screen.getByRole('button', { name: /Share Moment/ }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Moment too long' }),
      ),
    );
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
