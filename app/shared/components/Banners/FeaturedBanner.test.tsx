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
