import { editorTheme } from './editor-theme';

describe('editorTheme paragraphs', () => {
  // Enter in a description field starts the next line, not a new section — the
  // article spacing this carried read as a gap the writer had not asked for
  it('separates paragraphs by a line, not an article gap', () => {
    expect(editorTheme.paragraph).toContain('[&:not(:first-child)]:mt-2');
    expect(editorTheme.paragraph).not.toContain('mt-6');
  });

  it('leaves the first paragraph flush with the top of the field', () => {
    expect(editorTheme.paragraph).toContain(':not(:first-child)');
  });
});
