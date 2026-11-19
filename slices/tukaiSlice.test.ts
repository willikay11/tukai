import {
  addTukaiMessage,
  deleteTukaiChat,
  loadTukaiChat,
  startTukaiChat,
  tukaiReducer,
} from './tukaiSlice';

const chat = (id: string) => ({ id, title: id, createdAt: '', messages: [] });

describe('tukaiSlice', () => {
  it('counts a free chat when one starts, and deleting it does not give it back', () => {
    let state = tukaiReducer(
      undefined,
      startTukaiChat({ ownerId: 'u1', chat: chat('a'), countsAsFree: true }),
    );
    state = tukaiReducer(state, deleteTukaiChat('a'));
    expect(state.chats).toHaveLength(0);
    expect(state.freeChatsUsed).toBe(1);
  });

  it('starts over when another account starts a chat', () => {
    let state = tukaiReducer(
      undefined,
      startTukaiChat({ ownerId: 'u1', chat: chat('a'), countsAsFree: true }),
    );
    state = tukaiReducer(
      state,
      startTukaiChat({ ownerId: 'u2', chat: chat('b'), countsAsFree: false }),
    );
    expect(state.ownerId).toBe('u2');
    expect(state.chats.map((c) => c.id)).toEqual(['b']);
    expect(state.freeChatsUsed).toBe(0);
  });

  it('adds messages to the right chat', () => {
    let state = tukaiReducer(
      undefined,
      startTukaiChat({ ownerId: 'u1', chat: chat('a'), countsAsFree: false }),
    );
    state = tukaiReducer(
      state,
      addTukaiMessage({
        chatId: 'a',
        message: { id: 'm', role: 'user', text: 'Hi', createdAt: '' },
      }),
    );
    expect(state.chats[0].messages.map((m) => m.text)).toEqual(['Hi']);
  });

  // DEV-474: a saved chat opened from the server, e.g. from another device
  it('adds a chat loaded from the server, or replaces the copy here', () => {
    let state = tukaiReducer(
      undefined,
      startTukaiChat({ ownerId: 'u1', chat: chat('a'), countsAsFree: false }),
    );
    state = tukaiReducer(state, loadTukaiChat({ ownerId: 'u1', chat: chat('b') }));
    expect(state.chats.map((c) => c.id)).toEqual(['b', 'a']);

    state = tukaiReducer(
      state,
      loadTukaiChat({ ownerId: 'u1', chat: { ...chat('a'), title: 'From the server' } }),
    );
    expect(state.chats.map((c) => [c.id, c.title])).toEqual([
      ['a', 'From the server'],
      ['b', 'b'],
    ]);
  });

  it('never keeps a loaded chat under another account', () => {
    let state = tukaiReducer(
      undefined,
      startTukaiChat({ ownerId: 'u1', chat: chat('a'), countsAsFree: false }),
    );
    state = tukaiReducer(state, loadTukaiChat({ ownerId: 'u2', chat: chat('b') }));
    expect(state.ownerId).toBe('u2');
    expect(state.chats.map((c) => c.id)).toEqual(['b']);
  });
});
