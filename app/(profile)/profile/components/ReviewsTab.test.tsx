import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReviewToWrite, WrittenReview } from '@/app/(profile)/hooks/useMyReviews';
import { ExperienceRatingPhoto } from '@/types/experienceRating';

import { ReviewsTab } from './ReviewsTab';

const openExperience = jest.fn();
jest.mock('@/context/ExperienceDrawerContext', () => ({
  useExperienceDrawer: () => ({ openExperience }),
}));

const leaveReviewProps = jest.fn();
jest.mock('@/app/shared/components/Experiences', () => ({
  LeaveReviewDrawer: (props: Record<string, unknown>) => {
    leaveReviewProps(props);
    return <div data-testid="leave-review-drawer" />;
  },
}));

const aPhoto = (id: string): ExperienceRatingPhoto => ({ id, photoWebpMdUrl: `https://cdn.example.com/${id}.jpg` });

const toReview = (overrides: Partial<ReviewToWrite> = {}): ReviewToWrite => ({
  experienceId: 'e1',
  title: 'Ngong Hills ridge walk',
  image: 'https://cdn.example.com/ngong.jpg',
  when: new Date().toISOString(),
  organiser: 'Guided by Otieno',
  ...overrides,
});

const written = (overrides: Partial<WrittenReview> = {}): WrittenReview => ({
  experienceId: 'e2',
  title: 'Intro to wheel throwing',
  image: 'https://cdn.example.com/wheel.jpg',
  when: '2026-10-06T10:00:00Z',
  organiser: 'Nairobi Makers Circle',
  rating: { id: 'r1', rating: 5, review: 'Came home with two bowls.', photos: [] },
  ...overrides,
});

describe('reviews tab', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows nothing here yet when there are no reviews either way', () => {
    render(<ReviewsTab toReview={[]} written={[]} />);

    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  });

  it('opens the composer with the tapped score when a to-review star is tapped', async () => {
    render(<ReviewsTab toReview={[toReview()]} written={[]} />);

    await userEvent.click(screen.getByRole('button', { name: 'Rate 4 out of 5' }));

    expect(leaveReviewProps).toHaveBeenCalledWith(
      expect.objectContaining({
        experienceId: 'e1',
        experienceTitle: 'Ngong Hills ridge walk',
        organiser: 'Guided by Otieno',
        initialScore: 4,
      }),
    );
  });

  it('shows a written review with its rating, text and meta', () => {
    render(<ReviewsTab toReview={[]} written={[written()]} />);

    expect(screen.getByText('Intro to wheel throwing')).toBeInTheDocument();
    expect(screen.getByText('Came home with two bowls.')).toBeInTheDocument();
    expect(screen.getByText('Nairobi Makers Circle, 6 Oct')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'You rated it 5 out of 5' })).toBeInTheDocument();
  });

  it('opens the past booking when the header is clicked', async () => {
    render(<ReviewsTab toReview={[]} written={[written()]} />);

    await userEvent.click(screen.getByRole('button', { name: /Intro to wheel throwing/ }));

    expect(openExperience).toHaveBeenCalledWith('e2');
  });

  it('shows up to 3 photo thumbs with a +n overlay on the 3rd past that', () => {
    const review = written({
      rating: {
        id: 'r1',
        rating: 5,
        review: 'Great session.',
        photos: [aPhoto('p1'), aPhoto('p2'), aPhoto('p3'), aPhoto('p4')],
      },
    });
    render(<ReviewsTab toReview={[]} written={[review]} />);

    expect(screen.getByRole('button', { name: 'Open photo 1 of 4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open photo 2 of 4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'See all 4 photos' })).toBeInTheDocument();
  });

  it('opens a photo in the gallery and steps through with the arrows', async () => {
    const review = written({
      rating: {
        id: 'r1',
        rating: 5,
        review: 'Great session.',
        photos: [aPhoto('p1'), aPhoto('p2')],
      },
    });
    render(<ReviewsTab toReview={[]} written={[review]} />);

    await userEvent.click(screen.getByRole('button', { name: 'Open photo 1 of 2' }));

    expect(screen.getByRole('dialog', { name: 'Your photos from Intro to wheel throwing' })).toBeInTheDocument();
    expect(screen.getByText(/1 of 2/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Next photo' }));

    expect(screen.getByText(/2 of 2/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
