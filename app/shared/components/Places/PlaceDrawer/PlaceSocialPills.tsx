import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';
import { PlaceSocialLink } from '@/types/place';

/**
 * Each network in its own colour, as the design has them.
 *
 * ⚠️ These are the one place in the app where a brand colour beats a token:
 * Instagram's purple and TikTok's pink are the networks' own, and a social
 * pill in Tukai green would not be recognised as a link to either. The
 * palette is keyed off the platform name the API sends, and anything
 * unrecognised falls back to the neutral pill.
 */
const PLATFORM_STYLES: Record<string, string> = {
  website: 'bg-[#E8EEFF] text-[#2F5BD7]',
  instagram: 'bg-[#F6E9F8] text-[#A33AB0]',
  facebook: 'bg-[#E4EEFB] text-[#1A66C9]',
  tiktok: 'bg-[#FCE7EC] text-[#D62B4E]',
  x: 'bg-surface text-brand-ink',
  twitter: 'bg-surface text-brand-ink',
  youtube: 'bg-[#FDE8E8] text-[#C62828]',
  linkedin: 'bg-[#E3EEF6] text-[#0A66C2]',
  whatsapp: 'bg-[#E4F6E8] text-[#128C4A]',
};

const NEUTRAL = 'bg-surface text-ink';

export const PlaceSocialPills = ({ links }: { links: PlaceSocialLink[] }) => {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[15px] font-semibold transition-opacity hover:opacity-80',
            PLATFORM_STYLES[link.platformName?.toLowerCase()] ?? NEUTRAL,
          )}
        >
          <IconComponent iconName={link.icon ?? 'Link01Icon'} size={18} color="currentColor" />
          {link.platformName}
        </a>
      ))}
    </div>
  );
};
