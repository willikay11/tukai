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
});
