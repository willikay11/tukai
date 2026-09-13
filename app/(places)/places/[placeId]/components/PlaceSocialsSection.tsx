import { IconComponent } from '@/app/shared/components/Icons';
import { SectionShell } from '@/app/shared/components/Sections';
import { PlaceSocialLink } from '@/types/place';

export const PlaceSocialsSection = ({ links }: { links: PlaceSocialLink[] }) => {
  if (links.length === 0) return null;

  return (
    <SectionShell id="socials" title="Socials">
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
          >
            <IconComponent iconName={link.icon ?? 'Link01Icon'} size={16} color="currentColor" />
            {link.platformName}
          </a>
        ))}
      </div>
    </SectionShell>
  );
};
