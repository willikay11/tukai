/**
 * The property groups a place is offered, by the categories it belongs to.
 *
 * This is a local catalogue rather than an API read, and deliberately so: the
 * category detail endpoint carries a `tags` field that is plainly meant for
 * exactly this, but it comes back empty for all 59 categories on staging, so
 * there is nothing to read yet. `groupsForCategories` takes an override so the
 * day the backend populates `tags`, the wiring is one call site rather than a
 * rewrite — the shape below is what it should return.
 *
 * The vocabulary matches what places already store: a property's value is the
 * selected options joined with ", ", which is the format the place page reads
 * and the mobile app writes.
 */
export type PropertyGroup = {
  /** The property key, exactly as it is stored and displayed */
  key: string;
  options: string[];
  /** Shown on the place page beside the value */
  icon?: string;
};

/** Contact and hours are asked of every place, whatever its categories. */
export const CONTACT_KEYS = {
  phone: 'Phone Number',
  email: 'Email',
  hours: 'Open Hours',
} as const;

const PAYMENT_OPTIONS: PropertyGroup = {
  key: 'Payment Options',
  icon: 'CreditCardAcceptIcon',
  options: ['Mobile Money', 'Cash', 'Cards Accepted'],
};

const BUDGET_OPTIONS = [
  'Pocket friendly - below Ksh 2,500',
  'Mid-range from Ksh 2,700',
  'High-end from Ksh 10,000',
];

const LANDMARKS: PropertyGroup[] = [
  {
    key: 'Type of Landmark',
    icon: 'Building03Icon',
    options: [
      'Monument',
      'Museum',
      'Historic building',
      'Religious site',
      'Natural landmark',
      'Memorial',
      'Viewpoint',
    ],
  },
  {
    key: 'Purpose of Visit',
    icon: 'Target02Icon',
    options: [
      'Sightseeing',
      'Learning and history',
      'Photography',
      'Pilgrimage',
      'Family outing',
      'School trip',
    ],
  },
  {
    key: 'Location',
    icon: 'Location01Icon',
    options: [
      'City centre',
      'Suburban',
      'Rural',
      'Lakeside',
      'Coastal',
      'Forest',
      'Highlands',
      'National park',
    ],
  },
  {
    key: 'Historical Era',
    icon: 'Clock01Icon',
    options: [
      'Prehistoric and fossil sites',
      'Pre-colonial',
      'Colonial',
      'Independence era',
      'Modern',
    ],
  },
  {
    key: 'Photography',
    icon: 'Camera01Icon',
    options: ['Photography allowed', 'Photography restricted', 'No photography', 'Drone allowed'],
  },
  { key: 'Budget', icon: 'Wallet01Icon', options: BUDGET_OPTIONS },
  PAYMENT_OPTIONS,
];

const DATE_SPOTS: PropertyGroup[] = [
  {
    key: 'Type of Experience',
    icon: 'Champion01Icon',
    options: [
      'Romantic Date Spots',
      'Casual Hangouts',
      'Adventurous Outings',
      'Cultural Experiences',
      'Fine Dining Evenings',
      'Sunset Views',
      'Live Entertainment',
    ],
  },
  {
    key: 'Drink Specials',
    icon: 'CocktailIcon',
    options: [
      'Signature Cocktails',
      'Craft Beer Selection',
      'Wine List',
      'Local Spirits',
      'Fresh Juices and Mocktails',
      'Happy Hour Offers',
      'Coffee and Tea',
    ],
  },
  {
    key: 'Cuisine Type',
    icon: 'ChefIcon',
    options: [
      'Italian',
      'Mexican',
      'Japanese',
      'Indian',
      'French',
      'Thai',
      'Mediterranean',
      'Chinese',
      'Swahili',
    ],
  },
  {
    key: 'Timing & Availability',
    icon: 'Calendar03Icon',
    options: ['Weekdays', 'Weekend', 'Weekday/Weekend Offers'],
  },
  {
    key: 'Ambiance',
    icon: 'Sofa02Icon',
    options: [
      'Cozy Candlelit Tables',
      'Rustic Wooden Interiors',
      'Trendy & Modern',
      'Elegant Chandeliers',
      'Minimalist Modern Decor',
      'Sleek and Polished Surfaces',
      'Warm Earth Tones with Soft Lighting',
    ],
  },
  {
    key: 'Seating Preference',
    icon: 'Chair03Icon',
    options: [
      'Window-side Booths with a View',
      'Quiet Corners for Private Conversations',
      'High-top Bar Seating for Socializing',
      'Outdoor Patio Tables with Umbrellas',
      'Comfy Lounge Chairs Near the Fireplace',
      'Family-friendly Round Tables',
      'Intimate Two-seater Tables with Soft Lighting',
    ],
  },
  {
    key: 'Occasion',
    icon: 'CalendarLove02Icon',
    options: [
      'Romantic Dinners for Special Celebrations',
      'Family Gatherings and Reunions',
      'Casual Business Lunches and Meetings',
      'Birthday Parties with Private Dining Spaces',
      'Bridal Showers and Engagement Celebrations',
      'Weekend Brunches with Friends',
      'Holiday Festive Dinners',
    ],
  },
  {
    key: 'Dietary Preferences',
    icon: 'OrganicFoodIcon',
    options: [
      'Gluten-Free Menu Options',
      'Vegan and Plant-Based Choices',
      'Nut-Free Meal Preparation',
      'Low-Sodium Dishes Available',
      'Dairy-Free Alternatives Offered',
      'Allergen-Free Food Compliance',
      'Halal Certified Ingredients',
    ],
  },
];

