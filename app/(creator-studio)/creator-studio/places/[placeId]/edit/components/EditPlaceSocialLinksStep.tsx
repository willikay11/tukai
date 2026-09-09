'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { SocialLinkValue } from '../schemas';

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
      socialLinks.map((entry, position) => (position === index ? { ...entry, ...patch } : entry)),
    );

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Add the profiles you want people to follow. Each needs the full link.
      </p>

      {socialLinks.length === 0 && (
        <p className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-500">No links yet.</p>
      )}

      <ul className="space-y-3">
        {socialLinks.map((link, index) => (
          <li key={link.id} className="rounded-2xl bg-gray-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="sm:w-48">
                <Input
                  value={link.platformName}
                  onChange={(event) => update(index, { platformName: event.target.value })}
                  placeholder="Platform e.g. Instagram"
                  aria-label={`Link ${index + 1} platform`}
                />
                {errors[`socialLinks.${index}.platformName`] && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors[`socialLinks.${index}.platformName`]}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <Input
                  value={link.url}
                  onChange={(event) => update(index, { url: event.target.value })}
                  placeholder="https://instagram.com/yourplace"
                  aria-label={`Link ${index + 1} URL`}
                />
                {errors[`socialLinks.${index}.url`] && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors[`socialLinks.${index}.url`]}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onChange(socialLinks.filter((_, position) => position !== index))}
                aria-label={`Remove ${link.platformName || `link ${index + 1}`}`}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center self-end rounded-full text-gray-400 transition hover:bg-white hover:text-destructive sm:self-start"
              >
                <IconComponent iconName="Delete02Icon" color="currentColor" size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant="gradient-outline"
        className="rounded-full"
        onClick={() =>
          onChange([...socialLinks, { id: `new-${Date.now()}`, platformName: '', url: '' }])
        }
      >
        <span className="flex items-center gap-2">
          <IconComponent iconName="PlusSignIcon" color="currentColor" size={16} />
          Add a link
        </span>
      </Button>
    </div>
  );
};
