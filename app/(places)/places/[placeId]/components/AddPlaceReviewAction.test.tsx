import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AddPlaceReviewAction } from './AddPlaceReviewAction';

let sessionUser: { id: string } | null = { id: 'u1' };
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: sessionUser ? { user: sessionUser } : null }),
}));

const setOpenSignIn = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ setOpenSignIn }),
}));

const createPlaceReview = jest.fn();
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useCreatePlaceReview: () => ({ mutate: createPlaceReview, isSuccess: false, isPending: false }),
  useUploadPlaceReviewImages: () => ({ mutate: jest.fn(), isSuccess: false }),
  useDeletePlaceReviewImage: () => ({ mutate: jest.fn() }),
}));

jest.mock('@/app/(places)/components/Review/AddReview', () => ({
  AddReview: ({
    isOpen,
    createReview,
  }: {
    isOpen: boolean;
    createReview: (data: unknown) => void;
  }) =>
    isOpen ? (
      <div data-testid="add-review">
        <button type="button" onClick={() => createReview({ rating: 5 })}>
          Submit review
        </button>
      </div>
    ) : null,
}));

describe('AddPlaceReviewAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionUser = { id: 'u1' };
  });

  it('opens the review drawer', async () => {
    const user = userEvent.setup();
    render(<AddPlaceReviewAction placeId="p1" placeTitle="Kraftory" />);

    expect(screen.queryByTestId('add-review')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Write a review/ }));

    expect(screen.getByTestId('add-review')).toBeInTheDocument();
  });

  it('posts the review against this place', async () => {
    const user = userEvent.setup();
    render(<AddPlaceReviewAction placeId="p1" placeTitle="Kraftory" />);

    await user.click(screen.getByRole('button', { name: /Write a review/ }));
    await user.click(screen.getByRole('button', { name: 'Submit review' }));

    expect(createPlaceReview).toHaveBeenCalledWith({ placeId: 'p1', data: { rating: 5 } });
  });

  // Reviewing needs an account; the dialog keeps them on the page
  it('asks a signed-out reader to sign in rather than opening the form', async () => {
    sessionUser = null;
    const user = userEvent.setup();
    render(<AddPlaceReviewAction placeId="p1" placeTitle="Kraftory" />);

    await user.click(screen.getByRole('button', { name: /Write a review/ }));

    expect(setOpenSignIn).toHaveBeenCalledWith(true);
    expect(screen.queryByTestId('add-review')).not.toBeInTheDocument();
  });
});
