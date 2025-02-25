'use client';

import { useState } from 'react';
import sanitizeHtml from 'sanitize-html';

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
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 cursor-pointer text-blue-500 underline"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

export default DescriptionShowMore;
