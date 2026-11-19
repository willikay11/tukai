import { apiWithToken } from './apiService';
import {
  deleteTukaiConversation,
  fetchTukaiConversation,
  fetchTukaiConversations,
} from './tukaiConversations';

jest.mock('./apiService', () => ({ apiWithToken: jest.fn() }));

const api = { get: jest.fn(), delete: jest.fn() };

// DEV-474/475: the chats the server saved, on every device
describe('saved TukAI chats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiWithToken as jest.Mock).mockResolvedValue(api);
  });

  it('lists them a page at a time, with the count, kind and plan', async () => {
    api.get.mockResolvedValue({
      data: {
        next: 'https://api/v1/tukai/conversations/?page=2',
        results: [
          {
            id: 'c1',
            session_id: 'ch_1',
            title: 'Dinner in Westlands',
            kind: 'plan',
            message_count: 6,
            plan: { id: 'p1', title: 'Saturday out', date: '2026-11-21', stop_count: 4 },
            last_message_at: '2026-11-18T10:00:00Z',
            date_created: '2026-11-18T09:00:00Z',
          },
        ],
      },
    });

    const page = await fetchTukaiConversations();

    expect(api.get).toHaveBeenCalledWith('/v1/tukai/conversations/', {
      params: { page: 1, page_size: 30 },
    });
    expect(page.next).toContain('page=2');
    expect(page.results[0]).toMatchObject({
      sessionId: 'ch_1',
      kind: 'plan',
      messageCount: 6,
      plan: { stopCount: 4 },
    });
  });

  it('searches on the server, trimmed', async () => {
    api.get.mockResolvedValue({ data: { results: [], next: null } });

    await fetchTukaiConversations({ search: '  sushi ', page: 2 });

    expect(api.get).toHaveBeenCalledWith('/v1/tukai/conversations/', {
      params: { page: 2, page_size: 30, search: 'sushi' },
    });
  });

  it('reads one chat with its messages and cards', async () => {
    api.get.mockResolvedValue({
      data: {
        id: 'c1',
        session_id: 'ch_1',
        messages: [{ id: 'm1', role: 'assistant', content: 'Try this', recommendations: [] }],
      },
    });

    const chat = await fetchTukaiConversation('c1');

    expect(api.get).toHaveBeenCalledWith('/v1/tukai/conversations/c1/');
    expect(chat.messages[0].role).toBe('assistant');
  });

  it('forgets one', async () => {
    api.delete.mockResolvedValue({ status: 204 });

    await deleteTukaiConversation('c1');

    expect(api.delete).toHaveBeenCalledWith('/v1/tukai/conversations/c1/');
  });
});
