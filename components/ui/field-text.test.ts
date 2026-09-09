import { FIELD_ICON, FIELD_PLACEHOLDER, FIELD_TEXT, FIELD_TEXT_SIZE } from './field-text';

describe('field text', () => {
  // The Input is the source of truth every other field is measured against
  it('is the size the Input reads at', () => {
    expect(FIELD_TEXT).toContain('text-[14.5px]');
    expect(FIELD_TEXT).toContain('font-normal');
    expect(FIELD_TEXT_SIZE).toContain('text-[14.5px]');
  });

  /**
   * tailwind-merge treats a `text-*` utility as also setting line-height, so a
   * `leading-*` written before it is dropped and the field loses its height.
   */
  it('sets the line-height after the size', () => {
    expect(FIELD_TEXT.indexOf('leading-')).toBeGreaterThan(FIELD_TEXT.indexOf('text-['));
  });

  // A field that sets its own line-height must be able to, without fighting this
  it('leaves the line-height out of the size-only variant', () => {
    expect(FIELD_TEXT_SIZE).not.toContain('leading-');
  });

  it('tells a placeholder apart by colour, not by weight or size', () => {
    expect(FIELD_PLACEHOLDER).toBe('placeholder:text-gray-400');
  });

  // CSS, not the size prop: an icon's own width/height attributes lose to it,
  // so what a call site passes no longer decides
  it('pins an in-field icon to one box', () => {
    expect(FIELD_ICON).toContain('[&_svg]:h-[18px]');
    expect(FIELD_ICON).toContain('[&_svg]:w-[18px]');
  });

  it('gives an in-field icon the placeholder grey to inherit', () => {
    expect(FIELD_ICON).toContain('text-gray-400');
    expect(FIELD_PLACEHOLDER).toContain('gray-400');
  });
});
