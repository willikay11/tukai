import sanitizeHtml from 'sanitize-html';

// Sanitize text to prevent XSS (if content is dynamic) and ensure any
// anchor tags receive the expected link classes.
export const safeText = (text: string) =>
  sanitizeHtml(text, {
    // Ensure class (and optionally target/rel) are preserved on <a>
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel', 'class'],
      ol: ['class'],
      ul: ['class'],
      li: ['class'],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const existing = attribs.class ? attribs.class + ' ' : '';
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            class: `${existing}text-primary underline underline-offset-2 hover:text-primary transition-colors`,
          },
        } as any;
      },
      ol: (tagName, attribs) => {
        const existing = attribs.class ? attribs.class + ' ' : '';
        return {
          tagName: 'ol',
          attribs: {
            ...attribs,
            class: `${existing}list-decimal list-inside`,
          },
        } as any;
      },
      ul: (tagName, attribs) => {
        const existing = attribs.class ? attribs.class + ' ' : '';
        return {
          tagName: 'ul',
          attribs: {
            ...attribs,
            class: `${existing}list-disc list-inside`,
          },
        } as any;
      },
    },
  });
