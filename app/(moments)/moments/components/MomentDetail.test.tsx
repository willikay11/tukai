import React from 'react';

import { render, screen } from '@testing-library/react';

import { Moment } from '@/types/moment';

import { MomentDetail } from './MomentDetail';

const mockToggleLike = jest.fn();

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 'me' } } }) }));
jest.mock('@/app/shared/hooks/useMoments', () => ({
  useToggleMomentLike: () => ({ mutate: mockToggleLike }),
  useFlagMoment: () => ({ mutate: jest.fn(), isPending: false }),
  useFlagReasons: () => ({ data: undefined, isLoading: false }),
}));
jest.mock('./MomentComments', () => ({
  MomentComments: ({ momentId }: { momentId: string }) => <div>comments for {momentId}</div>,
}));
jest.mock('@/app/shared/components/Images/SquarePhotoStrip', () => ({
  SquarePhotoStrip: ({ photos }: { photos: string[] }) => <div>strip:{photos.length}</div>,
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: Record<string, unknown>) {
    return <img alt={alt as string} src={src as string} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const makeMoment = (overrides: Partial<Moment> = {}): Moment =>
  ({
    id: 'm1',
    title: 'Sunrise on the Mara',
    description: 'Worth the 4am start.',
    dateCreated: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    author: {
      id: 'u1',
      firstName: 'Asha',
      lastName: 'Mwangi',
      displayName: null,
      picture: null,
      isFollowing: false,
    },
    community: { id: 'c1', title: 'Trails And Us' },
    experience: null,
    place: null,
    media: [{ id: 'md1', photo: 'https://cdn.tukai.co/a.jpg', width: 800, height: 600, order: 0 }],
    totalLikes: 12,
    totalComments: 3,
    ...overrides,
  }) as unknown as Moment;

describe('MomentDetail', () => {
  it('shows author, relative time and the context label', () => {
    render(<MomentDetail moment={makeMoment()} />);

    expect(screen.getByText('Asha Mwangi')).toBeInTheDocument();
    expect(screen.getByText(/2 days ago · Trails And Us/)).toBeInTheDocument();
  });

  it('prefers displayName for the author', () => {
    const item = makeMoment();
    item.author.displayName = 'ashaeats';
    render(<MomentDetail moment={item} />);

    expect(screen.getByText('ashaeats')).toBeInTheDocument();
  });

  it('falls back through community, experience then place for context', () => {
    render(
      <MomentDetail
        moment={makeMoment({ community: null, experience: { id: 'e1', title: 'Mara Trip' } })}
      />,
    );

    expect(screen.getByText(/Mara Trip/)).toBeInTheDocument();
  });

  it('renders a single photo directly and multiple as a strip', () => {
    const { rerender } = render(<MomentDetail moment={makeMoment()} />);
    expect(screen.getByAltText('Sunrise on the Mara')).toBeInTheDocument();

    rerender(
      <MomentDetail
        moment={makeMoment({
          media: [
            { id: 'a', photo: 'x', width: 1, height: 1, order: 0 },
            { id: 'b', photo: 'y', width: 1, height: 1, order: 1 },
          ] as never,
        })}
      />,
    );
    expect(screen.getByText('strip:2')).toBeInTheDocument();
  });

  it('shows like and comment counts', () => {
    render(<MomentDetail moment={makeMoment()} />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  // No follow endpoint exists on the API
  it('renders Follow disabled', () => {
    render(<MomentDetail moment={makeMoment()} />);

    expect(screen.getByRole('button', { name: 'Follow' })).toBeDisabled();
  });

  it('hides Follow on the current user own moment', () => {
    const item = makeMoment();
    item.author.id = 'me';
    render(<MomentDetail moment={item} />);

    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument();
  });
});
