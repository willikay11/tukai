'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { safeText, toPlainText } from '@/utils/safe-text-utils';

export const DescriptionShowMore = ({
  text,
  maxLength = 100,
}: {
  text: string;
  maxLength?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sanitize text to prevent XSS (if content is dynamic) and ensure any
  // anchor tags receive the expected link classes.
  const sanitizedText = safeText(text);
  // Descriptions are written in the rich text editor, so the length that
  // matters to the reader is the text's, not the markup's
  const plainText = toPlainText(text);

  const shouldTruncate = plainText.length > maxLength;
  const isCollapsed = shouldTruncate && !isExpanded;

  return (
    <div>
      {/* The two branches are different elements, so React swaps them on
          toggle and the entrance animation plays each way round */}
      {isCollapsed ? (
        // Plain text while collapsed: slicing the HTML cuts through tags, and
        // on a formatted description the markup can eat the whole budget
        <p className="text-sm leading-relaxed text-gray-700 duration-300 animate-in fade-in motion-reduce:animate-none">
          {plainText.slice(0, maxLength)}...
        </p>
      ) : (
        <div
          // Tailwind's preflight strips headings, lists and code of their
          // default styling, so the editor's formatting arrived in the DOM and
          // rendered as flat text. `prose` puts it back; `max-w-none` keeps it
          // from capping the column at 65ch.
          className="prose prose-sm max-w-none leading-relaxed text-gray-700 duration-300 animate-in fade-in slide-in-from-top-1 prose-headings:text-gray-900 prose-a:text-primary prose-strong:text-gray-900 motion-reduce:animate-none"
          dangerouslySetInnerHTML={{ __html: sanitizedText }}
        />
      )}
      {shouldTruncate && (
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="ml-0 pl-0 font-bold"
          variant="link"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
      )}
    </div>
  );
};