const RESTAURANTS: PropertyGroup[] = [
  { key: 'Price Range', icon: 'Wallet01Icon', options: BUDGET_OPTIONS },
  {
    key: 'Reservation Options',
    icon: 'Calendar03Icon',
    options: ['Walk-ins welcome', 'Reservations required', 'Online booking', 'Phone booking'],
  },
  {
    key: 'Dining Style',
    icon: 'Restaurant02Icon',
    options: ['Fine dining', 'Casual dining', 'Fast casual', 'Buffet', 'Street food', 'Café'],
  },
  {
    key: 'Meal Type',
    icon: 'DishWasherIcon',
    options: ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Late night'],
  },
  {
    key: 'Popular Dishes',
    icon: 'Bbq01Icon',
    options: [
      'Nyama choma',
      'Pilau',
      'Ugali and sukuma',
      'Chapati',
      'Samosas',
      'Fish fry',
      'Biryani',
      'Wings',
    ],
  },
  {
    key: 'Cooking Style',
    icon: 'FireIcon',
    options: ['Grilled', 'Roasted', 'Fried', 'Steamed', 'Smoked', 'Wood-fired'],
  },
  {
    key: 'Beverage Options',
    icon: 'DrinkIcon',
    options: [
      'Coffee & Tea',
      'Fresh juices',
      'Soft drinks',
      'Cocktails',
      'Wine',
      'Beer',
      'Non-alcoholic only',
    ],
  },
  {
    key: 'Group Size',
    icon: 'UserGroupIcon',
    options: ['Solo', 'Couple', 'Small group (3-6)', 'Large group (7+)'],
  },
  {
    key: 'Preparation Time',
    icon: 'Clock01Icon',
    options: ['Under 15 minutes', '15-30 minutes', '30-45 minutes', 'Over 45 minutes'],
  },
  {
    key: 'Delivery Option',
    icon: 'DeliveryTruck01Icon',
    options: ['Delivery available', 'Takeaway', 'Dine-in only'],
  },
];

/** Keyed by the category's name, which is what the API returns on a place. */
export const CATEGORY_PROPERTY_GROUPS: Record<string, PropertyGroup[]> = {
  Landmarks: LANDMARKS,
  'Parks & Museums': LANDMARKS,
  'Date Spots': DATE_SPOTS,
  Restaurants: RESTAURANTS,
  'Nyama Choma (Braai)': RESTAURANTS,
};

/**
 * The groups to offer a place, in the order its categories are listed.
 *
 * A key shared by two of a place's categories — Payment Options across both
 * Landmarks and Restaurants — is offered once, where it first appears.
 *
 * `overrides` is where the API's own catalogue goes once `tags` is populated:
 * anything it names wins over the local list for that category.
 */
export const groupsForCategories = (
  categoryNames: string[],
  overrides?: Record<string, PropertyGroup[]>,
): PropertyGroup[] => {
  const groups: PropertyGroup[] = [];
  const seen = new Set<string>();

  categoryNames.forEach((name) => {
    const forCategory = overrides?.[name] ?? CATEGORY_PROPERTY_GROUPS[name] ?? [];

    forCategory.forEach((group) => {
      if (seen.has(group.key)) return;
      seen.add(group.key);
      groups.push(group);
    });
  });

  return groups;
};

/** "Mobile money, Cash" → ['Mobile money', 'Cash'] */
export const splitValues = (value: string): string[] =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export const joinValues = (values: string[]): string => values.join(', ');
