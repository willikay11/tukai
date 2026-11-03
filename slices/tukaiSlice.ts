import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { TukaiChat, TukaiMessage } from '@/types/tukai';

/**
 * Your chats with TukAI, and what this browser knows of the free allowance
 * and the TukAI plan.
 *
 * The API has no TukAI endpoints yet, so this is the only record of a chat:
 * persisted through redux-persist (store/store.ts) so chats survive a reload
 * (the handoff's open question 8). Chats belong to one account: `ownerId`
 * is checked on every read, so signing in as someone else never shows the
 * last person's chats.
 */
type TukaiState = {
  ownerId: string | null;
  chats: TukaiChat[];
  /** Chats started on a free account. Deleting one does not give it back. */
  freeChatsUsed: number;
  /** ISO date the TukAI plan renews, while paid for in this browser. */
  planRenewsAt: string | null;
};

const initialState: TukaiState = { ownerId: null, chats: [], freeChatsUsed: 0, planRenewsAt: null };

/** Starts over when a different account arrives. */
const claim = (state: TukaiState, ownerId: string) => {
  if (state.ownerId === ownerId) return;
  state.ownerId = ownerId;
  state.chats = [];
  state.freeChatsUsed = 0;
  state.planRenewsAt = null;
};

const tukaiSlice = createSlice({
  name: 'tukai',
  initialState,
  reducers: {
    startTukaiChat: (
      state,
      action: PayloadAction<{ ownerId: string; chat: TukaiChat; countsAsFree: boolean }>,
    ) => {
      claim(state, action.payload.ownerId);
      state.chats.unshift(action.payload.chat);
      if (action.payload.countsAsFree) state.freeChatsUsed += 1;
    },
    addTukaiMessage: (state, action: PayloadAction<{ chatId: string; message: TukaiMessage }>) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) chat.messages.push(action.payload.message);
    },
    removeTukaiMessage: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) chat.messages = chat.messages.filter((m) => m.id !== action.payload.messageId);
    },
    patchTukaiMessage: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string; patch: Partial<TukaiMessage> }>,
    ) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      const message = chat?.messages.find((m) => m.id === action.payload.messageId);
      if (message) Object.assign(message, action.payload.patch);
    },
    deleteTukaiChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter((c) => c.id !== action.payload);
    },
    setTukaiPlanRenewal: (
      state,
      action: PayloadAction<{ ownerId: string; renewsAt: string | null }>,
    ) => {
      claim(state, action.payload.ownerId);
      state.planRenewsAt = action.payload.renewsAt;
    },
  },
});

export const {
  startTukaiChat,
  addTukaiMessage,
  removeTukaiMessage,
  patchTukaiMessage,
  deleteTukaiChat,
  setTukaiPlanRenewal,
} = tukaiSlice.actions;
export const tukaiReducer = tukaiSlice.reducer;
