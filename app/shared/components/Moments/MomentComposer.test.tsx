import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MomentComposer } from './MomentComposer';

/**
 * A moment is a photo with a line under it, so the share button only wakes up
 * once there is one. The file input is driven directly: the gallery button
 * opens a native picker jsdom cannot answer.
 */
const attachPhoto = async (user: ReturnType<typeof userEvent.setup>) => {
  const file = new File(['x'], 'bowl.jpg', { type: 'image/jpeg' });
  const inputs = document.querySelectorAll('input[type="file"]');
  await user.upload(inputs[0] as HTMLInputElement, file);
};

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { name: 'Tony Ouma' } } }),
}));

const shareMoment = jest.fn();
jest.mock('@/app/shared/hooks/useMoments', () => ({
  useCreateMoment: () => ({ mutate: shareMoment, isPending: false }),
}));

// jsdom has no object URLs
beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'blob:preview');
  URL.revokeObjectURL = jest.fn();
});

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

    expect(screen.getByRole('button', { name: /share moment/i })).toBeDisabled();
    expect(screen.getByText('Add at least one photo.')).toBeInTheDocument();
  });

  // The feeds that show moments are photo-led: one with no photo would be
  // filtered straight back out of them
  it('cannot be shared on words alone', async () => {
    const user = userEvent.setup();
    renderComposer();

    await user.type(screen.getByLabelText('What are you up to?'), 'Sunrise hike');

    expect(screen.getByRole('button', { name: /share moment/i })).toBeDisabled();
  });

  it('cannot be shared on a photo alone', async () => {
    const user = userEvent.setup();
    renderComposer();

    await attachPhoto(user);

    expect(screen.getByRole('button', { name: /share moment/i })).toBeDisabled();
    expect(screen.queryByText('Add at least one photo.')).not.toBeInTheDocument();
  });

  it('posts the text against this experience', async () => {
    const user = userEvent.setup();
    renderComposer();

    await user.type(screen.getByLabelText('What are you up to?'), 'Sunrise hike');
    await attachPhoto(user);
    await user.click(screen.getByRole('button', { name: /share moment/i }));

    expect(shareMoment).toHaveBeenCalledWith(
      // The ids go with it, so the moment really does reach those feeds
      expect.objectContaining({
        title: 'Sunrise hike',
        description: 'Sunrise hike',
        experienceId: 'e1',
        placeId: 'pl1',
        communityId: 'c1',
        photos: [expect.any(File)],
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
    await attachPhoto(user);
    await user.click(screen.getByRole('button', { name: /share moment/i }));

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
    await attachPhoto(user);
    await user.click(screen.getByRole('button', { name: /share moment/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Moment too long' }),
      ),
    );
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
