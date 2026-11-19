import type { TukaiConversation, TukaiRecommendationCard } from '@/types/tukai';

import {
  cardToItem,
  chatDayLabel,
  conversationSubtitle,
  savedChatToTukaiChat,
} from './tukai-saved-chats';

const card = (extra: Partial<TukaiRecommendationCard> = {}): TukaiRecommendationCard => ({
  type: 'place',
  id: 'pl1',
  slug: 'about-thyme',
  name: 'About Thyme',
  rating: 4.6,
  reviewCount: 12,
  area: 'Westlands',
  latitude: -1.26,
  longitude: 36.8,
  blurb: 'A garden restaurant.',
  photos: [
    { mdUrl: 'https://cdn/md.webp', thumbUrl: 'https://cdn/thumb.webp' },
    { mdUrl: null, thumbUrl: null },
  ],
  bookable: true,
  isBookmarked: false,
  ...extra,
});

const conversation = (extra: Partial<TukaiConversation> = {}): TukaiConversation => ({
  id: 'c1',
  sessionId: 'ch_1',
  title: 'Dinner ideas',
  kind: 'chat',
  messageCount: 6,
  plan: null,
  lastMessageAt: '2026-11-18T10:00:00',
  dateCreated: '2026-11-17T09:00:00',
  ...extra,
});

const NOW = new Date('2026-11-19T12:00:00');

describe('cardToItem', () => {
  it('turns a saved recommendation into the chat’s item, for its card and pin', () => {
    expect(cardToItem(card())).toMatchObject({
      id: 'pl1',
      kind: 'place',
      title: 'About Thyme',
      sub: 'Place · Westlands',
      area: 'Westlands',
      photos: ['https://cdn/md.webp'],
      about: 'A garden restaurant.',
      lat: -1.26,
      lng: 36.8,
    });
  });

  it('marks an experience with no tickets left as sold out', () => {
    expect(cardToItem(card({ type: 'experience', bookable: false })).isSoldOut).toBe(true);
    expect(cardToItem(card()).isSoldOut).toBeUndefined();
  });
});

describe('savedChatToTukaiChat', () => {
  it('rebuilds the chat under its session id, with the cards on each reply', () => {
    const chat = savedChatToTukaiChat({
      ...conversation(),
      messages: [
        { id: 'm1', role: 'user', content: 'Where to eat?', recommendations: [], dateCreated: 'a' },
        {
          id: 'm2',
          role: 'assistant',
          content: 'Try **About Thyme**.',
          recommendations: [card()],
          dateCreated: 'b',
        },
      ],
    });

    expect(chat.id).toBe('ch_1');
    expect(chat.messages.map((m) => m.role)).toEqual(['user', 'ai']);
    expect(chat.messages[0].cards).toBeUndefined();
    expect(chat.messages[1].cards).toEqual(['pl1']);
    expect(chat.messages[1].items?.pl1.title).toBe('About Thyme');
  });
});

describe('row subtitles', () => {
  it('says how many messages, and when', () => {
    expect(conversationSubtitle(conversation(), NOW)).toBe('6 messages · Yesterday');
    expect(
      conversationSubtitle(
        conversation({ messageCount: 1, lastMessageAt: '2026-11-19T08:00:00' }),
        NOW,
      ),
    ).toBe('1 message · Today');
  });

  it('names a plan by its stops and its day', () => {
    expect(
      conversationSubtitle(
        conversation({
          kind: 'plan',
          plan: { id: 'p1', title: 'Saturday', date: '2026-11-10', stopCount: 4 },
        }),
        NOW,
      ),
    ).toBe('Plan · 4 stops · Tue 10 Nov');
  });

  it('falls back to when it was last talked about for a plan with no date', () => {
    expect(
      conversationSubtitle(
        conversation({ kind: 'plan', plan: { id: 'p1', title: 'Out', date: null, stopCount: 1 } }),
        NOW,
      ),
    ).toBe('Plan · 1 stop · Yesterday');
  });

  it('names older days by date', () => {
    expect(chatDayLabel('2026-11-10T09:00:00', NOW)).toBe('Tue 10 Nov');
  });
});
