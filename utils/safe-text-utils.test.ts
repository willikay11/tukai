import { toPlainText } from './safe-text-utils';

describe('toPlainText', () => {
  it('strips HTML tags', () => {
    expect(toPlainText('<p>Weekend <strong>trails</strong></p>')).toBe('Weekend trails');
  });

  // sanitize-html leaves entities encoded, so this needs its own decode pass
  it('decodes named entities', () => {
    expect(toPlainText('<p>Trails &amp; more</p>')).toBe('Trails & more');
    expect(toPlainText('&lt;3 &quot;hi&quot; &apos;there&apos;')).toBe('<3 "hi" \'there\'');
  });

  it('decodes numeric and hex entities', () => {
    expect(toPlainText('caf&#233;')).toBe('café');
    expect(toPlainText('caf&#xe9;')).toBe('café');
  });

  it('leaves an unknown entity alone rather than mangling it', () => {
    expect(toPlainText('a &bogus; b')).toBe('a &bogus; b');
  });

  it('collapses whitespace, including non-breaking spaces', () => {
    expect(toPlainText('<p>Trails\n\n   and&nbsp;&nbsp;more</p>')).toBe('Trails and more');
  });

  it('handles null, undefined and empty input', () => {
    expect(toPlainText(null)).toBe('');
    expect(toPlainText(undefined)).toBe('');
    expect(toPlainText('')).toBe('');
  });

  // The result is rendered as React text, so script content is inert — but it
  // must not silently vanish or become markup
  it('renders escaped script markup as literal text', () => {
    expect(toPlainText('&lt;script&gt;alert(1)&lt;/script&gt;')).toBe('<script>alert(1)</script>');
  });

  it('drops real script tags entirely', () => {
    expect(toPlainText('<script>alert(1)</script>Hello')).toBe('Hello');
  });
});
