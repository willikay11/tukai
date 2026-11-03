import {
  AppNotification,
  inboxStamp,
  notificationHref,
  notificationIcon,
  notificationList,
  splitByRead,
  unreadBadge,
  withRead,
} from './notification';

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

  // The handoff's suggestion for its open question 12
  it('stops counting past 99', () => {
    expect(unreadBadge(99)).toBe('99');
    expect(unreadBadge(100)).toBe('99+');
  });

  it('shows nothing when there is nothing unread', () => {
    expect(unreadBadge(0)).toBeNull();
    expect(unreadBadge(-1)).toBeNull();
  });
});

describe('inboxStamp', () => {
  // Built from local parts so the test reads the same in any time zone
  const local = (month: number, day: number, hours: number, minutes: number) =>
    new Date(2026, month, day, hours, minutes).toISOString();

  it('writes the time absolutely, on a 12-hour clock with no leading zero', () => {
    expect(inboxStamp(local(10, 3, 9, 20))).toBe('Nov 3, 9:20 AM');
    expect(inboxStamp(local(10, 2, 18, 5))).toBe('Nov 2, 6:05 PM');
  });

  it('writes midnight and noon as 12', () => {
    expect(inboxStamp(local(0, 1, 0, 0))).toBe('Jan 1, 12:00 AM');
    expect(inboxStamp(local(0, 1, 12, 30))).toBe('Jan 1, 12:30 PM');
  });

  it('writes nothing for a missing or broken date', () => {
    expect(inboxStamp(undefined)).toBeNull();
    expect(inboxStamp('not a date')).toBeNull();
  });
});

describe('notificationHref', () => {
  it('follows a path inside the app', () => {
    expect(notificationHref(notification({ source: '/communities/trails-and-us' }))).toBe(
      '/communities/trails-and-us',
    );
  });

  // `source` is a free string on the wire, so only an in-app path is trusted
  it('goes nowhere for anything else', () => {
    expect(notificationHref(notification())).toBeNull();
    expect(notificationHref(notification({ source: 'community' }))).toBeNull();
    expect(notificationHref(notification({ source: 'https://example.com' }))).toBeNull();
    expect(notificationHref(notification({ source: '//example.com' }))).toBeNull();
  });
});

describe('notificationList', () => {
  it('reads a paginated answer as well as a bare list', () => {
    expect(notificationList([notification()])).toHaveLength(1);
    expect(notificationList({ results: [notification()] })).toHaveLength(1);
    expect(notificationList(undefined)).toEqual([]);
  });
});

describe('withRead', () => {
  it('reads only what it is told to, keeping the shape', () => {
    const rows = [notification(), notification({ id: 'n2' })];

    expect(withRead(rows, (one) => one.id === 'n2').map((one) => one.isRead)).toEqual([
      false,
      true,
    ]);
    expect(withRead({ results: rows, count: 2 }, () => true)).toEqual({
      results: rows.map((one) => ({ ...one, isRead: true })),
      count: 2,
    });
  });
});
