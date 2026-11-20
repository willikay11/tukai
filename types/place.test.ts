import { placeFacts } from './place';

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
