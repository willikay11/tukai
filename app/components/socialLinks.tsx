'use client';

import { PlaceSocialLink } from '@/types/place';
import { Button } from '@/components/ui/button';
import IconComponent from '@/app/components/iconComponent';
import { cn } from '@/lib/utils';

const SocialLinks = ({ links }: { links: PlaceSocialLink[] }) => {
  return links.map((link) => (
    <Button
      variant="primary"
      key={link.id}
      className={cn(
        'mr-2 shadow-none',
        link.platformName.toLowerCase() === 'facebook' &&
          'bg-blue-100 text-blue-800 hover:bg-blue-200',
        link.platformName.toLowerCase() === 'website' &&
          'bg-blue-100 text-blue-800 hover:bg-blue-200',
        link.platformName.toLowerCase() === 'instagram' &&
          'bg-purple-100 text-purple-800 hover:bg-purple-200',
        link.platformName.toLowerCase() === 'twitter' && 'bg-sky-100 text-sky-800 hover:bg-sky-200',
        link.platformName.toLowerCase() === 'tiktok' &&
          'bg-rose-100 text-rose-600 hover:bg-rose-200',
      )}
      onClick={() => window.open(link.url, '_blank')}
    >
      {link.icon ? <IconComponent iconName={link.icon} /> : null}
      {link.platformName}
    </Button>
  ));
};

export default SocialLinks;
