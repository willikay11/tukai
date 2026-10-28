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

const renderDrawer = (onClose = jest.fn()) =>
  render(
    <LeaveReviewDrawer experienceId="e1" experienceTitle="Sunrise hike" isOpen onClose={onClose} />,
  );

const star = (value: number) => screen.getByRole('radio', { name: `${value} out of 5` });

describe('leaving a review', () => {
  beforeEach(() => jest.clearAllMocks());

  it('asks about the experience by name', () => {
    renderDrawer();

    expect(screen.getByText('How was Sunrise hike?')).toBeInTheDocument();
  });

  it('will not post without a score', async () => {
    renderDrawer();

    await userEvent.click(screen.getByRole('button', { name: 'Post review' }));

    expect(createRating).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a score from one to five.');
  });

  // The API takes a rating with no words at all
  it('posts a score on its own', async () => {
    renderDrawer();

    await userEvent.click(star(4));
    await userEvent.click(screen.getByRole('button', { name: 'Post review' }));

    expect(createRating).toHaveBeenCalledWith(
      { rating: 4, review: undefined, photos: [] },
      expect.anything(),
    );
  });

  it('says what each score means', async () => {
    renderDrawer();

    await userEvent.click(star(5));

    expect(screen.getByText('Loved it')).toBeInTheDocument();
  });

  it('sends the words that were written', async () => {
    renderDrawer();

    await userEvent.click(star(5));
    await userEvent.type(
      screen.getByLabelText(/Anything you want to add/),
      'Worth the early start.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Post review' }));

    expect(createRating).toHaveBeenCalledWith(
      expect.objectContaining({ review: 'Worth the early start.' }),
      expect.anything(),
    );
  });

  // Photos ride on the same request as `new_photos`
  it('sends the photos that were added', async () => {
    renderDrawer();

    const photo = new File(['x'], 'summit.jpg', { type: 'image/jpeg' });
    await userEvent.click(star(5));
    await userEvent.upload(screen.getByLabelText('Add photos'), photo);
    await userEvent.click(screen.getByRole('button', { name: 'Post review' }));

    expect(createRating).toHaveBeenCalledWith(
      expect.objectContaining({ photos: [photo] }),
      expect.anything(),
    );
  });

  it('lets a photo be taken back off', async () => {
    renderDrawer();

    const photo = new File(['x'], 'summit.jpg', { type: 'image/jpeg' });
    await userEvent.upload(screen.getByLabelText('Add photos'), photo);

    expect(screen.getByText('summit.jpg')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Remove summit.jpg' }));

    expect(screen.queryByText('summit.jpg')).not.toBeInTheDocument();
  });

  it('thanks the reviewer and closes once it is posted', async () => {
    const onClose = jest.fn();
    createRating.mockImplementation((_data, { onSuccess }) => onSuccess());
    renderDrawer(onClose);

    await userEvent.click(star(5));
    await userEvent.click(screen.getByRole('button', { name: 'Post review' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Your review of Sunrise hike is posted.' }),
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
    await userEvent.click(screen.getByRole('button', { name: 'Post review' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You did not attend this experience.',
    );
  });
});
