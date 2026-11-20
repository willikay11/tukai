import { linkTypeFor, placeFacts, propertyHref } from './place';

const OPENING = { id: 'p1', key: 'Opening hours', value: 'Mon-Sun' };
const OLD_ENTRY = { id: 'p2', key: 'Entry', value: 'Paid entry' };

// DEV-408: free or paid entry from the place's entry_type
describe('placeFacts', () => {
  it('leads with the entry type, in place of an old Entry property', () => {
    expect(placeFacts({ entryType: 'free', properties: [OPENING, OLD_ENTRY] })).toEqual([
      { id: 'entry-type', key: 'Entry', value: 'Free entry', icon: 'Ticket01Icon' },
      OPENING,
    ]);
  });

  it('keeps an old Entry property while the entry type is blank', () => {
    expect(placeFacts({ entryType: '', properties: [OPENING, OLD_ENTRY] })).toEqual([
      OPENING,
      OLD_ENTRY,
    ]);
    expect(placeFacts({ properties: [OPENING] })).toEqual([OPENING]);
  });

  it('says paid entry', () => {
    expect(placeFacts({ entryType: 'paid', properties: [] })[0].value).toBe('Paid entry');
  });
});

// DEV-410: properties that link
describe('propertyHref', () => {
  it('links each kind its own way', () => {
    expect(propertyHref({ value: 'kazuri.co.ke', linkType: 'website' })).toBe(
      'https://kazuri.co.ke',
    );
    expect(propertyHref({ value: 'http://kazuri.co.ke', linkType: 'website' })).toBe(
      'http://kazuri.co.ke',
    );
    expect(propertyHref({ value: 'hi@kazuri.co.ke', linkType: 'email' })).toBe(
      'mailto:hi@kazuri.co.ke',
    );
    expect(propertyHref({ value: '+254 (0) 700-000 000', linkType: 'phone' })).toBe(
      'tel:+2540700000000',
    );
  });

  it('is plain text without a link type, or without a value', () => {
    expect(propertyHref({ value: 'Mon-Sun', linkType: '' })).toBeNull();
    expect(propertyHref({ value: 'Mon-Sun' })).toBeNull();
    expect(propertyHref({ value: '  ', linkType: 'website' })).toBeNull();
  });
});

describe('linkTypeFor', () => {
  it('reads an email, a full website and a phone row', () => {
    expect(linkTypeFor('Email', 'hello@kazuri.co.ke')).toBe('email');
    expect(linkTypeFor('Website', 'https://kazuri.co.ke/menu')).toBe('website');
    expect(linkTypeFor('Phone Number', '+254 113 555777')).toBe('phone');
    expect(linkTypeFor('WhatsApp', '0712 345 678')).toBe('phone');
  });

  // The API checks the value against the type; these would not pass
  it('leaves as text what the API would refuse as a link', () => {
    expect(linkTypeFor('Website', 'kazuri.co.ke')).toBe('');
    expect(linkTypeFor('Capacity', '1000000')).toBe('');
    expect(linkTypeFor('Phone', 'ask at the bar')).toBe('');
    expect(linkTypeFor('Opening hours', 'Mon-Sun')).toBe('');
  });
});
