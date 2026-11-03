'use client';

import { KeyboardEvent, useEffect, useRef } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { TukaiDots } from '@/app/shared/components/TukAI';
import { useTukai } from '@/context/TukaiContext';
import { cn } from '@/lib/utils';
import { TUKAI_FREE_MESSAGES, countUserMessages } from '@/utils/tukai';

import { useDictation } from '../hooks';
import { TukaiStarters } from './TukaiStarters';

/**
 * The message box under the chat, fading the chat out above it. In an empty
 * chat it sits mid-page with the starters under it; on a free account it
 * counts messages, and at the limit it is replaced by what to do next.
 */
export const TukaiComposer = ({ isEmptyChat }: { isEmptyChat: boolean }) => {
  const {
    input,
    setInput,
    ask,
    busy,
    focusRequest,
    currentChat,
    isUnlocked,
    isCapped,
    hasNoFreeChats,
    freeChatsLeft,
    newChat,
    showPaywall,
  } = useTukai();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const focusText = () => textRef.current?.focus();
  const dictation = useDictation({ value: input, onChange: setInput, onEnd: focusText });

  useEffect(() => {
    if (focusRequest) focusText();
  }, [focusRequest]);

  const canSend = Boolean(input.trim()) && !busy;
  const send = () => {
    dictation.stop();
    ask(input);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter breaks the line, and nothing happens while an
    // IME word is still being composed
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (canSend) send();
    }
  };

  const isLocked = isCapped || hasNoFreeChats;
  const userMessages = currentChat ? countUserMessages(currentChat.messages) : 0;
  const showMeter = !isUnlocked && Boolean(currentChat) && !dictation.isListening;

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-2">
      {!isLocked && (
        <>
          <div className="flex flex-col gap-1 rounded-3xl bg-white pb-2.5 pl-[18px] pr-2.5 pt-3 shadow-[0_0_0_1px_rgba(1,51,52,.08),0_4px_14px_rgba(1,51,52,.07)]">
            <textarea
              ref={textRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ask TukAI anything"
              aria-label="Message TukAI"
              className="max-h-40 min-h-12 w-full resize-none border-0 bg-transparent pr-2 pt-1 text-[15px] leading-[1.45] text-gray-800 outline-none [field-sizing:content] placeholder:text-ink-subtle"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 pl-0.5 text-[12.5px] font-semibold text-ink-muted">
                {dictation.isListening && (
                  <span role="status" className="inline-flex items-center gap-2 text-brand">
                    <TukaiDots />
                    Listening
                  </span>
                )}
                {showMeter &&
                  `Message ${Math.min(userMessages + 1, TUKAI_FREE_MESSAGES)} of ${TUKAI_FREE_MESSAGES}`}
              </span>
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={dictation.toggle}
                  aria-label={dictation.isListening ? 'Stop dictating' : 'Dictate'}
                  aria-pressed={dictation.isListening || undefined}
                  title={dictation.isListening ? 'Stop dictating' : 'Dictate'}
                  className={cn(
                    'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full',
                    dictation.isListening
                      ? 'bg-surface-brand text-brand shadow-[0_0_0_3px_rgba(6,99,73,.16)] hover:bg-surface-tab'
                      : 'bg-surface text-brand-ink hover:bg-surface-brand',
                  )}
                >
                  <IconComponent
                    iconName={dictation.isListening ? 'StopIcon' : 'Mic01Icon'}
                    size={20}
                    color="currentColor"
                  />
                </button>
                <button
                  type="button"
                  onClick={send}
                  disabled={!canSend}
                  aria-label="Send"
                  className={cn(
                    'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full',
                    canSend
                      ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                      : 'cursor-default bg-surface-off text-ink-subtle',
                  )}
                >
                  <IconComponent iconName="SentIcon" size={19} color="currentColor" />
                </button>
              </div>
            </div>
          </div>
          {!isEmptyChat && (
            <p className="m-0 text-center text-xs leading-[1.4] text-ink-muted">
              TukAI can make mistakes. Check details before you book.
            </p>
          )}
        </>
      )}

      {isLocked && (
        <div className="flex flex-col gap-2.5 px-1 pb-0.5 pt-1">
          <p className="m-0 text-pretty text-sm leading-normal text-gray-800">
            {isCapped
              ? `This chat has reached its 10 messages.${
                  freeChatsLeft
                    ? ' Start a new chat, or get TukAI for unlimited messages.'
                    : ' Get TukAI to keep going.'
                }`
              : 'You have used your 2 free chats. Get TukAI to start a new one.'}
          </p>
          <div className="flex flex-wrap gap-2">
            {isCapped && freeChatsLeft > 0 && (
              <button
                type="button"
                onClick={newChat}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-surface px-5 text-[15px] font-semibold text-gray-800 hover:bg-surface-brand"
              >
                Start a new chat
              </button>
            )}
            <button
              type="button"
              onClick={() => showPaywall(isCapped ? 'cap' : 'chats')}
              className="flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-6 text-[15px] font-semibold text-white hover:brightness-[1.06]"
            >
              Get TukAI
            </button>
          </div>
        </div>
      )}

      {isEmptyChat && !isLocked && (
        <>
          <TukaiStarters />
          {!isUnlocked && (
            <p className="mt-1.5 text-center text-[13px] leading-[1.45] text-ink-muted">
              {freeChatsLeft
                ? `You have ${freeChatsLeft} free ${freeChatsLeft === 1 ? 'chat' : 'chats'} left, each up to 10 messages.`
                : 'You have used your free chats.'}
            </p>
          )}
        </>
      )}
    </div>
  );
};
