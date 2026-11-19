import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { TukaiDraftError } from '@/services/tukaiWriting';

import { TukaiReviewHelper } from './TukaiReviewHelper';

const showPaywall = jest.fn();
const openTukai = jest.fn();
let mockTukai: Record<string, unknown> = {};
jest.mock('@/context/TukaiContext', () => ({
  useTukai: () => ({
    isUnlocked: false,
    freeMessagesLeft: 7,
    showPaywall,
    openTukai,
    ...mockTukai,
  }),
}));
jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));

const draftTukaiReview = jest.fn();
jest.mock('@/services/tukaiWriting', () => ({
  ...jest.requireActual('@/services/tukaiWriting'),
  draftTukaiReview: (...args: unknown[]) => draftTukaiReview(...args),
}));

const Form = ({ initial = '', rating = 4 }: { initial?: string; rating?: number }) => {
  const [text, setText] = useState(initial);
  return (
    <>
      <textarea aria-label="Your review" value={text} onChange={(e) => setText(e.target.value)} />
      <TukaiReviewHelper
        subjectType="place"
        subjectId="pl1"
        rating={rating}
        text={text}
        onText={setText}
      />
    </>
  );
};

const renderForm = (props: { initial?: string; rating?: number } = {}) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Form {...props} />
    </QueryClientProvider>,
  );

const writeFrom = async (brief: string) => {
  fireEvent.change(screen.getByRole('textbox', { name: /What do you want|How should TukAI/ }), {
    target: { value: brief },
  });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /^(Write|Rewrite) it$/ }));
  });
};

// DEV-375: TukAI writes or rewrites a review, which the person posts themselves
describe('TukaiReviewHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTukai = {};
  });

  it('writes a review from a few words and the rating, into the box', async () => {
    draftTukaiReview.mockResolvedValue('Lovely garden, but the service was slow.');
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Write with TukAI' }));
    expect(screen.getByText('7 free uses left this month')).toBeInTheDocument();
    await writeFrom('garden, slow service');

    expect(draftTukaiReview).toHaveBeenCalledWith({
      subjectType: 'place',
      subjectId: 'pl1',
      brief: 'garden, slow service',
      rating: 4,
      currentText: undefined,
    });
    expect(screen.getByLabelText('Your review')).toHaveValue(
      'Lovely garden, but the service was slow.',
    );
    expect(screen.getByText(/TukAI wrote this/)).toBeInTheDocument();
  });

  it('rewrites what is there, and Undo puts it back', async () => {
    draftTukaiReview.mockResolvedValue('Short and sweet.');
    renderForm({ initial: 'My long first try' });

    fireEvent.click(screen.getByRole('button', { name: 'Rewrite with TukAI' }));
    await writeFrom('shorter');

    expect(draftTukaiReview).toHaveBeenCalledWith(
      expect.objectContaining({ currentText: 'My long first try', brief: 'shorter' }),
    );
    expect(screen.getByLabelText('Your review')).toHaveValue('Short and sweet.');

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByLabelText('Your review')).toHaveValue('My long first try');
  });

  it('waits for a brief before writing', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Write with TukAI' }));

    expect(screen.getByRole('button', { name: 'Write it' })).toBeDisabled();
  });

  it('offers TukAI once the free uses are gone, leaving the review as it was', async () => {
    draftTukaiReview.mockRejectedValue(
      new TukaiDraftError('You have used this month’s free TukAI messages.', 'allowance'),
    );
    renderForm({ initial: 'Mine' });

    fireEvent.click(screen.getByRole('button', { name: 'Rewrite with TukAI' }));
    await writeFrom('friendlier');

    expect(screen.getByRole('alert')).toHaveTextContent('free TukAI messages');
    expect(screen.getByLabelText('Your review')).toHaveValue('Mine');
    fireEvent.click(screen.getByRole('button', { name: 'Get TukAI' }));
    expect(showPaywall).toHaveBeenCalledWith('helper');
    expect(openTukai).toHaveBeenCalled();
  });

  it('says why when it could not write, without offering TukAI', async () => {
    draftTukaiReview.mockRejectedValue(
      new TukaiDraftError('TukAI could not write it just now.', 'other'),
    );
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Write with TukAI' }));
    await writeFrom('nice');

    expect(screen.getByRole('alert')).toHaveTextContent('TukAI could not write it just now.');
    expect(screen.queryByRole('button', { name: 'Get TukAI' })).not.toBeInTheDocument();
  });

  it('shows no count with TukAI unlocked', () => {
    mockTukai = { isUnlocked: true, freeMessagesLeft: null };
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Write with TukAI' }));

    expect(screen.queryByText(/free uses left/)).not.toBeInTheDocument();
  });
});
