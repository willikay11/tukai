/**
 * TukAI, Tukai's assistant: chats, the checked reply the model contract
 * returns, and the catalogue entries a reply points at.
 *
 * See docs/design handoff `design_handoff_tukai` sections 11 and 12.
 */

export type TukaiItemKind = 'place' | 'experience' | 'community';

/**
 * One catalogue entry, as much of it as a card, a plan stop or a map pin
 * needs. A reply carries the entries it names, so a chat renders from its own
 * history without fetching every item again.
 */
export type TukaiItem = {
  id: string;
  kind: TukaiItemKind;
  /** Experiences only: an itinerary draws the route icon, not the calendar. */
  isItinerary?: boolean;
  title: string;
  /** "Restaurant · Westlands", or a community's member line. */
  sub: string;
  /** Category alone, for "{kind} · {area}" lines and the map popup. */
  category: string;
  /** First part of the locality, e.g. "Westlands". */
  area: string;
  photos: string[];
  about: string;
  /** Experience "{when} · {price}", or the experience a place hosts. */
  detail: string;
  lat: number | null;
  lng: number | null;
  /** Experiences: free, sold out, already over, hosted by the person. */
  isFree?: boolean;
  isSoldOut?: boolean;
  isPast?: boolean;
  isMine?: boolean;
  /** Places: a restaurant books a table, anything else a visit. */
  isRestaurant?: boolean;
};

export type TukaiPlanStop = {
  id: string;
  /** "HH:MM", or empty for "Any time". */
  time: string;
  end: string;
  note: string;
};

export type TukaiPlanDay = { title: string; stops: TukaiPlanStop[] };

export type TukaiPlan = { title: string; tip: string; days: TukaiPlanDay[] };

export type TukaiDraftType = 'one' | 'multi' | 'itin';

export type TukaiDraft = {
  title: string;
  desc: string;
  type: TukaiDraftType;
  placeId: string | null;
  /** "YYYY-MM-DD", or empty when TukAI left it open. */
  date: string;
  start: string;
  end: string;
  /** KES, 0 when free. */
  price: number;
  commId: string;
};

export type TukaiWritingKind = 'caption' | 'description' | 'message' | 'review' | 'other';

export type TukaiWriting = { label: string; kind: TukaiWritingKind | string; options: string[] };

/** What the chat route returns: the model's reply after every server-side check. */
export type TukaiReply = {
  text: string;
  error?: boolean;
  cards: string[];
  plan: TukaiPlan | null;
  draft: TukaiDraft | null;
  writing: TukaiWriting | null;
  suggestions: string[];
  /** Every catalogue entry the reply names, by id. */
  items: Record<string, TukaiItem>;
  /** The agent wants a yes or no before it acts on `actions`. */
  requiresConfirmation?: boolean;
  actions?: TukaiAction[];
};

export type TukaiMessage = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  /** ISO date. */
  createdAt: string;
  error?: boolean;
  cards?: string[];
  plan?: TukaiPlan;
  savedListId?: string;
  draft?: TukaiDraft;
  draftOpened?: boolean;
  writing?: TukaiWriting;
  suggestions?: string[];
  items?: Record<string, TukaiItem>;
  requiresConfirmation?: boolean;
  actions?: TukaiAction[];
  /** Set once the person answers a reply that `requiresConfirmation`. */
  confirmation?: 'confirmed' | 'declined';
};

export type TukaiChat = {
  id: string;
  title: string;
  /** ISO date. */
  createdAt: string;
  messages: TukaiMessage[];
};

export type TukaiPlanName = 'free' | 'tukai' | 'business';

export type TukaiAccess = {
  plan: TukaiPlanName;
  /** Free messages used this month, counted by the server */
  freeMessagesUsed: number;
  /** ISO date, the TukAI plan only. */
  renewsAt?: string;
};

/** Why the paywall is showing: its title and text follow from this. */
/** Why the paywall opened: the month's free messages ran out, an upgrade prompt, or a writing helper. */
export type TukaiPaywallReason = 'allowance' | 'upgrade' | 'helper';

/**
 * Something the agent proposes or did, from `actions` in its replies. Untyped
 * for now: the agent's API does not define its shape yet.
 */
export type TukaiAction = Record<string, unknown>;

/** What the browser sends to /api/tukai/chat. The chat's id is the agent's session id. */
export type TukaiChatRequest = {
  sessionId: string;
  message: string;
};

/** The person's answer to a reply that `requiresConfirmation`. */
export type TukaiConfirmRequest = {
  sessionId: string;
  confirmed: boolean;
};

/** A saved chat's plan, on the chats list (DEV-474). */
export type TukaiConversationPlan = {
  id: string;
  title: string;
  /** "YYYY-MM-DD", or null when it has no date */
  date: string | null;
  stopCount: number;
};

/**
 * One row of GET /v1/tukai/conversations/: a chat the server saved for this
 * account, on any device. `sessionId` is the chat's id in the browser and
 * the agent's session id.
 */
export type TukaiConversation = {
  id: string;
  sessionId: string;
  title: string;
  kind: 'chat' | 'plan';
  /** User and assistant messages */
  messageCount: number;
  plan: TukaiConversationPlan | null;
  lastMessageAt: string;
  dateCreated: string;
};

/** A place or experience a saved reply recommends, as the API builds it. */
export type TukaiRecommendationCard = {
  type: 'place' | 'experience';
  id: string;
  slug: string;
  name: string;
  rating: number | null;
  reviewCount: number | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  blurb: string;
  photos: { mdUrl: string | null; thumbUrl: string | null }[];
  bookable: boolean;
  isBookmarked: boolean;
};

export type TukaiSavedMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations: TukaiRecommendationCard[];
  dateCreated: string;
};

/** GET /v1/tukai/conversations/{id}/: the chat with its messages. */
export type TukaiConversationDetail = TukaiConversation & { messages: TukaiSavedMessage[] };
