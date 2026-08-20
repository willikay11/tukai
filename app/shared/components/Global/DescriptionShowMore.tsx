'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { safeText } from '@/utils/safe-text-utils';

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

  const shouldTruncate = text.length > maxLength;
  // Expanding reveals the rest in place — this used to open a bottom drawer,
  // which took the reader out of the page to read a paragraph
  const displayedText =
    !shouldTruncate || isExpanded ? sanitizedText : sanitizedText.slice(0, maxLength) + '...';

  return (
    <div>
      <div className="text-xs" dangerouslySetInnerHTML={{ __html: displayedText }} />
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
