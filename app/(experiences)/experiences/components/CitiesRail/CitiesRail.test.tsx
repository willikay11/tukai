import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PlaceCategory } from '@/types/placeCategory';

import { CITIES_RAIL_SUBTITLE, CitiesRail } from './index';

jest.mock('next/link', () => {
  function MockLink({ children, href, ...rest }: Record<string, unknown>) {
    return (
      <a href={href as string} {...rest}>
        {children as React.ReactNode}
      </a>
    );
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: () => null,
}));
jest.mock('@/app/shared/components/Lists', () => ({
  CardRail: ({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }) => (
    <section>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </section>
  ),
}));

const city = (id: string, name: string) => ({ id, name, placesCount: 3 }) as PlaceCategory;

const someCities = [city('1', 'Nairobi'), city('2', 'Naivasha')];

describe('CitiesRail', () => {
  it('carries the sentence-case heading and the design subtitle', () => {
    render(<CitiesRail cities={someCities} isLoading={false} onSelectCity={jest.fn()} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/^Experiences by city$/);
    expect(screen.getByText(CITIES_RAIL_SUBTITLE)).toBeInTheDocument();
  });

  it('names no city in the subtitle', () => {
    expect(CITIES_RAIL_SUBTITLE).not.toMatch(/Nairobi|Naivasha/);
  });

  it('shows a pressable card for each city', () => {
    render(<CitiesRail cities={someCities} isLoading={false} onSelectCity={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Nairobi' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Naivasha' })).toBeInTheDocument();
  });

  it('switches to the city picked', () => {
    const onSelectCity = jest.fn();
    render(<CitiesRail cities={someCities} isLoading={false} onSelectCity={onSelectCity} />);

    fireEvent.click(screen.getByRole('button', { name: 'Naivasha' }));

    expect(onSelectCity).toHaveBeenCalledWith('Naivasha');
  });

  it('presses the card for the city the reader is on', () => {
    render(
      <CitiesRail
        cities={someCities}
        isLoading={false}
        selectedCity="Nairobi"
        onSelectCity={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Nairobi' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Naivasha' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('is hidden when there are no cities', () => {
    const { container } = render(
      <CitiesRail cities={[]} isLoading={false} onSelectCity={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('is shown while loading, without a city card yet', () => {
    render(<CitiesRail cities={[]} isLoading onSelectCity={jest.fn()} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Experiences by city');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
