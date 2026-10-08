import React from 'react';

import { render, screen } from '@testing-library/react';

import { Experience } from '@/types/experience';

import { ExperienceLocationSection } from './ExperienceLocationSection';

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

const experience = (overrides: Partial<Experience>) =>
  ({
    id: 'exp-1',
    location: { city: 'Nairobi', country: 'Kenya', pointLat: -1.29, pointLong: 36.82 },
    ...overrides,
  }) as unknown as Experience;

describe('ExperienceLocationSection', () => {
  it('names the tied place and links to it, when there is one', () => {
    render(
      <ExperienceLocationSection
        experience={experience({ place: { id: 'p1', title: 'Karura Forest' } })}
      />,
    );

    expect(screen.getByText('Karura Forest')).toBeInTheDocument();
  });

  // No place tied, just an address - the city still has to say something
  it('falls back to the address when the experience has no tied place', () => {
    render(<ExperienceLocationSection experience={experience({})} />);

    expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument();
  });

  it('offers directions out to Google Maps', () => {
    render(<ExperienceLocationSection experience={experience({})} />);

    expect(screen.getByRole('link', { name: /Get directions/ })).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps'),
    );
  });

  it('shows the meeting point and time when the experience has one', () => {
    render(
      <ExperienceLocationSection
        experience={experience({ meetingPoint: 'Main gate', meetingTime: '9:00am' })}
      />,
    );

    expect(screen.getByText('Meeting point')).toBeInTheDocument();
    expect(screen.getByText('Main gate')).toBeInTheDocument();
    expect(screen.getByText('9:00am')).toBeInTheDocument();
  });

  it('leaves out the meeting point card when the experience has none', () => {
    render(<ExperienceLocationSection experience={experience({})} />);

    expect(screen.queryByText('Meeting point')).not.toBeInTheDocument();
  });

  it('renders nothing when the experience has neither a place nor an address', () => {
    const { container } = render(
      <ExperienceLocationSection experience={experience({ location: {} as never })} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
