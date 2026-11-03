'use client';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useMyCommunities } from '@/app/shared/hooks/useCommunities';
import { useTukai } from '@/context/TukaiContext';
import { cn } from '@/lib/utils';
import type { Community } from '@/types/community';

/**
 * The starter chips under an empty chat. Tapping one sends it. Six on wide
 * screens, the first four on phones.
 */
export const TukaiStarters = () => {
  const { ask } = useTukai();
  const { data: session } = useSession();
  const { owned } = useMyCommunities((session?.user as any)?.id);
  const hiking = owned.find((c: Community) => /trail|hike|walk/i.test(c.title)) ?? owned[0];

  const starters: { icon: string; text: string }[] = [
    { icon: 'Search01Icon', text: 'Quiet cafés to work from in Westlands' },
    { icon: 'Route01Icon', text: 'Plan a weekend in Naivasha for two' },
    { icon: 'Calendar03Icon', text: 'Things to do with kids this Saturday' },
    hiking
      ? { icon: 'Ticket01Icon', text: `Draft a sunrise hike for ${hiking.title}` }
      : { icon: 'UserGroupIcon', text: 'Communities for people who love hiking' },
    { icon: 'QuillWrite02Icon', text: 'Write a caption for my Karura sunrise walk' },
    { icon: 'SunsetIcon', text: 'Sundowner spots with a view tonight' },
  ];

  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      {starters.map((starter, i) => (
        <button
          key={starter.text}
          type="button"
          onClick={() => ask(starter.text)}
          className={cn(
            'inline-flex min-h-11 max-w-full items-center gap-2 rounded-full bg-surface py-2.5 pl-3.5 pr-4 text-left text-sm leading-[1.3] text-gray-800 hover:bg-surface-brand',
            i >= 4 && 'max-[719px]:hidden',
          )}
        >
          <IconComponent
            iconName={starter.icon}
            size={18}
            color="currentColor"
            className="flex-shrink-0 text-brand"
          />
          <span className="min-w-0">{starter.text}</span>
        </button>
      ))}
    </div>
  );
};
