import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Place } from '@/types/place';

import { PlaceReviewForm, RATING_LABELS } from './PlaceReviewForm';

const createReview = jest.fn();
const uploadImages = jest.fn();
let createState: Record<string, unknown> = { isPending: false, isSuccess: false, data: undefined };
let uploadState: Record<string, unknown> = { isSuccess: false };

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 'u1' } } }) }));
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useCreatePlaceReview: () => ({ mutate: createReview, ...createState }),
  useUploadPlaceReviewImages: () => ({ mutate: uploadImages, ...uploadState }),
  useDeletePlaceReviewImage: () => ({ mutate: jest.fn() }),
}));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName, className }: { iconName: string; className?: string }) => (
    <span data-testid={iconName} className={className} />
  ),
}));
jest.mock('@/app/shared/components/Images', () => ({
  // The name goes on an attribute, not in the text, so asserting on the
  // heading below does not also match the thumbnail's alt
  PhotoImage: ({ alt }: { alt: string }) => <span data-testid="photo" title={alt} />,
}));

const place = {
  id: 'p1',
  title: 'Kazuri Beads Workshop',
  location: { city: 'Karen, Nairobi' },
  photos: [],
} as unknown as Place;

const write = (text: string) =>
  fireEvent.change(screen.getByLabelText('Your review'), { target: { value: text } });

describe('PlaceReviewForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createState = { isPending: false, isSuccess: false, data: undefined };
    uploadState = { isSuccess: false };
  });

  it('names the place being reviewed', () => {
    render(<PlaceReviewForm place={place} onDone={jest.fn()} />);

    expect(screen.getByText('Kazuri Beads Workshop')).toBeInTheDocument();
    expect(screen.getByText('Karen, Nairobi')).toBeInTheDocument();
  });

  it('asks for a rating before anything else', () => {
    render(<PlaceReviewForm place={place} onDone={jest.fn()} />);

    expect(screen.getByText('Tap a star to rate')).toBeInTheDocument();
  });

  it('says what the chosen rating means', () => {
    render(<PlaceReviewForm place={place} onDone={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '4 stars' }));

    expect(screen.getByText(RATING_LABELS[4])).toBeInTheDocument();
    expect(screen.queryByText('Tap a star to rate')).not.toBeInTheDocument();
  });

  describe('posting', () => {
    it('will not post without a rating', () => {
      render(<PlaceReviewForm place={place} onDone={jest.fn()} />);
      write('Lovely light in the afternoon.');

      expect(screen.getByRole('button', { name: /post review/i })).toBeDisabled();
    });

    it('will not post without any words', () => {
      render(<PlaceReviewForm place={place} onDone={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: '5 stars' }));

      expect(screen.getByRole('button', { name: /post review/i })).toBeDisabled();
    });

    it('sends the rating and the words once it has both', () => {
      render(<PlaceReviewForm place={place} onDone={jest.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: '5 stars' }));
      write('Lovely light in the afternoon.');
      fireEvent.click(screen.getByRole('button', { name: /post review/i }));

      expect(createReview).toHaveBeenCalledWith({
        placeId: 'p1',
        data: expect.objectContaining({
          place_id: 'p1',
          description: 'Lovely light in the afternoon.',
          rating: 5,
          reviewer_id: 'u1',
        }),
      });
    });

    // The API wants a title as well, and the form asks one question
    it('takes the title from what they wrote', () => {
      render(<PlaceReviewForm place={place} onDone={jest.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: '5 stars' }));
      write('Lovely light\nParking fills up by eleven.');
      fireEvent.click(screen.getByRole('button', { name: /post review/i }));

      expect(createReview).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ title: 'Lovely light' }) }),
      );
    });

    it('closes once the review has gone, with no photos to follow', () => {
      const onDone = jest.fn();
      createState = { isPending: false, isSuccess: true, data: { data: { id: 'r1' } } };

      render(<PlaceReviewForm place={place} onDone={onDone} />);

      expect(onDone).toHaveBeenCalled();
      expect(uploadImages).not.toHaveBeenCalled();
    });

    it('says so while it is going', () => {
      createState = { isPending: true, isSuccess: false, data: undefined };

      render(<PlaceReviewForm place={place} onDone={jest.fn()} />);

      expect(screen.getByRole('button', { name: /posting/i })).toBeDisabled();
    });
  });
});
