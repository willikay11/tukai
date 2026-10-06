'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { safeText, toPlainText } from '@/utils/safe-text-utils';

export const PlaceDescription = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClipped, setIsClipped] = useState(false);
  const collapsedRef = useRef<HTMLParagraphElement>(null);

  // Descriptions come from the rich text editor, so the markup is kept for the
  // expanded view and dropped for the clamped one, where it would cut mid-tag
  const plainText = toPlainText(text);

  useLayoutEffect(() => {
    const el = collapsedRef.current;
    if (!el || isExpanded) return;

    const measure = () => setIsClipped(el.scrollHeight > el.clientHeight);
    measure();

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isExpanded, plainText]);

  const showToggle = isClipped || isExpanded;

  return (
    <div className="flex flex-col gap-1">
      {isExpanded ? (
        <div
          className="prose prose-sm max-w-none text-[15px] leading-[1.6] text-ink-pill prose-headings:text-ink-pill prose-a:text-brand prose-strong:text-ink-pill"
          dangerouslySetInnerHTML={{ __html: safeText(text) }}
        />
      ) : (
        // Clamped to three lines. The toggle only shows once the browser says
        // the clamp is cutting text, so a short description has no toggle
        <p
          ref={collapsedRef}
          className="line-clamp-3 text-[15px] leading-[1.6] text-ink-pill text-pretty"
        >
          {plainText}
        </p>
      )}

      {showToggle && (
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
          className="inline-flex h-11 items-center gap-1.5 self-start text-[15px] font-medium text-brand transition-colors hover:underline"
        >
          {isExpanded ? 'Show less' : 'Show more'}
          <IconComponent
            iconName={isExpanded ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
            size={17}
            color="currentColor"
          />
        </button>
      )}
    </div>
  );
};
