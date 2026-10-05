import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Moment } from '@/types/moment';

import { MomentCard } from './index';

const useSession = jest.fn();
jest.mock('next-auth/react', () => ({ useSession: () => useSession() }));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
jest.mock('@/app/shared/components/Moments', () => ({
  // The name goes on an attribute, not in the text, so asserting on the
  // byline below does not also match the avatar's fallback
  MomentAvatar: ({ name }: { name: string }) => <span data-testid="avatar" title={name} />,
}));
jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
  FannedPhotos: ({ photos }: { photos: string[] }) => (
    <span data-testid="photo-pile">{photos.length}</span>
  ),
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const makeMoment = (overrides: Partial<Moment> = {}): Moment =>
  ({
    id: 'm1',
    title: 'First bowl',
    description: 'First bowl off the wheel.',
    author: { id: 'u1', firstName: 'Amina', lastName: 'Njeri', displayName: null, picture: null },
    community: { id: 'c1', title: 'Nairobi Makers Circle' },
    experience: null,
    place: null,
    media: [{ id: 'md1', mediaType: 'photo', photo: 'https://cdn.tukai.co/m1.jpg', order: 0 }],
    dateCreated: '2026-10-02T09:00:00Z',
    ...overrides,
  }) as unknown as Moment;

describe('MomentCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSession.mockReturnValue({ data: null });
  });

  it('renders the photo, the caption and the byline', () => {
    render(<MomentCard moment={makeMoment()} onClick={jest.fn()} />);

    expect(screen.getByAltText('First bowl')).toHaveAttribute('src', 'https://cdn.tukai.co/m1.jpg');
    expect(screen.getByText('First bowl off the wheel.')).toBeInTheDocument();
    expect(screen.getByText('Amina Njeri')).toBeInTheDocument();
    expect(screen.getByText('2 Oct')).toBeInTheDocument();
  });

  // A moment can carry several photos; the pile over the corner says so
  describe('the photo pile', () => {
    it('is absent for a moment with one photo', () => {
      render(<MomentCard moment={makeMoment()} onClick={jest.fn()} />);

      expect(screen.queryByTestId('photo-pile')).not.toBeInTheDocument();
    });

    it('shows the photos behind the first one', () => {
      const several = makeMoment({
        media: [0, 1, 2, 3].map((order) => ({
          id: `md${order}`,
          mediaType: 'photo',
          photo: `https://cdn.tukai.co/m${order}.jpg`,
          order,
        })) as never,
      });

      render(<MomentCard moment={several} onClick={jest.fn()} />);

      expect(screen.getByTestId('photo-pile')).toHaveTextContent('3');
    });
  });

  // jsdom reports no layout, so nothing ever overflows there — the clamp is
  // measured, and with no measurement to make the link stays off
  it('does not offer See more when the caption fits', () => {
    render(<MomentCard moment={makeMoment()} onClick={jest.fn()} />);

    expect(screen.queryByText('See more')).not.toBeInTheDocument();
  });

  it('leaves the caption out entirely when a moment has no words', () => {
    render(<MomentCard moment={makeMoment({ title: '', description: '' })} onClick={jest.fn()} />);

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  // A caption on its own does not say whether this was a community, a place or
  // an experience
  it('names what the moment was posted against', () => {
    render(<MomentCard moment={makeMoment()} onClick={jest.fn()} />);

    expect(screen.getByText('Nairobi Makers Circle')).toBeInTheDocument();
    expect(screen.getByTestId('UserMultipleIcon')).toBeInTheDocument();
  });

  it('uses the place icon for a moment on a place', () => {
    const onPlace = makeMoment({
      community: null,
      place: { id: 'p1', title: 'Talisman' } as never,
    });

    render(<MomentCard moment={onPlace} onClick={jest.fn()} />);

    expect(screen.getByText('Talisman')).toBeInTheDocument();
    expect(screen.getByTestId('Location01Icon')).toBeInTheDocument();
  });

  it('leaves the parent line out when a moment has no parent', () => {
    const orphan = makeMoment({ community: null, experience: null, place: null });

    render(<MomentCard moment={orphan} onClick={jest.fn()} />);

    expect(screen.queryByTestId('UserMultipleIcon')).not.toBeInTheDocument();
  });

  it('opens the moment when pressed', () => {
    const onClick = jest.fn();
    render(<MomentCard moment={makeMoment()} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });

  describe('the Yours pill', () => {
    it('is shown on the reader’s own moment', () => {
      useSession.mockReturnValue({ data: { user: { id: 'u1' } } });

      render(<MomentCard moment={makeMoment()} onClick={jest.fn()} />);

      expect(screen.getByText('Yours')).toBeInTheDocument();
    });

    it('is absent on someone else’s', () => {
      useSession.mockReturnValue({ data: { user: { id: 'u2' } } });

      render(<MomentCard moment={makeMoment()} onClick={jest.fn()} />);

      expect(screen.queryByText('Yours')).not.toBeInTheDocument();
    });

    // Regression: an undefined id must not match an undefined author id
    it('is absent for a signed-out reader', () => {
      render(<MomentCard moment={makeMoment({ author: {} as never })} onClick={jest.fn()} />);

      expect(screen.queryByText('Yours')).not.toBeInTheDocument();
    });
  });
});
