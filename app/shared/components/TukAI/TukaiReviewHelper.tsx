'use client';

import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useTukai } from '@/context/TukaiContext';
import { TUKAI_BRIEF_MAX, TukaiDraftError, draftTukaiReview } from '@/services/tukaiWriting';

import { TukaiMark } from './TukaiMark';

/**
 * TukAI's writing help for a review (DEV-375): it writes one from a few
 * words, with the star rating given, or rewrites what's there. The draft
 * fills the review box for the person to read over, edit and post
 * themselves - nothing is posted or saved - and Undo puts back what was
 * there. Each draft uses one of the month's free TukAI uses.
 */
export const TukaiReviewHelper = ({
  subjectType,
  subjectId,
  rating,
  text,
  onText,
}: {
  subjectType: 'place' | 'experience';
  subjectId: string;
  rating?: number;
  /** What's in the review box now */
  text: string;
  onText: (text: string) => void;
}) => {
  const { isUnlocked, freeMessagesLeft, showPaywall, openTukai } = useTukai();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [brief, setBrief] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [error, setError] = useState<TukaiDraftError | null>(null);
  // What the box held before TukAI's draft, for Undo
  const [before, setBefore] = useState<string | null>(null);

  const isRewrite = text.trim().length > 0;
  const action = isRewrite ? 'Rewrite with TukAI' : 'Write with TukAI';

  const write = async () => {
    if (!brief.trim() || isWriting) return;
    setIsWriting(true);
    setError(null);
    try {
      const draft = await draftTukaiReview({
        subjectType,
        subjectId,
        brief,
        rating: rating || undefined,
        currentText: isRewrite ? text : undefined,
      });
      setBefore(text);
      onText(draft);
      setIsOpen(false);
      setBrief('');
    } catch (failure) {
      setError(
        failure instanceof TukaiDraftError
          ? failure
          : new TukaiDraftError('TukAI could not write it just now.', 'other'),
      );
    } finally {
      setIsWriting(false);
      // A draft used one of the month's free uses
      void queryClient.invalidateQueries({ queryKey: ['tukai-allowance'] });
    }
  };

  const getTukai = () => {
    showPaywall('helper');
    openTukai();
  };

  if (!isOpen) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setError(null);
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-lime-soft py-1.5 pl-1.5 pr-4 text-sm font-semibold text-brand-ink hover:bg-lime-soft-hover"
        >
          <TukaiMark size="md" />
          {action}
        </button>
        {before !== null && (
          <span className="flex items-center gap-2 text-13 text-ink-muted">
            TukAI wrote this. Read it over before you post.
            <button
              type="button"
              onClick={() => {
                onText(before);
                setBefore(null);
              }}
              className="min-h-11 font-semibold text-brand hover:underline"
            >
              Undo
            </button>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-xl bg-lime-soft p-3.5">
      <label htmlFor={`tukai-brief-${subjectId}`} className="flex items-center gap-2">
        <TukaiMark size="md" />
        <span className="text-sm font-semibold text-brand-ink">
          {isRewrite ? 'How should TukAI change it?' : 'What do you want to say?'}
        </span>
      </label>
      <input
        id={`tukai-brief-${subjectId}`}
        autoFocus
        value={brief}
        maxLength={TUKAI_BRIEF_MAX}
        onChange={(event) => setBrief(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            void write();
          }
        }}
        placeholder={
          isRewrite
            ? 'Like: shorter, friendlier, mention the view'
            : 'A few words, like: great food, slow service, lovely garden'
        }
        className="h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-gray-900 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
      />

      {error && (
        <p role="alert" className="m-0 text-13 leading-snug text-danger-deep">
          {error.message}{' '}
          {error.reason === 'allowance' && (
            <button
              type="button"
              onClick={getTukai}
              className="font-semibold text-brand-ink underline"
            >
              Get TukAI
            </button>
          )}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void write()}
          disabled={!brief.trim() || isWriting}
          className="inline-flex min-h-11 items-center rounded-full bg-lime px-5 text-sm font-bold text-brand-ink hover:brightness-[.97] disabled:opacity-60"
        >
          {isWriting ? 'Writing…' : isRewrite ? 'Rewrite it' : 'Write it'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
          className="min-h-11 px-3 text-sm font-semibold text-ink-muted hover:text-gray-800"
        >
          Cancel
        </button>
        {!isUnlocked && freeMessagesLeft !== null && (
          <span className="ml-auto text-13 text-ink-muted">
            {freeMessagesLeft} free {freeMessagesLeft === 1 ? 'use' : 'uses'} left this month
          </span>
        )}
      </div>
    </div>
  );
};
