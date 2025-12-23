'use client';

import { CheckmarkBadge02Icon } from '@hugeicons/react-pro';
import { Button } from '@/components/ui/button';
import { Experience } from '@/types/experience';
import SendMessage from '@/app/components/sendMessage';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ExperienceOrganiser({ experience }: { experience: Experience }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SendMessage open={open} setOpen={setOpen} recipientId={experience.host.id} />
      <div className="inline-flex w-full rounded-[15px] bg-blue-50 px-2 py-3.5">
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
          <Button variant="primary-light" className="h-full" onClick={() => setOpen(true)}>
            Send Message
          </Button>
        </div>
      </div>
    </>
  );
}
