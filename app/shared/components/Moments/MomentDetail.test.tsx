import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import moment from 'moment';

import { Moment } from '@/types/moment';

import { MomentDetail } from './MomentDetail';

const mockToggleLike = jest.fn();

let sessionUser: Record<string, unknown> | null = { id: 'me' };
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: sessionUser ? { user: sessionUser } : null }),
}));

const openSignInWithCallback = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ openSignInWithCallback, setOpenSignIn: jest.fn() }),
}));
jest.mock('@/app/shared/hooks/useMoments', () => ({
  useToggleMomentLike: () => ({ mutate: mockToggleLike }),
  useFlagMoment: () => ({ mutate: jest.fn(), isPending: false }),
  useFlagReasons: () => ({ data: undefined, isLoading: false }),
}));
jest.mock('./MomentComments', () => ({
  MomentComments: ({ momentId }: { momentId: string }) => <div>comments for {momentId}</div>,
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
  it('shows author, the posting date and the context label', () => {
    const item = makeMoment();
    render(<MomentDetail moment={item} />);

    expect(screen.getByText('Asha Mwangi')).toBeInTheDocument();
    // Absolute, as the drawer shows it: "26 Sep", not "2 days ago"
    expect(screen.getByText(moment(item.dateCreated).format('D MMM'))).toBeInTheDocument();
    expect(screen.getByText('Trails And Us')).toBeInTheDocument();
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

  it('shows every photo in the carousel, even a single one', () => {
    const { rerender } = render(<MomentDetail moment={makeMoment()} />);
    expect(screen.getByAltText('Sunrise on the Mara photo 1')).toBeInTheDocument();

    rerender(
      <MomentDetail
        moment={makeMoment({
          media: [
            { id: 'a', photo: 'https://cdn.tukai.co/a.jpg', width: 1, height: 1, order: 0 },
            { id: 'b', photo: 'https://cdn.tukai.co/b.jpg', width: 1, height: 1, order: 1 },
          ] as never,
        })}
      />,
    );
    expect(screen.getByAltText('Sunrise on the Mara photo 1')).toBeInTheDocument();
    expect(screen.getByAltText('Sunrise on the Mara photo 2')).toBeInTheDocument();
  });

  // Regression: media with photo: null (a video, or an upload still
  // processing) reached next/image and threw, crashing the page
  it('ignores media whose photo cannot be rendered', () => {
    render(
      <MomentDetail
        moment={makeMoment({
          media: [
            { id: 'v', photo: null, width: 1, height: 1, order: 0 },
            { id: 'ok', photo: 'https://cdn.tukai.co/real.jpg', width: 800, height: 600, order: 1 },
          ] as never,
        })}
      />,
    );

    // One renderable photo left, so the carousel holds just that one
    expect(screen.getByAltText('Sunrise on the Mara photo 1')).toHaveAttribute(
      'src',
      'https://cdn.tukai.co/real.jpg',
    );
  });

  it('renders no image at all when every media item is unrenderable', () => {
    render(
      <MomentDetail
        moment={makeMoment({
          media: [{ id: 'v', photo: null, width: 1, height: 1, order: 0 }] as never,
        })}
      />,
    );

    expect(screen.queryByAltText(/Sunrise on the Mara photo/)).not.toBeInTheDocument();
    expect(screen.getByText('Worth the 4am start.')).toBeInTheDocument();
  });

  it('shows like and comment counts', () => {
    render(<MomentDetail moment={makeMoment()} />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  // The drawer has no Follow control: the API has no follow endpoint yet
  it('has no Follow control', () => {
    render(<MomentDetail moment={makeMoment()} />);

    expect(screen.queryByRole('button', { name: /Follow/ })).not.toBeInTheDocument();
  });
});

// Same regression as comments: the heart ignored the server's is_liked
describe('moment like state on load', () => {
  const heart = () => screen.getByText('12').closest('button');

  it('shows a moment the user already liked as lit', () => {
    render(<MomentDetail moment={makeMoment({ isLiked: true })} />);

    expect(heart()?.querySelector('.text-red-500')).toBeInTheDocument();
  });

  it('shows an unliked moment as unlit', () => {
    render(<MomentDetail moment={makeMoment({ isLiked: false })} />);

    expect(heart()?.querySelector('.text-red-500')).not.toBeInTheDocument();
  });

  it('falls back to unlit when the serializer omits is_liked', () => {
    render(<MomentDetail moment={makeMoment()} />);

    expect(heart()?.querySelector('.text-red-500')).not.toBeInTheDocument();
  });
});

/**
 * Moments read without an account - the feed, a moment and its comments are
 * all public. The actions that write are not, and each asks at the point it is
 * pressed rather than bouncing the reader at the door.
 */
describe('a reader who is not signed in', () => {
  const heart = () => screen.getByText('12').closest('button') as HTMLElement;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionUser = null;
  });

  afterEach(() => {
    sessionUser = { id: 'me' };
  });

  it('still sees the moment', () => {
    render(<MomentDetail moment={makeMoment()} />);

    expect(screen.getByText('Worth the 4am start.')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('is asked to sign in rather than liking', () => {
    render(<MomentDetail moment={makeMoment()} />);

    fireEvent.click(heart());

    expect(mockToggleLike).not.toHaveBeenCalled();
    expect(openSignInWithCallback).toHaveBeenCalled();
    // Nothing moves until they are actually signed in
    expect(heart().querySelector('.text-red-500')).not.toBeInTheDocument();
  });

  it('likes it once signing in is done, so the press is not wasted', () => {
    render(<MomentDetail moment={makeMoment()} />);

    fireEvent.click(heart());
    openSignInWithCallback.mock.calls[0][0]();

    expect(mockToggleLike).toHaveBeenCalledWith('m1', expect.anything());
  });

  it('is asked to sign in rather than opening the report picker', () => {
    render(<MomentDetail moment={makeMoment()} />);

    fireEvent.click(screen.getByRole('button', { name: /report/i }));

    expect(openSignInWithCallback).toHaveBeenCalled();
  });
});

/**
 * The composer asks one question and sends the first line as `title` and the
 * whole text as `description`. Every moment on the API therefore carries the
 * same words twice, and the detail pane printed both.
 */
describe('a moment body', () => {
  it('is shown once, not as a bold title above the same words again', () => {
    render(
      <MomentDetail moment={makeMoment({ title: 'Same words', description: 'Same words' })} />,
    );

    expect(screen.getAllByText('Same words')).toHaveLength(1);
  });

  it('is the description, which carries the whole text', () => {
    render(<MomentDetail moment={makeMoment()} />);

    expect(screen.getByText('Worth the 4am start.')).toBeInTheDocument();
    expect(screen.queryByText('Sunrise on the Mara')).not.toBeInTheDocument();
  });

  // Another client could post a title with no body
  it('falls back to the title when there is no description', () => {
    render(<MomentDetail moment={makeMoment({ description: '' })} />);

    expect(screen.getByText('Sunrise on the Mara')).toBeInTheDocument();
  });
});

/**
 * The canvas pairs a moment's parent with its own icon and a word for the
 * kind. "Trails And Us" on its own does not say whether it is a community, an
 * experience or a place.
 */
describe('what the moment was posted against', () => {
  it.each([
    [
      'community',
      { community: { id: 'c1', title: 'Trails And Us' } },
      'UserMultipleIcon',
      'Community',
    ],
    [
      'experience',
      { community: null, experience: { id: 'e1', title: 'Mara Trip' } },
      'Ticket01Icon',
      'Experience',
    ],
    [
      'place',
      { community: null, experience: null, place: { id: 'p1', title: 'Kraftory' } },
      'Location01Icon',
      'Place',
    ],
  ])('marks a %s with its own icon and kind', (_name, parent, icon, kind) => {
    render(<MomentDetail moment={makeMoment(parent as never)} />);

    expect(screen.getByTestId(icon)).toBeInTheDocument();
    expect(screen.getByText(`(${kind})`)).toBeInTheDocument();
  });

  it('shows no context for a moment posted against nothing', () => {
    render(<MomentDetail moment={makeMoment({ community: null } as never)} />);

    expect(screen.queryByText('(Community)')).not.toBeInTheDocument();
  });
});
