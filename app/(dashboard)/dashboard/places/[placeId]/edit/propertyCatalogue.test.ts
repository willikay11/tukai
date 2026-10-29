import {
  CATEGORY_PROPERTY_GROUPS,
  groupsForCategories,
  joinValues,
  splitValues,
} from './propertyCatalogue';

describe('property catalogue', () => {
  it('offers the groups for every category the place is in, in order', () => {
    const groups = groupsForCategories(['Nairobi', 'Landmarks', 'Restaurants']);
    const keys = groups.map((group) => group.key);

    // The city carries no properties; the interests do
    expect(keys[0]).toBe('Type of Landmark');
    expect(keys).toContain('Cooking Style');
  });

  // Payment Options belongs to more than one category
  it('offers a shared group once, where it first appears', () => {
    const keys = groupsForCategories(['Landmarks', 'Restaurants']).map((group) => group.key);
    const payment = keys.filter((key) => key === 'Payment Options');

    expect(payment).toHaveLength(1);
  });

  it('has nothing to offer a category it does not know', () => {
    expect(groupsForCategories(['Bird Watching'])).toEqual([]);
  });

  // The API's own catalogue lands in `tags`; this is the seam it plugs into
  it('lets the API override what a category offers', () => {
    const groups = groupsForCategories(['Landmarks'], {
      Landmarks: [{ key: 'Entry Fee', options: ['Free', 'Ticketed'] }],
    });

    expect(groups).toEqual([{ key: 'Entry Fee', options: ['Free', 'Ticketed'] }]);
  });

  it('round-trips a stored value', () => {
    expect(splitValues('Mobile money, Credit/Debit card accepted')).toEqual([
      'Mobile money',
      'Credit/Debit card accepted',
    ]);
    expect(joinValues(['Cash', 'Mobile Money'])).toBe('Cash, Mobile Money');
  });

  it('keeps the keys places already store', () => {
    expect(Object.keys(CATEGORY_PROPERTY_GROUPS)).toContain('Date Spots');
  });
});
