'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { SocialLinkValue } from '../schemas';

/**
 * The icon a platform is stored with.
 *
 * These are the names the API already holds — a link saved from the app comes
 * back as `InstagramIcon` or `Globe02Icon` — so a link added here is stored the
 * same way and renders identically on the place page.
 */
const PLATFORM_ICONS: { match: RegExp; icon: string }[] = [
  { match: /instagram/i, icon: 'InstagramIcon' },
  { match: /facebook|fb\b/i, icon: 'Facebook01Icon' },
  { match: /twitter|^x$/i, icon: 'NewTwitterIcon' },
  { match: /tiktok/i, icon: 'TiktokIcon' },
  { match: /youtube/i, icon: 'YoutubeIcon' },
  { match: /linkedin/i, icon: 'Linkedin01Icon' },
  { match: /whatsapp/i, icon: 'WhatsappIcon' },
  { match: /website|web|site|homepage/i, icon: 'Globe02Icon' },
];

export const iconForPlatform = (platformName: string): string =>
  PLATFORM_ICONS.find((entry) => entry.match.test(platformName.trim()))?.icon ?? 'Link01Icon';

/** Where else the place lives online — the links on its page. */
export const EditPlaceSocialLinksStep = ({
  socialLinks,
  errors,
  onChange,
}: {
  socialLinks: SocialLinkValue[];
  errors: Record<string, string>;
  onChange: (socialLinks: SocialLinkValue[]) => void;
}) => {
  const update = (index: number, patch: Partial<SocialLinkValue>) =>
    onChange(
      socialLinks.map((entry, position) => {
        if (position !== index) return entry;

        const next = { ...entry, ...patch };

        // The icon follows the platform, so naming one picks the other
        return patch.platformName !== undefined
          ? { ...next, icon: iconForPlatform(patch.platformName) }
          : next;
      }),
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Social Links</h2>
        <p className="mt-1 text-xs text-gray-500">
          Link the place&apos;s social profiles so guests can follow along.
        </p>
      </div>

      {socialLinks.length === 0 && (
        <p className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-500">No links yet.</p>
      )}

      <ul className="divide-y divide-gray-100">
        {socialLinks.map((link, index) => (
          <li key={link.id} className="space-y-4 py-5 first:pt-0">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <IconComponent
                  iconName={link.icon || iconForPlatform(link.platformName)}
                  color="currentColor"
                  size={18}
                />
                {link.platformName || `Link ${index + 1}`}
              </p>

              <button
                type="button"
                onClick={() => onChange(socialLinks.filter((_, position) => position !== index))}
                aria-label={`Remove ${link.platformName || `link ${index + 1}`}`}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-destructive transition hover:bg-red-50"
              >
                <IconComponent iconName="Delete02Icon" color="currentColor" size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-800">Platform</label>
              <Input
                value={link.platformName}
                onChange={(event) => update(index, { platformName: event.target.value })}
                placeholder="e.g. Instagram"
                aria-label={`Link ${index + 1} platform`}
              />
              {errors[`socialLinks.${index}.platformName`] && (
                <p className="text-xs text-red-500">
                  {errors[`socialLinks.${index}.platformName`]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-800">URL</label>
              <Input
                value={link.url}
                onChange={(event) => update(index, { url: event.target.value })}
                placeholder="https://instagram.com/yourplace"
                aria-label={`Link ${index + 1} URL`}
                suffixIcon={
                  <IconComponent iconName="Link02Icon" size={18} className="text-gray-400" />
                }
              />
              {errors[`socialLinks.${index}.url`] && (
                <p className="text-xs text-red-500">{errors[`socialLinks.${index}.url`]}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant="ghost"
        className="h-auto p-0 text-xs font-semibold text-primary hover:bg-transparent hover:text-primary/80"
        onClick={() =>
          onChange([
            ...socialLinks,
            { id: `new-${Date.now()}`, platformName: '', url: '', icon: 'Link01Icon' },
          ])
        }
      >
        <span className="flex items-center gap-1.5">
          <IconComponent iconName="PlusSignIcon" color="currentColor" size={16} />
          Add social link
        </span>
      </Button>
    </div>
  );
};
