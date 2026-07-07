'use client';

import { useState } from 'react';

import { CheckmarkBadge02Icon } from '@hugeicons/react-pro';

import { SendMessage } from '@/app/shared/components/SendMessage/SendMessage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Experience } from '@/types/experience';
import { IconComponent } from '@/app/shared/components';

export const ExperienceOrganiser = ({ experience }: { experience: Experience }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SendMessage open={open} setOpen={setOpen} recipientId={experience.host.id} />
      <div className="inline-flex w-full rounded-[15px] bg-gray-50 px-3 py-3.5">
        <div className="inline-flex w-full justify-between">
          <div className="inline-flex">
            <Avatar className={`mr-2.5 h-[40px] w-[40px]`}>
              <AvatarImage src={experience.host.picture} />
              <AvatarFallback />
            </Avatar>
            <div className="flex flex-col">
              <div className="inline-flex items-center">
                <p className="mr-1 text-sm font-semibold text-gray-700">
                  {experience.host.displayName ||
                    `${experience.host.firstName} ${experience.host.lastName}`}
                </p>
                <CheckmarkBadge02Icon size={16} variant="solid" className="text-primary" />
              </div>
              <p className="text-sm font-normal text-gray-600">
                {experience.host.experienceHostedCount} Experiences organised
              </p>
            </div>
          </div>
          <Button variant="lime" className="h-full rounded-full" onClick={() => setOpen(true)}>
            Message Organiser
            <IconComponent iconName="MessageCircle01Icon" size={18} color="text-teal-950" />
          </Button>
        </div>
      </div>
    </>
  );
};
