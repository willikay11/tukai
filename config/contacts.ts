/**
 * Contact details and social links shown in the footer.
 *
 * Each value reads from a NEXT_PUBLIC_ variable, so it can change per
 * environment without a code edit. The fallbacks are the values in use today;
 * the owner has not yet confirmed them (FT-04). Set a social variable to an
 * empty string to hide that link.
 *
 * NEXT_PUBLIC_ values are inlined at build time, so a change needs a rebuild.
 */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'support@tukai.co';

export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+254 716 909 815';

export const CONTACT_PHONE_HREF = `tel:${CONTACT_PHONE.replace(/[^\d+]/g, '')}`;

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

const SOCIALS: SocialLink[] = [
  {
    label: 'Instagram',
    href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? 'https://instagram.com/tukai_app',
    icon: 'InstagramIcon',
  },
  {
    label: 'X',
    href: process.env.NEXT_PUBLIC_SOCIAL_X ?? 'https://x.com/Tukaiexper69436',
    icon: 'NewTwitterIcon',
  },
  {
    label: 'Facebook',
    href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ?? 'https://facebook.com/tukai',
    icon: 'Facebook02Icon',
  },
  {
    label: 'TikTok',
    href: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK ?? '',
    icon: 'TiktokIcon',
  },
];

/** Only the socials with a link set. An empty value hides its button. */
export const SOCIAL_LINKS: SocialLink[] = SOCIALS.filter((social) => social.href.trim() !== '');
