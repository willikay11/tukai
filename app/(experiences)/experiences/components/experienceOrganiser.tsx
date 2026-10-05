'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { CheckmarkBadge02Icon } from '@hugeicons/react-pro';

import { IconComponent } from '@/app/shared/components';
import { SendMessage } from '@/app/shared/components/SendMessage/SendMessage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Experience } from '@/types/experience';

export const ExperienceOrganiser = ({ experience }: { experience: Experience }) => {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  // Nobody needs to message themselves, and the dialog would open a thread
  // with the reader as both sender and recipient
  const isOwnExperience = Boolean(session?.user?.id && session.user.id === experience.host?.id);

  // "1 Experiences organised" was reading as a typo on every host with one
  const hostedCount = experience.host.experienceHostedCount ?? 0;
  const hostedLabel = `${hostedCount} ${hostedCount === 1 ? 'Experience' : 'Experiences'} organised`;

  return (
    <>
      {!isOwnExperience && (
        <SendMessage open={open} setOpen={setOpen} recipientId={experience.host.id} />
      )}
      {/* Stacked on a phone, side by side from sm. A long host name and a
          button on one narrow row left the name wrapping to two lines with the
          button stretched down the side of it. */}
      <div className="flex w-full flex-col gap-3 rounded-[15px] bg-gray-50 px-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center">
          <Avatar className="mr-2.5 h-[40px] w-[40px] flex-shrink-0">
            <AvatarImage src={experience.host.picture} />
            <AvatarFallback />
          </Avatar>
          {/* min-w-0 so the name truncates rather than forcing the row wider */}
          <div className="flex min-w-0 flex-col">
            <div className="flex min-w-0 items-center gap-1">
              <p className="truncate text-sm font-semibold text-gray-700">
                {experience.host.displayName ||
                  `${experience.host.firstName} ${experience.host.lastName}`}
              </p>
              <CheckmarkBadge02Icon
                size={16}
                variant="solid"
                className="flex-shrink-0 text-primary"
              />
            </div>
            <p className="text-sm font-normal text-gray-600">{hostedLabel}</p>
          </div>
        </div>
        {!isOwnExperience && (
          <Button
            variant="gradient"
            // A fixed height, not `h-full`: that stretched the button to the
            // height of a wrapped name beside it
            className="h-10 w-full flex-shrink-0 rounded-full sm:w-auto"
            onClick={() => setOpen(true)}
          >
            {/* Two bubbles, the smaller one in front. White to read against
                the gradient. */}
            <IconComponent
              iconName="MessageMultiple02Icon"
              size={18}
              color="#FFFFFF"
              className="mr-2"
            />
            Message host
          </Button>
        )}
      </div>
    </>
  );
};
