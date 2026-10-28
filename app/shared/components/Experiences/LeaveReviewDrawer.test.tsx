import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LeaveReviewDrawer } from './LeaveReviewDrawer';

const createRating = jest.fn();
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useCreateExperienceRating: () => ({ mutate: createRating, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

// jsdom has no object URLs
beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'blob:preview');
  URL.revokeObjectURL = jest.fn();
});

const renderDrawer = (props: Partial<React.ComponentProps<typeof LeaveReviewDrawer>> = {}) =>
  render(
    <LeaveReviewDrawer
      experienceId="e1"
      experienceTitle="Sunrise hike"
      isOpen
      onClose={jest.fn()}
      {...props}
    />,
  );

const star = (value: number) =>
  screen.getByRole('button', { name: `${value} ${value === 1 ? 'star' : 'stars'}` });

const postButton = () => screen.getByRole('button', { name: /Post review/ });

const write = async (text: string) => userEvent.type(screen.getByLabelText('Your review'), text);

describe('leaving a review', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the experience and when it was attended', () => {
    renderDrawer({ attendedWhen: new Date().toISOString(), organiser: 'City Sketchers' });

    expect(screen.getByText('Sunrise hike')).toBeInTheDocument();
    expect(screen.getByText('Attended yesterday, City Sketchers')).toBeInTheDocument();
  });

  it('keeps Post review disabled until there is a score and some words', async () => {
    renderDrawer();

    expect(postButton()).toBeDisabled();

    await userEvent.click(star(4));
    expect(postButton()).toBeDisabled();

    await write('Worth the early start.');
    expect(postButton()).toBeEnabled();
  });

  it('hints at what is still missing', async () => {
    renderDrawer();

    expect(screen.getByText('Pick a star rating and add a few words.')).toBeInTheDocument();

    await userEvent.click(star(4));
    expect(screen.getByText('Add a few words about what it was like.')).toBeInTheDocument();
  });

  it('says what each score means', async () => {
    renderDrawer();

    await userEvent.click(star(5));

    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('sends the score and the words that were written', async () => {
    renderDrawer();

    await userEvent.click(star(5));
    await write('Worth the early start.');
    await userEvent.click(postButton());

    expect(createRating).toHaveBeenCalledWith(
      { rating: 5, review: 'Worth the early start.', photos: [] },
      expect.anything(),
    );
  });

  // Photos ride on the same request as `new_photos`
  it('sends the photos that were added', async () => {
    renderDrawer();

    const photo = new File(['x'], 'summit.jpg', { type: 'image/jpeg' });
    await userEvent.click(star(5));
    await write('Worth the early start.');
    await userEvent.upload(screen.getByLabelText('Add photos'), photo);
    await userEvent.click(postButton());

    expect(createRating).toHaveBeenCalledWith(
      expect.objectContaining({ photos: [photo] }),
      expect.anything(),
    );
  });

  it('lets a photo be taken back off', async () => {
    renderDrawer();

    const photo = new File(['x'], 'summit.jpg', { type: 'image/jpeg' });
    await userEvent.upload(screen.getByLabelText('Add photos'), photo);

    expect(screen.getByRole('button', { name: 'Remove summit.jpg' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Remove summit.jpg' }));

    expect(screen.queryByRole('button', { name: 'Remove summit.jpg' })).not.toBeInTheDocument();
  });

  it('thanks the reviewer and closes once it is posted', async () => {
    const onClose = jest.fn();
    createRating.mockImplementation((_data, { onSuccess }) => onSuccess());
    renderDrawer({ onClose });

    await userEvent.click(star(5));
    await write('Worth the early start.');
    await userEvent.click(postButton());

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Thanks for sharing what Sunrise hike was like.' }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  /**
   * The API says which rule was broken - not an attendee, already rated, or
   * not ended yet - and that is more use than anything invented here.
   */
  it('shows the refusal the API gave', async () => {
    createRating.mockImplementation((_data, { onError }) =>
      onError(new Error('You did not attend this experience.')),
    );
    renderDrawer();

    await userEvent.click(star(3));
    await write('It was alright.');
    await userEvent.click(postButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You did not attend this experience.',
    );
  });
});
