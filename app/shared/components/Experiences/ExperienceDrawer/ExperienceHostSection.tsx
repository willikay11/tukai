'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { CheckmarkBadge02Icon } from '@hugeicons/react-pro';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { SendMessage } from '@/app/shared/components/SendMessage/SendMessage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Experience } from '@/types/experience';
import { photoUrl } from '@/types/photo';
import { communityPath } from '@/utils/detail-paths';

/**
 * Host, and host community (ED-08).
 *
 * The host row ports `ExperienceOrganiser`'s pattern - the drawer's own copy
 * rather than a shared one, since the page version is sized for a full column
 * rather than the drawer's narrower body. "Going" (ED-08's guest-avatar row)
 * is not built: `Experience.guests` carries only email and invite status, no
 * picture, so there is nothing to show avatars of.
 */
export const ExperienceHostSection = ({ experience }: { experience: Experience }) => {
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const { data: session } = useSession();

  const host = experience.host;
  const isOwnExperience = Boolean(session?.user?.id && host?.id && session.user.id === host.id);

  const hostedCount = host?.experienceHostedCount ?? 0;
  const hostedLabel = `${hostedCount} ${hostedCount === 1 ? 'Experience' : 'Experiences'} organised`;

  const communityPhoto = experience.hostCommunity?.photos?.[0]
    ? photoUrl(experience.hostCommunity.photos[0], 'thumb')
    : undefined;

  if (!host && !experience.hostCommunity) return null;

  return (
    <div className="space-y-4 border-t border-line pt-6">
      <h3 className="text-[22px] font-bold text-brand-ink">Host</h3>

      {host && (
        <>
          {!isOwnExperience && (
            <SendMessage open={isMessageOpen} setOpen={setIsMessageOpen} recipientId={host.id} />
          )}

          <div className="flex w-full flex-col gap-3 rounded-2xl bg-surface p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center">
              <Avatar className="mr-2.5 h-11 w-11 flex-shrink-0">
                <AvatarImage src={host.picture} />
                <AvatarFallback />
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <div className="flex min-w-0 items-center gap-1">
                  <p className="truncate text-[15px] font-semibold text-brand-ink">
                    {host.displayName || `${host.firstName ?? ''} ${host.lastName ?? ''}`.trim()}
                  </p>
                  <CheckmarkBadge02Icon size={16} variant="solid" className="flex-shrink-0 text-brand" />
                </div>
                <p className="text-[14px] text-ink-muted">{hostedLabel}</p>
              </div>
            </div>

            {!isOwnExperience && (
              <button
                type="button"
                onClick={() => setIsMessageOpen(true)}
                className="inline-flex h-10 flex-shrink-0 items-center justify-center gap-2 rounded-full bg-lime px-5 text-[14px] font-bold text-brand-ink transition-colors hover:bg-lime-dark sm:w-auto"
              >
                <IconComponent iconName="MessageMultiple02Icon" size={18} color="currentColor" />
                Message host
              </button>
            )}
          </div>
        </>
      )}

      {experience.hostCommunity && (
        <Link
          href={communityPath(experience.hostCommunity)}
          target="_blank"
          className="flex items-center gap-3 rounded-2xl bg-surface p-3 transition-colors hover:bg-surface-muted"
        >
          {communityPhoto && (
            <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl">
              <PhotoImage
                src={communityPhoto}
                alt={experience.hostCommunity.title}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-brand-ink">
              {experience.hostCommunity.title}
            </p>
            <p className="text-[14px] text-ink-muted">Host community</p>
          </div>
        </Link>
      )}
    </div>
  );
};
