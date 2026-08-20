import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { MomentComment } from '@/types/moment';

import { MomentComments } from './MomentComments';

const mockAddComment = jest.fn();
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
  useToggleCommentLike: () => ({ mutate: jest.fn() }),
  useFlagComment: () => ({ mutate: jest.fn(), isPending: false }),
  useFlagReasons: () => ({ data: undefined, isLoading: false }),
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
