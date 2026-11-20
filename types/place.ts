import { Status } from '@/enums/status';
import { Location } from '@/types/location';
import { Photo } from '@/types/photo';
import { PlaceCategory } from '@/types/placeCategory';

export type Place = {
  id: string;
  // Human-readable identifier, and what the detail URL uses. The API resolves
  // either this or the UUID, so older id-based links keep working.
  slug?: string;
  title: string;
  description: string;
  location: Location;
  categories: PlaceCategory[];
  photos: Photo[];
  // null until the place has been reviewed
  totalReviews: number | null;
  averageRating: number;
  isBookmarked: boolean;
  status: Status;
  dateCreated: string;
  // On both the list and the detail serializer. `GET /places/featured/`
  // returns only places with this set, in rotation order.
  featured?: boolean;
  // The DETAIL endpoint embeds both of these, so a place page needs no extra
  // requests for them. The list endpoint does not return them.
  properties?: PlaceProperty[];
  /** Free or paid entry; blank when not known (DEV-408) */
  entryType?: 'free' | 'paid' | '' | null;
  socialLinks?: PlaceSocialLink[];
  // The detail endpoint only. The community whose claim was approved, or null
  // where none has been - a claim still under review does not show up here.
  verifiedOwner?: PlaceVerifiedOwner | null;
};

export type PlaceVerifiedOwner = {
  id: string;
  title: string;
  owners: { id: string }[];
  admins: { id: string }[];
};

export type PropertyLinkType = 'website' | 'email' | 'phone';

export type PlaceProperty = {
  id: string;
  key: string;
  value: string;
  icon?: string;
  canCopy?: boolean;
  /**
   * How the value links (DEV-410): a website, an email (mailto:) or a phone
   * number (tel:). Blank for plain text.
   */
  linkType?: PropertyLinkType | '' | null;
};

export type PlaceSocialLink = {
  id: string;
  platformName: string;
  url: string;
  icon?: string;
};

export function isPlace(item: any): item is Place {
  return 'totalReviews' in item && 'averageRating' in item;
}

export const ENTRY_LABEL = { free: 'Free entry', paid: 'Paid entry' } as const;

/** A property named "Entry": how free or paid entry was kept before entry_type */
export const isEntryProperty = (property: PlaceProperty) =>
  property.key.trim().toLowerCase() === 'entry';

/**
 * A place's facts as guests see them: its properties, with free or paid entry
 * from `entry_type` (DEV-408) in place of an old "Entry" property. Where
 * `entry_type` is blank, an "Entry" property still says what it knows.
 */
export const placeFacts = (place: Pick<Place, 'properties' | 'entryType'>): PlaceProperty[] => {
  const properties = place.properties ?? [];
  if (!place.entryType) return properties;
  return [
    {
      id: 'entry-type',
      key: 'Entry',
      value: ENTRY_LABEL[place.entryType],
      icon: 'Ticket01Icon',
    },
    ...properties.filter((property) => !isEntryProperty(property)),
  ];
};

/** Where a property's value links to, or null for plain text (DEV-410) */
export const propertyHref = (
  property: Pick<PlaceProperty, 'value' | 'linkType'>,
): string | null => {
  const value = property.value.trim();
  if (!value) return null;
  switch (property.linkType) {
    case 'website':
      // One saved without its scheme would resolve relative to the page
      return /^https?:\/\//i.test(value) ? value : `https://${value}`;
    case 'email':
      return `mailto:${value}`;
    case 'phone':
      return `tel:${value.replace(/[^\d+]/g, '')}`;
    default:
      return null;
  }
};

const PHONE_VALUE = /^\+?[\d\s().-]{6,24}$/;
const PHONE_KEY = /phone|mobile|whats ?app|telephone|\btel\b|call/i;
const EMAIL_VALUE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE_VALUE = /^https?:\/\/[^\s/]+\.[^\s]+$/i;

/**
 * The link type a property's value reads as, for one added or changed in
 * Edit place (DEV-410). The API checks the value against it, so it's only
 * set where the value would pass: a website with its http(s)://, an email
 * address, or a phone number on a row named for one - a number alone could
 * be a capacity or a year. Anything else is plain text.
 */
export const linkTypeFor = (key: string, value: string): PropertyLinkType | '' => {
  const text = value.trim();
  if (EMAIL_VALUE.test(text)) return 'email';
  if (WEBSITE_VALUE.test(text)) return 'website';
  if (PHONE_KEY.test(key) && PHONE_VALUE.test(text)) return 'phone';
  return '';
};
