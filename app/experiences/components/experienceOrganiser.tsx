'use client';

import { CheckmarkBadge02Icon } from '@hugeicons/react-pro';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Experience } from '@/types/experience';
import SendMessage from '@/app/components/sendMessage';
import { useState } from 'react';

export default function ExperienceOrganiser({ experience }: { experience: Experience }) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <SendMessage open={open} setOpen={setOpen} recipientId={experience.host.id} />
      <div className="inline-flex w-full rounded-[15px] bg-blue-50 px-2 py-3.5">
        <div className="inline-flex w-full justify-between">
          <div className="inline-flex">
            <Image
              src={experience.host.picture}
              width={40}
              height={40}
              alt={experience.host.displayName || experience.host.firstName}
              className="mr-2.5 h-fit rounded-full"
            />
            <div className="flex flex-col">
              <div className="inline-flex items-center">
                <p className="mr-1 text-sm font-semibold text-gray-700">
                  {experience.host.displayName || `${experience.host.firstName} ${experience.host.lastName}`}
                </p>
                <CheckmarkBadge02Icon size={16} variant="solid" className="text-primary" />
              </div>
              <p className="text-sm font-normal text-gray-600">44 Experiences organised</p>
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
