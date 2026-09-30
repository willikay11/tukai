import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ExperienceRating } from '@/types/experienceRating';

import { ExperienceReviews } from './index';

let ratings: ExperienceRating[] = [];
let isLoading = false;

jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperienceRatings: () => ({ data: { data: ratings }, isLoading }),
}));

let userId: string | undefined = 'me';
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: userId ? { user: { id: userId } } : null }),
}));

const rating = (score: number, overrides: Partial<ExperienceRating> = {}): ExperienceRating => ({
  id: `r${score}${overrides.id ?? ''}`,
  rating: score,
  attendee: { id: 'u1', displayName: 'Amina' },
  ...overrides,
});

describe('reviews on an experience', () => {
  beforeEach(() => {
    userId = 'me';
    isLoading = false;
    ratings = [];
  });

  /**
   * The experience serializers carry no average and no count, so both are
   * worked out from the ratings themselves.
   */
  it('works the average and the count out of the reviews', () => {
    ratings = [rating(5), rating(4)];
    render(<ExperienceReviews experienceId="e1" />);

    expect(screen.getByText('4.5 · 2 reviews')).toBeInTheDocument();
  });

  it('shows what each reviewer said', () => {
    ratings = [rating(5, { review: 'Worth the early start.' })];
    render(<ExperienceReviews experienceId="e1" />);

    expect(screen.getByText('Amina')).toBeInTheDocument();
    expect(screen.getByText('Worth the early start.')).toBeInTheDocument();
  });

  it('copes with a score left without any words', () => {
    ratings = [rating(4)];
    render(<ExperienceReviews experienceId="e1" />);

    expect(screen.getByText('4 · 1 review')).toBeInTheDocument();
  });

  it('shows the photos a reviewer added', () => {
    ratings = [rating(5, { photos: [{ id: 'p1', photoWebpThumbUrl: 'https://cdn.test/t.webp' }] })];
    const { container } = render(<ExperienceReviews experienceId="e1" />);

    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('says plainly when nothing has been reviewed', () => {
    render(<ExperienceReviews experienceId="e1" />);

    expect(
      screen.getByText(
        'No one has reviewed this experience yet. Reviews open once it has happened.',
      ),
    ).toBeInTheDocument();
  });

  // Four at a time, then the rest on request
  it('holds the rest back behind one press', async () => {
    ratings = [1, 2, 3, 4, 5].map((score) => rating(score, { review: `Review ${score}` }));
    render(<ExperienceReviews experienceId="e1" />);

    expect(screen.queryByText('Review 5')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Show all 5 reviews' }));

    expect(screen.getByText('Review 5')).toBeInTheDocument();
  });

  it('does not offer to show more when there is no more', () => {
    ratings = [rating(5)];
    render(<ExperienceReviews experienceId="e1" />);

    expect(screen.queryByRole('button', { name: /Show all/ })).not.toBeInTheDocument();
  });

  // The endpoint needs a token and can refuse outright, so a signed-out reader
  // is shown nothing rather than an error they cannot act on
  it('shows nothing to a reader who is not signed in', () => {
    userId = undefined;
    ratings = [rating(5)];
    const { container } = render(<ExperienceReviews experienceId="e1" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing while the reviews are still coming', () => {
    isLoading = true;
    const { container } = render(<ExperienceReviews experienceId="e1" />);

    expect(container).toBeEmptyDOMElement();
  });

  // A refusal comes back as { success: false } with no data at all
  it('reads a refusal as no reviews rather than breaking', () => {
    ratings = undefined as unknown as ExperienceRating[];
    render(<ExperienceReviews experienceId="e1" />);

    expect(screen.getByText(/No one has reviewed this experience yet/)).toBeInTheDocument();
  });
});
