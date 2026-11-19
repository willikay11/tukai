/**
 * The items in a "what's included"-style field, one string each, for a list
 * drawn with its own icons.
 *
 * The field is a rich-text editor, so it holds HTML: list items, else
 * paragraphs (a line break inside one splits it too). Older values are plain
 * text, one item per line. Tags are dropped and entities decoded either way,
 * so `&amp;` reads as "&" (DEV-511).
 */
export const richTextItems = (value?: string | null): string[] => {
  // Text cut short can end part-way through a tag or an entity
  const text = (value ?? '')
    .trim()
    .replace(/<[^>]*$/, '')
    .replace(/&[a-z0-9#]*$/i, '')
    .trim();
  if (!text) return [];
  if (!/<[a-z][\s\S]*>/i.test(text)) return splitLines(text);

  if (typeof DOMParser === 'undefined') return splitLines(stripTags(text));

  const doc = new DOMParser().parseFromString(text, 'text/html');
  const items = Array.from(doc.body.querySelectorAll('li'));
  if (items.length > 0) return items.map(textOf).filter(Boolean);

  const blocks = Array.from(doc.body.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6'));
  const leaves = blocks.filter((block) => !block.querySelector('p, div'));
  if (leaves.length > 0) return leaves.flatMap((block) => splitLines(linesOf(block)));

  return splitLines(linesOf(doc.body));
};

const splitLines = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const textOf = (element: Element) => (element.textContent ?? '').replace(/\s+/g, ' ').trim();

/** Its text, with each <br> as a line break */
const linesOf = (element: Element) => {
  const copy = element.cloneNode(true) as Element;
  copy.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  return copy.textContent ?? '';
};

/** Without a DOM (on the server): tags out, the common entities decoded */
const stripTags = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(li|p|div|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');
