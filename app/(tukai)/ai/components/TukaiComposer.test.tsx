import { fireEvent, render, screen } from '@testing-library/react';

import { TukaiComposer } from './TukaiComposer';

const showPaywall = jest.fn();
let mockTukai: Record<string, unknown> = {};

jest.mock('@/context/TukaiContext', () => ({
  useTukai: () => ({
    input: '',
    setInput: jest.fn(),
    ask: jest.fn(),
    busy: false,
    focusRequest: 0,
    isUnlocked: false,
    isCapped: false,
    freeMessagesLeft: 18,
    freeMessagesResetAt: '2026-12-01T00:00:00Z',
    showPaywall,
    ...mockTukai,
  }),
}));
jest.mock('../hooks', () => ({
  useDictation: () => ({ isListening: false, toggle: jest.fn(), stop: jest.fn() }),
}));
jest.mock('./TukaiStarters', () => ({ TukaiStarters: () => null }));
jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));
jest.mock('@/app/shared/components/TukAI', () => ({ TukaiDots: () => null }));

// DEV-374: free use is the server's monthly count, the same on every device
describe('TukaiComposer, on the free allowance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTukai = {};
  });

  it('shows the free messages left this month', () => {
    render(<TukaiComposer isEmptyChat={false} />);

    expect(screen.getByText('18 free messages left this month')).toBeInTheDocument();
    expect(screen.getByLabelText('Message TukAI')).toBeInTheDocument();
  });

  it('says so on an empty chat too, without the old 2-chats wording', () => {
    render(<TukaiComposer isEmptyChat />);

    expect(screen.getByText('You have 18 free messages left this month.')).toBeInTheDocument();
    expect(screen.queryByText(/free chats/)).not.toBeInTheDocument();
  });

  it('locks once none are left, says when more come, and offers TukAI', () => {
    mockTukai = { isCapped: true, freeMessagesLeft: 0 };
    render(<TukaiComposer isEmptyChat={false} />);

    expect(screen.queryByLabelText('Message TukAI')).not.toBeInTheDocument();
    expect(screen.getByText(/used this month’s free messages/)).toBeInTheDocument();
    expect(screen.getByText(/More come on 1 December/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Get TukAI' }));
    expect(showPaywall).toHaveBeenCalledWith('allowance');
  });

  it('shows no count with TukAI unlocked', () => {
    mockTukai = { isUnlocked: true, freeMessagesLeft: null };
    render(<TukaiComposer isEmptyChat={false} />);

    expect(screen.queryByText(/free messages/)).not.toBeInTheDocument();
  });
});
