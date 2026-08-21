import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { MomentComment } from '@/types/moment';

import { MomentComments } from './MomentComments';

const mockAddComment = jest.fn();
const mockToggleCommentLike = jest.fn();
let commentsPages: unknown[] = [];
let isLoading = false;

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { name: 'George Ralak', image: null } } }),
}));
jest.mock('@/app/shared/hooks/useMoments', () => ({
  useMomentComments: () => ({
    data: { pages: commentsPages },
    isLoading,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
  useAddComment: () => ({ mutate: mockAddComment, isPending: false }),
  useToggleCommentLike: () => ({ mutate: mockToggleCommentLike }),
}));

const makeComment = (overrides: Partial<MomentComment> = {}): MomentComment =>
  ({
    id: 'c1',
    moment: 'm1',
    content: 'Beautiful shot',
    totalLikes: 4,
    totalFlags: 0,
    dateCreated: new Date(Date.now() - 3600 * 1000).toISOString(),
    dateModified: '',
    commenter: {
      id: 'u2',
      firstName: 'Ben',
      lastName: 'Otieno',
      displayName: null,
      picture: null,
      isFollowing: false,
    },
    ...overrides,
  }) as MomentComment;

const setComments = (comments: MomentComment[]) => {
  commentsPages = [{ data: { results: comments, count: comments.length } }];
};

beforeEach(() => {
  jest.clearAllMocks();
  isLoading = false;
  setComments([makeComment()]);
});

describe('MomentComments', () => {
  it('renders commenter name, relative time, content and like count', () => {
    render(<MomentComments momentId="m1" />);

    expect(screen.getByText('Ben Otieno')).toBeInTheDocument();
    expect(screen.getByText('an hour ago')).toBeInTheDocument();
    expect(screen.getByText('Beautiful shot')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('prefers displayName for the commenter', () => {
    const comment = makeComment();
    comment.commenter.displayName = 'benjamin';
    setComments([comment]);
    render(<MomentComments momentId="m1" />);

    expect(screen.getByText('benjamin')).toBeInTheDocument();
  });

  it('shows an empty state when there are no comments', () => {
    setComments([]);
    render(<MomentComments momentId="m1" />);

    expect(screen.getByText('No comments yet — be the first.')).toBeInTheDocument();
  });

  it('keeps the send button disabled until the draft has content', () => {
    render(<MomentComments momentId="m1" />);
    const post = screen.getByRole('button', { name: 'Post comment' });

    expect(post).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Leave a comment'), { target: { value: 'Nice' } });
    expect(post).toBeEnabled();
  });

  it('does not post a whitespace-only draft', () => {
    render(<MomentComments momentId="m1" />);

    fireEvent.change(screen.getByLabelText('Leave a comment'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post comment' }));

    expect(mockAddComment).not.toHaveBeenCalled();
  });

  it('posts the trimmed draft', () => {
    render(<MomentComments momentId="m1" />);

    fireEvent.change(screen.getByLabelText('Leave a comment'), { target: { value: '  Lovely  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post comment' }));

    expect(mockAddComment).toHaveBeenCalledWith('Lovely', expect.anything());
  });

  it('posts on Enter', () => {
    render(<MomentComments momentId="m1" />);
    const input = screen.getByLabelText('Leave a comment');

    fireEvent.change(input, { target: { value: 'Via enter' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockAddComment).toHaveBeenCalledWith('Via enter', expect.anything());
  });
});

// Matches the design: an avatar, a placeholder and a send icon in one pill
describe('comment bar', () => {
  it('shows the signed-in user avatar beside the input', () => {
    render(<MomentComments momentId="m1" />);

    expect(screen.getByLabelText('Leave a comment')).toHaveAttribute(
      'placeholder',
      'Leave a comment...',
    );
    // No picture on the session, so the avatar falls back to the initial
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('sends with an icon button rather than a Post label', () => {
    render(<MomentComments momentId="m1" />);

    expect(screen.getByRole('button', { name: 'Post comment' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Post' })).not.toBeInTheDocument();
  });
});

// POST /v1/moments/{moment_id}/comments/{comment_id}/like/
describe('liking a comment', () => {
  const heartOf = (text: string) => {
    const row = screen.getByText(text).closest('div')?.parentElement;
    return row?.querySelector('button');
  };

  it('calls the toggle with the comment id', () => {
    render(<MomentComments momentId="m1" />);

    fireEvent.click(heartOf('Beautiful shot') as HTMLElement);

    expect(mockToggleCommentLike).toHaveBeenCalledWith('c1', expect.anything());
  });

  it('optimistically bumps the count and lights the heart', () => {
    render(<MomentComments momentId="m1" />);

    expect(screen.getByText('4')).toBeInTheDocument();
    fireEvent.click(heartOf('Beautiful shot') as HTMLElement);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('holds the optimistic count until the refetched total arrives', () => {
    mockToggleCommentLike.mockImplementation((_id, options) =>
      options.onSuccess({ isLiked: true }),
    );
    render(<MomentComments momentId="m1" />);

    fireEvent.click(heartOf('Beautiful shot') as HTMLElement);

    // Snapping back to the stale 4 here would read as a flicker
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(heartOf('Beautiful shot')?.querySelector('.text-red-500')).toBeInTheDocument();
  });

  it('drops the delta once the server reports a new total', () => {
    mockToggleCommentLike.mockImplementation((_id, options) =>
      options.onSuccess({ isLiked: true }),
    );
    const { rerender } = render(<MomentComments momentId="m1" />);

    fireEvent.click(heartOf('Beautiful shot') as HTMLElement);
    expect(screen.getByText('5')).toBeInTheDocument();

    // The invalidated query comes back with the server's own count
    setComments([makeComment({ totalLikes: 5 })]);
    rerender(<MomentComments momentId="m1" />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('rolls back when the request fails', () => {
    mockToggleCommentLike.mockImplementation((_id, options) => options.onError());
    render(<MomentComments momentId="m1" />);

    fireEvent.click(heartOf('Beautiful shot') as HTMLElement);

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(heartOf('Beautiful shot')?.querySelector('.text-red-500')).not.toBeInTheDocument();
  });
});

// Regression: clicking "like" on a comment the user had already liked removed
// the like instead — the heart flashed red then went clear.
describe('when the starting like state is wrong', () => {
  const heartOf = (text: string) => {
    const row = screen.getByText(text).closest('div')?.parentElement;
    return row?.querySelector('button');
  };

  it('toggles again so the reader ends up liked, as they asked', () => {
    let call = 0;
    mockToggleCommentLike.mockImplementation((_id, options) => {
      call += 1;
      // First call removed a like we did not know about; second re-adds it
      options.onSuccess({ isLiked: call !== 1 });
    });
    render(<MomentComments momentId="m1" />);

    fireEvent.click(heartOf('Beautiful shot') as HTMLElement);

    expect(call).toBe(2);
    expect(heartOf('Beautiful shot')?.querySelector('.text-red-500')).toBeInTheDocument();
    // The two calls cancel out, so the total is unchanged
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('retries only once, so an inconsistent server cannot loop', () => {
    let call = 0;
    mockToggleCommentLike.mockImplementation((_id, options) => {
      call += 1;
      // Always contradicts the intent
      options.onSuccess({ isLiked: false });
    });
    render(<MomentComments momentId="m1" />);

    fireEvent.click(heartOf('Beautiful shot') as HTMLElement);

    expect(call).toBe(2);
    expect(heartOf('Beautiful shot')?.querySelector('.text-red-500')).not.toBeInTheDocument();
  });
});

// Regression: the heart always started unlit, so a comment the user had
// already liked looked unliked, and the first click unliked it — the red
// flash then revert people were seeing.
describe('like state on load', () => {
  const heartOf = (text: string) => {
    const row = screen.getByText(text).closest('div')?.parentElement;
    return row?.querySelector('button');
  };

  it('shows a comment the user already liked as lit', () => {
    setComments([makeComment({ isLiked: true })]);
    render(<MomentComments momentId="m1" />);

    expect(heartOf('Beautiful shot')?.querySelector('.text-red-500')).toBeInTheDocument();
  });

  it('shows an unliked comment as unlit', () => {
    setComments([makeComment({ isLiked: false })]);
    render(<MomentComments momentId="m1" />);

    expect(heartOf('Beautiful shot')?.querySelector('.text-red-500')).not.toBeInTheDocument();
  });

  // An already-liked comment must unlike on click, not like-then-revert
  it('unlikes on the first click when the comment was already liked', () => {
    mockToggleCommentLike.mockImplementation((_id, options) =>
      options.onSuccess({ isLiked: false }),
    );
    setComments([makeComment({ isLiked: true })]);
    render(<MomentComments momentId="m1" />);

    fireEvent.click(heartOf('Beautiful shot') as HTMLElement);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(heartOf('Beautiful shot')?.querySelector('.text-red-500')).not.toBeInTheDocument();
  });

  it('falls back to unlit when the serializer omits is_liked', () => {
    setComments([makeComment()]);
    render(<MomentComments momentId="m1" />);

    expect(heartOf('Beautiful shot')?.querySelector('.text-red-500')).not.toBeInTheDocument();
  });
});

describe('comment actions', () => {
  it('offers only the like control on a comment', () => {
    setComments([makeComment()]);
    render(<MomentComments momentId="m1" />);

    // Report was removed; the send button belongs to the add-comment bar
    expect(screen.queryByRole('button', { name: /Report/i })).not.toBeInTheDocument();

    const row = screen.getByText('Beautiful shot').closest('div')?.parentElement;
    expect(row?.querySelectorAll('button')).toHaveLength(1);
  });
});
