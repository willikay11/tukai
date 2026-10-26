import React from 'react';

import { render, screen } from '@testing-library/react';

import { Community } from '@/types/community';

import { CommunityResultRow } from './CommunityResultRow';
import { ResultGroup } from './ResultGroup';

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, src }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt as string} src={(src as string) ?? ''} />
  ),
}));

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
