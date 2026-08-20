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

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

// sanitize-html strips tags but leaves entities encoded, so "&amp;" would show
// up literally. Safe to decode here because callers render the result as React
// text, which escapes it again on output.
const decodeEntities = (text: string): string =>
  text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith('#')) {
      const isHex = entity[1]?.toLowerCase() === 'x';
      const code = parseInt(isHex ? entity.slice(2) : entity.slice(1), isHex ? 16 : 10);
      if (Number.isNaN(code) || code < 0 || code > 0x10ffff) return match;
      return String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });

// Descriptions are stored as HTML. Strip every tag for contexts that render
// text rather than markup — card excerpts, meta tags, line-clamped summaries.
export const toPlainText = (text: string | null | undefined): string =>
  decodeEntities(sanitizeHtml(text || '', { allowedTags: [], allowedAttributes: {} }))
    .replace(/\s+/g, ' ')
    .trim();
