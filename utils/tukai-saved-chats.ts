import type {
  TukaiChat,
  TukaiConversation,
  TukaiConversationDetail,
  TukaiItem,
  TukaiMessage,
  TukaiRecommendationCard,
} from '@/types/tukai';
import { richTextItems } from '@/utils/rich-text-items';
import { cleanTukaiText, plural, shortDay } from '@/utils/tukai';

/**
 * A recommendation card the API built for a saved reply, as the chat's own
 * item shape, so a reopened chat draws its cards and map pins (DEV-474/477).
 */
export const cardToItem = (card: TukaiRecommendationCard): TukaiItem => {
  const category = card.type === 'place' ? 'Place' : 'Experience';
  const area = card.area ?? '';
  return {
    id: card.id,
    kind: card.type,
    title: card.name,
    sub: [category, area].filter(Boolean).join(' · '),
    category,
    area,
    photos: card.photos
      .map((photo) => photo.mdUrl ?? photo.thumbUrl)
      .filter((url): url is string => Boolean(url)),
    // Descriptions are rich-text HTML, cut short by the API: read as text
    about: richTextItems(card.blurb).join(' '),
    detail: '',
    lat: card.latitude,
    lng: card.longitude,
    ...(card.type === 'experience' ? { isSoldOut: !card.bookable } : {}),
  };
};

/**
 * A chat the server saved, as the browser's chat. Its id is the agent's
 * session id, so a message sent from here carries on the same chat.
 *
 * Only what the server keeps comes back - the text and the recommended
 * places and experiences. A plan, a draft or writing options TukAI showed on
 * another device aren't saved, so they don't return.
 */
export const savedChatToTukaiChat = (detail: TukaiConversationDetail): TukaiChat => ({
  id: detail.sessionId,
  title: detail.title,
  createdAt: detail.dateCreated,
  messages: detail.messages.map((saved): TukaiMessage => {
    const cards = saved.recommendations ?? [];
    return {
      id: saved.id,
      role: saved.role === 'assistant' ? 'ai' : 'user',
      text: saved.role === 'assistant' ? cleanTukaiText(saved.content) : saved.content,
      createdAt: saved.dateCreated,
      ...(cards.length > 0
        ? {
            cards: cards.map((card) => card.id),
            items: Object.fromEntries(cards.map((card) => [card.id, cardToItem(card)])),
          }
        : {}),
    };
  }),
});

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** "Today", "Yesterday", or "Tue 10 Nov". */
export const chatDayLabel = (iso: string, now: Date = new Date()): string => {
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return '';
  const days = Math.round((startOfDay(now).getTime() - startOfDay(when).getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  const ymd = `${when.getFullYear()}-${String(when.getMonth() + 1).padStart(2, '0')}-${String(when.getDate()).padStart(2, '0')}`;
  return shortDay(ymd);
};

/**
 * A row's second line: "6 messages · Yesterday", or for a planned outing
 * "Plan · 4 stops · Tue 10 Nov" (the plan's date, or when it was last
 * talked about).
 */
export const conversationSubtitle = (
  conversation: TukaiConversation,
  now: Date = new Date(),
): string => {
  if (conversation.kind === 'plan' && conversation.plan) {
    const day = conversation.plan.date
      ? shortDay(conversation.plan.date)
      : chatDayLabel(conversation.lastMessageAt, now);
    return ['Plan', plural(conversation.plan.stopCount, 'stop'), day].filter(Boolean).join(' · ');
  }
  return [
    plural(conversation.messageCount, 'message'),
    chatDayLabel(conversation.lastMessageAt, now),
  ]
    .filter(Boolean)
    .join(' · ');
};
