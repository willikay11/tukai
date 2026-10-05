import React from 'react';

import { render, screen } from '@testing-library/react';

import { CityCard } from './index';

const renderCard = (props: Partial<React.ComponentProps<typeof CityCard>> = {}) =>
  render(
    <CityCard city="Nairobi" imageUrl="https://cdn.tukai.co/nairobi.jpg" href="/x" {...props} />,
  );

describe('CityCard', () => {
  it('names the city', () => {
    renderCard();

    expect(screen.getByText('Nairobi')).toBeInTheDocument();
  });

  // Discover by City is a way into the city, not a stat board
  it('shows no count unless one is given', () => {
    renderCard();

    expect(screen.queryByText(/experiences/)).not.toBeInTheDocument();
  });

  it('shows the count where a caller still wants it', () => {
    renderCard({ experienceCount: 7 });

    expect(screen.getByText('7 experiences')).toBeInTheDocument();
  });

  it('caps the count at 100+', () => {
    renderCard({ experienceCount: 240 });

    expect(screen.getByText('100+ experiences')).toBeInTheDocument();
  });

  // The Discover rail's shape: a wide, short tile with the name centred over
  // a photo left bright
  describe('the banner variant', () => {
    it('is wide and short rather than the taller card', () => {
      const { container } = renderCard({ variant: 'banner' });

      expect(container.querySelector('a')).toHaveClass('aspect-[8/3]');
      expect(container.querySelector('a')).not.toHaveClass('h-[130px]');
    });

    // It is a way into the city, with no room for a second line
    it('leaves the count out even when one is given', () => {
      renderCard({ variant: 'banner', experienceCount: 7 });

      expect(screen.getByText('Nairobi')).toBeInTheDocument();
      expect(screen.queryByText('7 experiences')).not.toBeInTheDocument();
    });
  });
});
