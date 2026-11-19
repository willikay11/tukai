import React from 'react';
import { Provider } from 'react-redux';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';

import { tukaiReducer } from '@/slices/tukaiSlice';
import type { TukaiConversation } from '@/types/tukai';

import { TukaiProvider, useTukai } from './TukaiContext';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'u1', name: 'Wanjiru Kamau' } } }),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/ai',
}));
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ needAuth: () => false }),
}));
jest.mock('@/context/HostingPlanContext', () => ({ useHostingPlan: () => null }));
jest.mock('@/app/shared/hooks/useToast', () => ({ toast: jest.fn() }));
jest.mock('@/services/tukaiPlan', () => ({
  fetchTukaiPlan: jest.fn().mockResolvedValue(null),
  fetchTukaiSubscription: jest.fn().mockResolvedValue(null),
  fetchTukaiAllowance: jest.fn().mockResolvedValue(null),
  confirmTukaiSubscription: jest.fn(),
  startTukaiCheckout: jest.fn(),
}));
jest.mock('@/services/tukai', () => ({
  sendTukaiMessage: jest.fn(),
  confirmTukaiAction: jest.fn(),
  deleteTukaiSession: jest.fn().mockResolvedValue({}),
}));
const fetchTukaiConversation = jest.fn();
const deleteTukaiConversation = jest.fn().mockResolvedValue(undefined);
jest.mock('@/services/tukaiConversations', () => ({
  fetchTukaiConversation: (...args: unknown[]) => fetchTukaiConversation(...args),
  deleteTukaiConversation: (...args: unknown[]) => deleteTukaiConversation(...args),
}));

const saved: TukaiConversation = {
  id: 'c1',
  sessionId: 'ch_remote',
  title: 'Dinner ideas',
  kind: 'chat',
  messageCount: 2,
  plan: null,
  lastMessageAt: '2026-11-18T10:00:00Z',
  dateCreated: '2026-11-18T09:00:00Z',
};

let api: ReturnType<typeof useTukai>;
const Probe = () => {
  api = useTukai();
  return (
    <p>{api.currentChat ? api.currentChat.messages.map((m) => m.text).join(' | ') : 'none'}</p>
  );
};

const renderProvider = (preloaded?: object) => {
  const store = configureStore({
    reducer: combineReducers({ tukaiReducer }),
    preloadedState: preloaded as never,
  });
  render(
    <Provider store={store}>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <TukaiProvider>
          <Probe />
        </TukaiProvider>
      </QueryClientProvider>
    </Provider>,
  );
  return store;
};

// DEV-474: chats saved on the server open on any device
describe('TukaiProvider, saved chats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads a chat from another device from the server, and keeps it', async () => {
    fetchTukaiConversation.mockResolvedValue({
      ...saved,
      messages: [
        { id: 'm1', role: 'user', content: 'Where to eat?', recommendations: [], dateCreated: 'a' },
        {
          id: 'm2',
          role: 'assistant',
          content: 'Try About Thyme.',
          recommendations: [],
          dateCreated: 'b',
        },
      ],
    });
    const store = renderProvider();

    await act(async () => {
      await api.openSavedChat(saved);
    });

    expect(fetchTukaiConversation).toHaveBeenCalledWith('c1');
    expect(screen.getByText('Where to eat? | Try About Thyme.')).toBeInTheDocument();
    expect(store.getState().tukaiReducer.chats[0].id).toBe('ch_remote');
  });

  it('opens this browser’s own copy without asking the server', async () => {
    renderProvider({
      tukaiReducer: {
        ownerId: 'u1',
        freeChatsUsed: 0,
        planRenewsAt: null,
        chats: [
          {
            id: 'ch_remote',
            title: 'Dinner ideas',
            createdAt: '',
            messages: [{ id: 'm1', role: 'user', text: 'Local copy', createdAt: '' }],
          },
        ],
      },
    });

    await act(async () => {
      await api.openSavedChat(saved);
    });

    expect(fetchTukaiConversation).not.toHaveBeenCalled();
    expect(screen.getByText('Local copy')).toBeInTheDocument();
  });

  it('says so, and stays put, when the chat cannot be loaded', async () => {
    const { toast } = jest.requireMock('@/app/shared/hooks/useToast');
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    fetchTukaiConversation.mockRejectedValue(new Error('500'));
    renderProvider();

    let opened = true;
    await act(async () => {
      opened = await api.openSavedChat(saved);
    });

    expect(opened).toBe(false);
    expect(screen.getByText('none')).toBeInTheDocument();
    expect(toast).toHaveBeenCalledWith({
      description: 'That chat could not be opened. Try again.',
    });
  });

  it('forgets a deleted chat on the server too', async () => {
    renderProvider();

    act(() => api.deleteChat('ch_remote', 'c1'));

    await waitFor(() => expect(deleteTukaiConversation).toHaveBeenCalledWith('c1'));
  });
});
