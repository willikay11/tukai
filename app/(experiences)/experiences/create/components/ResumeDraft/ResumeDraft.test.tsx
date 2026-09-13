import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Experience } from '@/types/experience';

import { ResumeDraft } from './index';

const draft = (overrides: Partial<Experience> = {}) =>
  ({
    id: 'draft-1',
    title: 'Mt Kenya Summit Trek',
    description: 'A long trek',
    location: { city: 'Nairobi' },
    photos: [{ id: 'p1', photo: 'a.jpg' }],
    tickets: [],
    guests: [],
    startDate: '2026-05-16T07:30:00Z',
    endDate: '2026-05-16T16:30:00Z',
    dateCreated: '2026-08-01T10:00:00Z',
    ...overrides,
  }) as unknown as Experience;

const setup = (props: Partial<React.ComponentProps<typeof ResumeDraft>> = {}) => {
  const onContinue = jest.fn();
  const onClearAndStartFresh = jest.fn();

  render(
    <ResumeDraft
      draft={draft()}
      onContinue={onContinue}
      onClearAndStartFresh={onClearAndStartFresh}
      {...props}
    />,
  );

  return { onContinue, onClearAndStartFresh };
};

describe('ResumeDraft', () => {
  it('shows the draft title and progress', () => {
    setup();

    expect(screen.getByText('Mt Kenya Summit Trek')).toBeInTheDocument();
    expect(screen.getByText(/of \d+ steps complete/)).toBeInTheDocument();
  });

  it('continues the draft', async () => {
    const user = userEvent.setup();
    const { onContinue } = setup();

    await user.click(screen.getByRole('button', { name: /continue draft/i }));

    expect(onContinue).toHaveBeenCalled();
  });

  describe('clearing the draft', () => {
    it('asks for confirmation before clearing, naming the draft', async () => {
      const user = userEvent.setup();
      const { onClearAndStartFresh } = setup();

      await user.click(screen.getByRole('button', { name: /clear draft and start fresh/i }));

      expect(screen.getByText('Clear this draft?')).toBeInTheDocument();
      // The copy wraps the title in curly quotes
      expect(
        screen.getByText(
          /Mt Kenya Summit Trek.*will be deleted and you will start the wizard from scratch/,
        ),
      ).toBeInTheDocument();
      // Nothing happens until the destructive action is chosen
      expect(onClearAndStartFresh).not.toHaveBeenCalled();
    });

    it('clears on confirmation', async () => {
      const user = userEvent.setup();
      const { onClearAndStartFresh } = setup();

      await user.click(screen.getByRole('button', { name: /clear draft and start fresh/i }));
      await user.click(screen.getByRole('button', { name: 'Clear and start fresh' }));

      expect(onClearAndStartFresh).toHaveBeenCalled();
    });

    it('keeps the draft when dismissed', async () => {
      const user = userEvent.setup();
      const { onClearAndStartFresh } = setup();

      await user.click(screen.getByRole('button', { name: /clear draft and start fresh/i }));
      await user.click(screen.getByRole('button', { name: 'Keep draft' }));

      expect(onClearAndStartFresh).not.toHaveBeenCalled();
      expect(screen.queryByText('Clear this draft?')).not.toBeInTheDocument();
    });

    it('falls back to a placeholder name for an untitled draft', async () => {
      const user = userEvent.setup();
      setup({ draft: draft({ title: '' }) });

      await user.click(screen.getByRole('button', { name: /clear draft and start fresh/i }));

      expect(screen.getByText(/Untitled experience.*will be deleted/)).toBeInTheDocument();
    });

    it('disables the trigger while a clear is in flight', () => {
      setup({ isClearing: true });

      expect(screen.getByRole('button', { name: /clearing/i })).toBeDisabled();
    });
  });
});
