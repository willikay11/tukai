import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FeaturedBanner } from './FeaturedBanner';

const defaultProps = {
  badgeLabel: 'Featured This Week',
  coverPhoto: '/images/santorini.webp',
  title: 'Baobab Beach Club',
  metaItems: ['Beach Club', 'Diani', 'Ksh. 3,500 avg'],
  rating: 4.6,
  ctaLabel: 'Reserve a table',
  onCtaClick: jest.fn(),
};

describe('FeaturedBanner', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders badge, title, meta items and rating', () => {
    render(<FeaturedBanner {...defaultProps} />);

    expect(screen.getByText('Featured This Week')).toBeInTheDocument();
    expect(screen.getByText('Baobab Beach Club')).toBeInTheDocument();
    expect(screen.getByText('Beach Club')).toBeInTheDocument();
    expect(screen.getByText('Diani')).toBeInTheDocument();
    expect(screen.getByText('Ksh. 3,500 avg')).toBeInTheDocument();
    expect(screen.getByText('4.6')).toBeInTheDocument();
  });

  it('fires onCtaClick from the CTA button', async () => {
    const user = userEvent.setup();
    render(<FeaturedBanner {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Reserve a table' }));
    expect(defaultProps.onCtaClick).toHaveBeenCalled();
  });

  it('omits the rating and meta line pieces that are absent', () => {
    render(<FeaturedBanner {...defaultProps} rating={null} metaItems={['Diani']} />);

    expect(screen.getByText('Diani')).toBeInTheDocument();
    expect(screen.queryByText('4.6')).not.toBeInTheDocument();
  });
});

describe('FeaturedBanner secondary CTA', () => {
  beforeEach(() => jest.clearAllMocks());

  // Regression: the Places banner passes neither secondary prop
  it('renders a single CTA when no secondary action is given', () => {
    render(<FeaturedBanner {...defaultProps} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Reserve a table' })).toBeInTheDocument();
  });

  it('renders the secondary CTA beside the primary one when given', () => {
    render(
      <FeaturedBanner
        {...defaultProps}
        ctaLabel="Reserve a spot - Ksh. 20,000"
        secondaryCtaLabel="View details"
        onSecondaryCtaClick={jest.fn()}
      />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Reserve a spot - Ksh. 20,000' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View details' })).toBeInTheDocument();
  });

  it('fires only the secondary handler from the secondary CTA', async () => {
    const onCtaClick = jest.fn();
    const onSecondaryCtaClick = jest.fn();
    render(
      <FeaturedBanner
        {...defaultProps}
        onCtaClick={onCtaClick}
        secondaryCtaLabel="View details"
        onSecondaryCtaClick={onSecondaryCtaClick}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'View details' }));

    expect(onSecondaryCtaClick).toHaveBeenCalledTimes(1);
    expect(onCtaClick).not.toHaveBeenCalled();
  });

  it('renders the badge icon when one is given', () => {
    render(<FeaturedBanner {...defaultProps} badgeIcon="SparklesIcon" />);

    expect(screen.getByTestId('SparklesIcon')).toBeInTheDocument();
  });
});
