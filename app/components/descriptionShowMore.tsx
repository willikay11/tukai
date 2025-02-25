'use client';

import { useState } from 'react';
import sanitizeHtml from 'sanitize-html';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DescriptionShowMore = ({ text, maxLength = 100 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sanitize text to prevent XSS (if content is dynamic)
  const safeText = sanitizeHtml(text);

  // Determine whether to truncate text
  const shouldTruncate = text.length > maxLength;
  const displayedText =
    isExpanded || !shouldTruncate ? safeText : safeText.slice(0, maxLength) + '...';

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: displayedText }} />
      {shouldTruncate && (
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn('ml-0 pl-0 font-bold')}
          variant="link"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
      )}
    </div>
  );
};

export default DescriptionShowMore;
