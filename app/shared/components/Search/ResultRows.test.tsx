import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Place } from '@/types/place';

import { CommunityResultRow } from './CommunityResultRow';
import { ExperienceResultRow } from './ExperienceResultRow';
import { PlaceResultRow } from './PlaceResultRow';
import { ResultGroup } from './ResultGroup';

// The reader's own coordinates decide whether a distance can be shown at all
const mockLocation = jest.fn(() => ({ lat: undefined, lng: undefined }) as Record<string, unknown>);
jest.mock('@/context/LocationContext', () => ({
  useLocation: () => mockLocation(),
}));

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, src }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt as string} src={(src as string) ?? ''} />
  ),
}));

const experience = {
  id: 'e1',
  title: 'Karura Forest Hike',
  photos: [{ id: 'p1', photo: 'https://cdn.tukai.co/karura.jpg', isCover: true }],
  priceStartsFrom: { amount: 1500, currency: 'Ksh.' },
  location: { city: 'Nairobi', pointLat: -1.24, pointLong: 36.83 },
  startDate: '2026-09-01T09:00:00Z',
  endDate: '2026-09-01T12:00:00Z',
} as unknown as Experience;

describe('ExperienceResultRow', () => {
  beforeEach(() => mockLocation.mockReturnValue({ lat: undefined, lng: undefined }));

  it('shows the title and per-person price', () => {
    render(<ExperienceResultRow item={experience} onClick={jest.fn()} />);

    expect(screen.getByText('Karura Forest Hike')).toBeInTheDocument();
    expect(screen.getByText('Ksh. 1,500/Person')).toBeInTheDocument();
  });

  // A single-day experience is described by how long it runs
  it('reads a same-day span as hours', () => {
    render(<ExperienceResultRow item={experience} onClick={jest.fn()} />);

    expect(screen.getByText(/3 hours/)).toBeInTheDocument();
  });

  it('reads a multi-day span as days', () => {
    render(
      <ExperienceResultRow
        item={{ ...experience, endDate: '2026-09-03T12:00:00Z' } as Experience}
        onClick={jest.fn()}
      />,
    );

    expect(screen.getByText(/3 days/)).toBeInTheDocument();
  });

  // The API returns no distance, so it can only be derived once the reader has
  // set their own location
  it('omits the distance until the reader has a location', () => {
    render(<ExperienceResultRow item={experience} onClick={jest.fn()} />);

    expect(screen.getByText(/Nairobi/)).toBeInTheDocument();
    expect(screen.queryByText(/Kms/)).not.toBeInTheDocument();
  });

  it('shows the distance once the reader has one', () => {
    mockLocation.mockReturnValue({ lat: -1.29, lng: 36.82 });

    render(<ExperienceResultRow item={experience} onClick={jest.fn()} />);

    expect(screen.getByText(/Kms/)).toBeInTheDocument();
  });

  it('fires onClick', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(<ExperienceResultRow item={experience} onClick={onClick} />);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });
});

const place = {
  id: 'pl1',
  title: 'Talisman',
  photos: [],
  averageRating: 4.6,
  totalReviews: 12,
  categories: [
    { id: 'c1', name: 'Nairobi', group: 'cities' },
    { id: 'c2', name: 'Restaurants', group: 'interests' },
  ],
  location: { city: 'Karen' },
} as unknown as Place;

describe('PlaceResultRow', () => {
  it('shows the title, rating and category · area', () => {
    render(<PlaceResultRow item={place} onClick={jest.fn()} />);

    expect(screen.getByText('Talisman')).toBeInTheDocument();
    expect(screen.getByText('4.6')).toBeInTheDocument();
    expect(screen.getByText('Restaurants · Karen')).toBeInTheDocument();
  });

  // Category comes from the interests group; the cities one just repeats the area
  it('ignores the city category when naming the kind of place', () => {
    render(<PlaceResultRow item={place} onClick={jest.fn()} />);

    expect(screen.queryByText(/Nairobi · /)).not.toBeInTheDocument();
  });

  // Nothing has been rated yet, so 0 is "unrated" rather than a bad score
  it('hides a zero rating', () => {
    render(<PlaceResultRow item={{ ...place, averageRating: 0 } as Place} onClick={jest.fn()} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});

const community = {
  id: 'cm1',
  title: 'Nairobi Hikers',
  photos: [],
  categories: [
    { id: 'a', name: 'Hiking' },
    { id: 'b', name: 'Outdoors' },
  ],
} as unknown as Community;

describe('CommunityResultRow', () => {
  it('shows the title and its activities', () => {
    render(<CommunityResultRow item={community} onClick={jest.fn()} />);

    expect(screen.getByText('Nairobi Hikers')).toBeInTheDocument();
    expect(screen.getByText('Hiking · Outdoors')).toBeInTheDocument();
  });

  it('copes with no categories', () => {
    render(
      <CommunityResultRow
        item={{ ...community, categories: [] } as Community}
        onClick={jest.fn()}
      />,
    );

    expect(screen.getByText('Nairobi Hikers')).toBeInTheDocument();
  });
});

describe('ResultGroup', () => {
  it('renders a heading, its count and its children', () => {
    render(
      <ResultGroup title="Experiences" count="2 experiences">
        <p>a row</p>
      </ResultGroup>,
    );

    expect(screen.getByRole('heading', { name: 'Experiences' })).toBeInTheDocument();
    expect(screen.getByText('2 experiences')).toBeInTheDocument();
    expect(screen.getByText('a row')).toBeInTheDocument();
  });
});
