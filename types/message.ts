import { LinkedUser, linkedUserName } from '@/types/user';

/** One message, as either side of a conversation sees it. */
export type Message = {
  id: string;
  sender?: LinkedUser;
  recipient?: LinkedUser;
  content: string;
  category?: string | null;
  isRead: boolean;
  source?: string | null;
  dateCreated?: string;
};

/**
 * A conversation, worked out from the flat message list.
 *
 * The API has no threads: `GET /comms/messages/` returns every message the
 * reader is party to, so who the other person is has to be read off each one
 * and the messages grouped by them.
 */
export type MessageThread = {
  /** The other person's id, which is also the thread's identity. */
  personId: string;
  person?: LinkedUser;
  name: string;
  messages: Message[];
  last: Message;
  /** Unread messages sent *to* the reader. Their own are never unread. */
  unreadCount: number;
};

const when = (message: Message) => new Date(message.dateCreated ?? 0).getTime();

/** The person on the other side of a message from the reader. */
export const otherParty = (message: Message, myId: string): LinkedUser | undefined =>
  message.sender?.id === myId ? message.recipient : message.sender;

export const isMine = (message: Message, myId: string): boolean => message.sender?.id === myId;

export const toThreads = (messages: Message[], myId: string): MessageThread[] => {
  const threads = new Map<string, MessageThread>();

  messages.forEach((message) => {
    const person = otherParty(message, myId);
    // A message with nobody on the other side cannot be filed under anyone
    if (!person?.id) return;

    const existing = threads.get(person.id);
    const unread = !message.isRead && !isMine(message, myId) ? 1 : 0;

    if (!existing) {
      threads.set(person.id, {
        personId: person.id,
        person,
        name: linkedUserName(person),
        messages: [message],
        last: message,
        unreadCount: unread,
      });
      return;
    }

    existing.messages.push(message);
    existing.unreadCount += unread;
    if (when(message) > when(existing.last)) existing.last = message;
  });

  return Array.from(threads.values())
    .map((thread) => ({
      ...thread,
      // Oldest first inside a conversation, which is how one is read
      messages: [...thread.messages].sort((a, b) => when(a) - when(b)),
    }))
    .sort((a, b) => when(b.last) - when(a.last));
};

/** What a thread row shows of its last message, as the canvas prefixes it. */
export const threadPreview = (thread: MessageThread, myId: string): string =>
  `${isMine(thread.last, myId) ? 'You: ' : ''}${thread.last.content}`;

export const matchesThread = (thread: MessageThread, query: string): boolean => {
  const wanted = query.trim().toLowerCase();
  if (!wanted) return true;

  return (
    thread.name.toLowerCase().includes(wanted) ||
    thread.messages.some((message) => message.content.toLowerCase().includes(wanted))
  );
};
