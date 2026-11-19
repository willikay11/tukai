import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { TukaiChat, TukaiMessage } from '@/types/tukai';

/**
 * Your chats with TukAI, and what this browser knows of the free allowance
 * and the TukAI plan.
 *
 * The server saves every chat too (GET /v1/tukai/conversations/, DEV-474),
 * and the chats list reads from there. This keeps the fuller copy of the
 * chats used in this browser - plans, drafts and writing options the server
 * doesn't save - and a saved chat opened from another device is loaded in
 * here (`loadTukaiChat`). Persisted through redux-persist (store/store.ts).
 * Chats belong to one account: `ownerId` is checked on every read, so
 * signing in as someone else never shows the last person's chats.
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
    /** A chat loaded from the server: added, or replacing the copy here */
    loadTukaiChat: (state, action: PayloadAction<{ ownerId: string; chat: TukaiChat }>) => {
      claim(state, action.payload.ownerId);
      const { chat } = action.payload;
      state.chats = [chat, ...state.chats.filter((c) => c.id !== chat.id)];
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
  loadTukaiChat,
  addTukaiMessage,
  removeTukaiMessage,
  patchTukaiMessage,
  deleteTukaiChat,
  setTukaiPlanRenewal,
} = tukaiSlice.actions;
export const tukaiReducer = tukaiSlice.reducer;
