import {
  Message,
  conversationBreak,
  isMine,
  isThreadUnread,
  matchesThread,
  otherParty,
  threadPreview,
  toConversationRows,
  toThreads,
} from './message';

const ME = 'me';

const message = (overrides: Partial<Message> = {}): Message => ({
  id: 'm1',
  sender: { id: 'them', displayName: 'Amina' },
  recipient: { id: ME, displayName: 'Me' },
  content: 'Is the hike still on?',
  isRead: false,
  dateCreated: '2026-09-29T10:00:00Z',
  ...overrides,
});

const fromMe = (overrides: Partial<Message> = {}): Message =>
  message({
    sender: { id: ME, displayName: 'Me' },
    recipient: { id: 'them', displayName: 'Amina' },
    ...overrides,
  });

describe('otherParty', () => {
  it('is the sender on a message to the reader', () => {
    expect(otherParty(message(), ME)?.id).toBe('them');
  });

  it('is the recipient on a message from the reader', () => {
    expect(otherParty(fromMe(), ME)?.id).toBe('them');
  });
});

describe('isMine', () => {
  it('knows which side sent it', () => {
    expect(isMine(fromMe(), ME)).toBe(true);
    expect(isMine(message(), ME)).toBe(false);
  });
});

/**
 * The API has no threads - one flat list of every message the reader is party
 * to - so a conversation is worked out from who is on the other side.
 */
describe('toThreads', () => {
  it('groups a conversation under the other person', () => {
    const threads = toThreads(
      [message({ id: 'm1' }), fromMe({ id: 'm2', content: 'Yes, 6am.' })],
      ME,
    );

    expect(threads).toHaveLength(1);
    expect(threads[0].personId).toBe('them');
    expect(threads[0].messages.map((one) => one.id)).toEqual(['m1', 'm2']);
  });

  it('keeps separate people apart', () => {
    const threads = toThreads(
      [message({ id: 'm1' }), message({ id: 'm2', sender: { id: 'other', displayName: 'Kevo' } })],
      ME,
    );

    expect(threads.map((one) => one.personId).sort()).toEqual(['other', 'them']);
  });

  // Newest conversation first, oldest message first inside it
  it('orders the threads by their last message', () => {
    const threads = toThreads(
      [
        message({ id: 'old', dateCreated: '2026-09-01T10:00:00Z' }),
        message({
          id: 'new',
          sender: { id: 'other', displayName: 'Kevo' },
          dateCreated: '2026-09-29T10:00:00Z',
        }),
      ],
      ME,
    );

    expect(threads[0].personId).toBe('other');
  });

  it('reads a conversation oldest first', () => {
    const threads = toThreads(
      [
        message({ id: 'later', dateCreated: '2026-09-29T12:00:00Z' }),
        message({ id: 'earlier', dateCreated: '2026-09-29T09:00:00Z' }),
      ],
      ME,
    );

    expect(threads[0].messages.map((one) => one.id)).toEqual(['earlier', 'later']);
    expect(threads[0].last.id).toBe('later');
  });

  // The reader's own messages are never unread to them
  it('counts only what was sent to the reader as unread', () => {
    const threads = toThreads(
      [message({ id: 'm1' }), fromMe({ id: 'm2' }), message({ id: 'm3', isRead: true })],
      ME,
    );

    expect(threads[0].unreadCount).toBe(1);
  });

  it('drops a message with nobody on the other side', () => {
    expect(toThreads([message({ sender: undefined, recipient: undefined })], ME)).toHaveLength(0);
  });
});

describe('isThreadUnread', () => {
  it('counts a conversation with something unread sent to the reader', () => {
    const [thread] = toThreads([message()], ME);

    expect(isThreadUnread(thread, ME)).toBe(true);
  });

  it('stops counting once it is read', () => {
    const [thread] = toThreads([message({ isRead: true })], ME);

    expect(isThreadUnread(thread, ME)).toBe(false);
  });

  // Replying is reading, as the design has it
  it('stops counting once the reader replies', () => {
    const [thread] = toThreads(
      [message(), fromMe({ id: 'm2', dateCreated: '2026-09-29T11:00:00Z' })],
      ME,
    );

    expect(isThreadUnread(thread, ME)).toBe(false);
  });
});

describe('threadPreview', () => {
  it('marks a last message the reader sent', () => {
    const [thread] = toThreads([fromMe({ content: 'Yes, 6am.' })], ME);

    expect(threadPreview(thread, ME)).toBe('You: Yes, 6am.');
  });

  it("shows the other side's words as they are", () => {
    const [thread] = toThreads([message()], ME);

    expect(threadPreview(thread, ME)).toBe('Is the hike still on?');
  });
});

describe('matchesThread', () => {
  const [thread] = toThreads([message()], ME);

  it('keeps everything when nothing is typed', () => {
    expect(matchesThread(thread, '  ')).toBe(true);
  });

  it('matches the person', () => {
    expect(matchesThread(thread, 'amin')).toBe(true);
  });

  it('matches what was said', () => {
    expect(matchesThread(thread, 'hike')).toBe(true);
  });

  it('drops what matches neither', () => {
    expect(matchesThread(thread, 'mombasa')).toBe(false);
  });
});

describe('conversationBreak', () => {
  it('writes the day, date and time', () => {
    expect(conversationBreak(new Date(2026, 10, 1, 12, 58))).toBe('Sun, Nov 1 at 12:58 PM');
    expect(conversationBreak(new Date(2026, 10, 3, 9, 14))).toBe('Tue, Nov 3 at 9:14 AM');
  });
});

describe('toConversationRows', () => {
  const at = (hours: number, minutes: number) =>
    new Date(2026, 10, 1, hours, minutes).toISOString();

  it('breaks before the first message and after more than two hours, dividing the rest', () => {
    const rows = toConversationRows(
      [
        message({ id: 'a', dateCreated: at(12, 58) }),
        fromMe({ id: 'b', dateCreated: at(13, 6) }),
        message({ id: 'c', dateCreated: at(15, 6) }),
        message({ id: 'd', dateCreated: at(17, 7) }),
      ],
      ME,
    );

    expect(
      rows.map((row) => (row.kind === 'break' ? 'break' : `${row.key}${row.divided ? '|' : ''}`)),
    ).toEqual([
      'break',
      'a',
      'b|',
      // Exactly two hours is still the same stretch
      'c|',
      'break',
      'd',
    ]);
  });

  it('marks what the reader sent', () => {
    const rows = toConversationRows([fromMe()], ME);

    expect(rows[1]).toEqual(expect.objectContaining({ kind: 'message', mine: true }));
  });
});
