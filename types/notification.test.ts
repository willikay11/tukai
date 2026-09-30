import { AppNotification, notificationIcon, splitByRead, unreadBadge } from './notification';

const notification = (overrides: Partial<AppNotification> = {}): AppNotification => ({
  id: 'n1',
  content: 'Amina joined Nairobi Hikers',
  isRead: false,
  ...overrides,
});

describe('notificationIcon', () => {
  it('draws each kind with its own icon', () => {
    expect(notificationIcon(notification({ pushCategory: 'community' }))).toBe('UserMultipleIcon');
    expect(notificationIcon(notification({ pushCategory: 'booking' }))).toBe('Invoice01Icon');
  });

  // `category` is free-form on the wire; `push_category` is the enumerated one
  it('falls back where the kind is missing or unknown', () => {
    expect(notificationIcon(notification())).toBe('Notification03Icon');
    expect(notificationIcon(notification({ pushCategory: 'whatever' as 'community' }))).toBe(
      'Notification03Icon',
    );
  });
});

describe('splitByRead', () => {
  it('puts what is new apart from what has been seen', () => {
    const rows = [
      notification(),
      notification({ id: 'n2', isRead: true }),
      notification({ id: 'n3' }),
    ];

    const { unread, read } = splitByRead(rows);

    expect(unread.map((one) => one.id)).toEqual(['n1', 'n3']);
    expect(read.map((one) => one.id)).toEqual(['n2']);
  });

  it('copes with nothing at all', () => {
    expect(splitByRead([])).toEqual({ unread: [], read: [] });
  });
});

describe('unreadBadge', () => {
  it('counts what is unread', () => {
    expect(unreadBadge(3)).toBe('3');
  });

  // Past nine a badge stops counting
  it('stops counting past nine', () => {
    expect(unreadBadge(10)).toBe('9+');
    expect(unreadBadge(9)).toBe('9');
  });

  it('shows nothing when there is nothing unread', () => {
    expect(unreadBadge(0)).toBeNull();
    expect(unreadBadge(-1)).toBeNull();
  });
});
