'use client';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Input } from '@/components/ui/input';

/**
 * The way into the composer: the same pill field the moments feed uses for
 * comments, rather than a button.
 *
 * The field is read-only — pressing it opens the composer, which owns the text
 * and the photos, so there is only ever one draft.
 */
export const MomentComposerTrigger = ({
  placeholder = 'What are you up to?',
  onOpen,
}: {
  placeholder?: string;
  onOpen: () => void;
}) => {
  const { data: session } = useSession();
  const name = session?.user?.name ?? 'You';

  return (
    <Input
      shape="pill"
      readOnly
      value=""
      onClick={onOpen}
      onFocus={onOpen}
      placeholder={placeholder}
      aria-label={placeholder}
      className="cursor-pointer"
      // Tighter than the standard 13px/16px: an avatar sits inside the pill
      containerClassName="cursor-pointer gap-3 bg-white py-2 pl-2 pr-4 shadow-sm"
      icon={
        <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
          <PhotoImage
            src={session?.user?.image}
            alt={name}
            fill
            sizes="36px"
            className="object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-600">
                {name.charAt(0).toUpperCase()}
              </div>
            }
          />
        </div>
      }
      suffixIcon={
        <IconComponent
          iconName="Image02Icon"
          size={20}
          color="currentColor"
          className="flex-shrink-0 text-gray-400"
        />
      }
    />
  );
};
