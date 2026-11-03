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
  freeChatsUsed: number;
  /** ISO date, the TukAI plan only. */
  renewsAt?: string;
};

/** Why the paywall is showing: its title and text follow from this. */
export type TukaiPaywallReason = 'chats' | 'cap' | 'upgrade' | 'helper';

/** One past turn, as the chat route reads it. */
export type TukaiHistoryTurn = { role: 'user' | 'assistant'; content: string };

export type TukaiChatRequest = {
  messages: TukaiHistoryTurn[];
  /** The text of the latest user message, which also narrows the catalogue. */
  question: string;
  city: string;
  lat?: number;
  lng?: number;
  /** Today in the person's own time zone, "Tuesday 3 November 2026". */
  today: string;
  draftTitle?: string | null;
};
