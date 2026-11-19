import { fireEvent, render, screen } from '@testing-library/react';

import type { TukaiChat, TukaiConversation } from '@/types/tukai';

import { TukaiChatsDrawer } from './TukaiChatsDrawer';

const openChat = jest.fn();
const openSavedChat = jest.fn().mockResolvedValue(true);
const deleteChat = jest.fn();
const showOnMap = jest.fn();
const setHistoryOpen = jest.fn();
let mockChats: TukaiChat[] = [];

jest.mock('@/context/TukaiContext', () => ({
  useTukai: () => ({
    isHistoryOpen: true,
    setHistoryOpen,
    chats: mockChats,
    currentChat: null,
    view: 'chat',
    openChat,
    openSavedChat,
    openingChatId: null,
    deleteChat,
    showOnMap,
    access: { plan: 'free', freeMessagesUsed: 2 },
    isUnlocked: false,
    freeMessagesLeft: 18,
    showPaywall: jest.fn(),
  }),
}));

let mockList: Record<string, unknown> = {};
const useTukaiConversations = jest.fn();
jest.mock('../hooks/useTukaiConversations', () => ({
  useTukaiConversations: (...args: unknown[]) => {
    useTukaiConversations(...args);
    return mockList;
  },
}));
jest.mock('@/components/ui/drawer', () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));
jest.mock('@/app/shared/components/Images', () => ({ PlainImage: () => null }));

const conversation = (extra: Partial<TukaiConversation> = {}): TukaiConversation => ({
  id: 'c1',
  sessionId: 'ch_1',
  title: 'Dinner ideas',
  kind: 'chat',
  messageCount: 6,
  plan: null,
  lastMessageAt: new Date(Date.now() - 60_000).toISOString(),
  dateCreated: new Date(Date.now() - 120_000).toISOString(),
  ...extra,
});

const list = (conversations: TukaiConversation[], extra: Record<string, unknown> = {}) => ({
  conversations,
  isLoading: false,
  isError: false,
  hasMore: false,
  isLoadingMore: false,
  loadMore: jest.fn(),
  ...extra,
});

// DEV-474/475: the list is the server's, from every device
describe('TukaiChatsDrawer, saved chats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChats = [];
    mockList = list([]);
  });

  it('lists the saved chats with their message count and day', () => {
    mockList = list([conversation()]);
    render(<TukaiChatsDrawer />);

    expect(screen.getByText('Dinner ideas')).toBeInTheDocument();
    expect(screen.getByText('6 messages · Today')).toBeInTheDocument();
  });

  it('lists a planned outing under Plans by its stops', () => {
    mockList = list([
      conversation({
        id: 'c2',
        sessionId: 'ch_2',
        title: 'Saturday?',
        kind: 'plan',
        plan: { id: 'p1', title: 'Saturday out', date: '2026-11-10', stopCount: 4 },
      }),
    ]);
    render(<TukaiChatsDrawer />);

    expect(screen.getByRole('region', { name: 'Plans' })).toHaveTextContent('Saturday out');
    expect(screen.getAllByText('Plan · 4 stops · Tue 10 Nov').length).toBeGreaterThan(0);
  });

  it('opens a saved chat through the server, closing the drawer', () => {
    const saved = conversation();
    mockList = list([saved]);
    render(<TukaiChatsDrawer />);

    fireEvent.click(screen.getByText('Dinner ideas'));

    expect(setHistoryOpen).toHaveBeenCalledWith(false);
    expect(openSavedChat).toHaveBeenCalledWith(saved);
  });

  it('deletes a saved chat on the server too', () => {
    mockList = list([conversation()]);
    render(<TukaiChatsDrawer />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete chat: Dinner ideas' }));

    expect(deleteChat).toHaveBeenCalledWith('ch_1', 'c1');
  });

  it('keeps a chat only this browser has, without doubling a saved one', () => {
    mockList = list([conversation()]);
    mockChats = [
      { id: 'ch_1', title: 'Dinner ideas', createdAt: '', messages: [] },
      {
        id: 'ch_old',
        title: 'From before',
        createdAt: new Date(Date.now() - 86_400_000 * 30).toISOString(),
        messages: [],
      },
    ];
    render(<TukaiChatsDrawer />);

    expect(screen.getAllByText('Dinner ideas')).toHaveLength(1);
    fireEvent.click(screen.getByText('From before'));
    expect(openChat).toHaveBeenCalledWith('ch_old');
    fireEvent.click(screen.getByRole('button', { name: 'Delete chat: From before' }));
    expect(deleteChat).toHaveBeenLastCalledWith('ch_old', undefined);
  });

  it('asks the server to search, and loads more on request', () => {
    const loadMore = jest.fn();
    mockList = list([conversation()], { hasMore: true, loadMore });
    render(<TukaiChatsDrawer />);

    fireEvent.change(screen.getByLabelText('Search chats'), { target: { value: 'sushi' } });
    expect(useTukaiConversations).toHaveBeenLastCalledWith('sushi', true);

    fireEvent.click(screen.getByRole('button', { name: 'Show more chats' }));
    expect(loadMore).toHaveBeenCalled();
  });

  it('says so when the chats could not be loaded', () => {
    mockList = list([], { isError: true });
    render(<TukaiChatsDrawer />);

    expect(screen.getByText(/could not be loaded just now/)).toBeInTheDocument();
  });
});
