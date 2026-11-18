import { toKenyanE164 } from './phone';

describe('toKenyanE164', () => {
  it.each([
    ['0712 345 678', '+254712345678'],
    ['712345678', '+254712345678'],
    ['254712345678', '+254712345678'],
    ['+254 712 345 678', '+254712345678'],
    ['(0712) 345-678', '+254712345678'],
  ])('reads %s as %s', (typed, sent) => {
    expect(toKenyanE164(typed)).toBe(sent);
  });

  it('keeps a blank number blank', () => {
    expect(toKenyanE164('')).toBe('');
    expect(toKenyanE164('  ')).toBe('');
  });
});
