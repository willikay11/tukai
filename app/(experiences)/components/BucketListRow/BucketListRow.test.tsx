import React from 'react';

import { render, screen } from '@testing-library/react';

import { BucketList } from '@/types/bucket-list';

import { BucketListRow } from './index';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});
jest.mock('next/link', () => {
  function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const makeList = (overrides: Partial<BucketList> = {}): BucketList =>
  ({
    id: 'bl1',
    name: 'Nairobi creative weekends',
    visibility: 'public',
    coverImage: 'https://cdn.tukai.co/bl1.jpg',
    owner: { id: 'u1', firstName: 'Amina', lastName: 'Njeri', picture: null },
    itemCount: 4,
    memberCount: 22,
    ...overrides,
  }) as unknown as BucketList;

describe('BucketListRow', () => {
  it('names the list and links to it', () => {
    render(<BucketListRow bucketList={makeList()} />);

    expect(screen.getByText('Nairobi creative weekends')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/bucket-lists/bl1');
  });

  it('credits whoever made it', () => {
    render(<BucketListRow bucketList={makeList()} />);

    expect(screen.getByText('Amina Njeri')).toBeInTheDocument();
  });

  it('says how much is on the list', () => {
    render(<BucketListRow bucketList={makeList()} />);

    expect(screen.getByText('4 saved')).toBeInTheDocument();
  });

  it('says one saved item in the singular', () => {
    render(<BucketListRow bucketList={makeList({ itemCount: 1 })} />);

    expect(screen.getByText('1 saved')).toBeInTheDocument();
  });

  // ⚠️ Only the owner has a face: the list endpoint carries member_count but
  // no membership records
  it('counts the members who are not pictured', () => {
    render(<BucketListRow bucketList={makeList()} />);

    expect(screen.getByText('+21')).toBeInTheDocument();
  });

  it('shows no overflow where the owner is the only member', () => {
    render(<BucketListRow bucketList={makeList({ memberCount: 1 })} />);

    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('still renders a list whose owner the API left out', () => {
    render(<BucketListRow bucketList={makeList({ owner: undefined })} />);

    expect(screen.getByText('Nairobi creative weekends')).toBeInTheDocument();
    expect(screen.getByText('4 saved')).toBeInTheDocument();
    expect(screen.queryByText(/^By/)).not.toBeInTheDocument();
  });
});
