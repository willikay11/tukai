import React from 'react';

import { render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { GuidedToursRail, guidedToursSubtitle } from './index';

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
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('@/app/(experiences)/components/ExperienceCard', () => ({
  ExperienceCard: ({ experience }: { experience: Experience }) => <div>{experience.title}</div>,
}));

const tour = (id: string, title: string) => ({ id, title }) as unknown as Experience;

const someTours = [tour('1', 'Old Town Walk'), tour('2', 'Coffee Trail')];

describe('guidedToursSubtitle', () => {
  it('names the count and says near you when the reader has shared a location', () => {
    expect(guidedToursSubtitle(12, true)).toBe('12 tours led by local guides near you');
  });

  it('drops near you when there is no location', () => {
    expect(guidedToursSubtitle(12, false)).toBe('12 tours led by local guides');
  });

  it('uses the singular for one tour', () => {
    expect(guidedToursSubtitle(1, false)).toBe('1 tour led by local guides');
  });

  it('names no city', () => {
    expect(guidedToursSubtitle(3, true)).not.toMatch(/Nairobi|in /);
  });
});

describe('GuidedToursRail', () => {
  it('carries the heading and the count subtitle', () => {
    render(<GuidedToursRail tours={someTours} total={2} isLoading={false} hasLocation />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/^Guided tours$/);
    expect(screen.getByText('2 tours led by local guides near you')).toBeInTheDocument();
  });

  it('shows a card for each tour', () => {
    render(<GuidedToursRail tours={someTours} total={2} isLoading={false} hasLocation={false} />);

    expect(screen.getByText('Old Town Walk')).toBeInTheDocument();
    expect(screen.getByText('Coffee Trail')).toBeInTheDocument();
  });

  it('is hidden when there are no tours', () => {
    const { container } = render(
      <GuidedToursRail tours={[]} total={0} isLoading={false} hasLocation={false} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('is shown while loading, before any tour has arrived, without a subtitle', () => {
    render(<GuidedToursRail tours={[]} total={0} isLoading hasLocation={false} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Guided tours');
    expect(screen.queryByText(/led by local guides/)).not.toBeInTheDocument();
  });

  // Discover's See all leads to a page the listing does not have, so the rail
  // on /experiences offers none
  it('offers no See all link', () => {
    render(<GuidedToursRail tours={someTours} total={30} isLoading={false} hasLocation={false} />);

    expect(screen.queryByRole('link', { name: /See all/ })).not.toBeInTheDocument();
  });
});
