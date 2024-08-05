'use client';

import { Cancel01Icon, hugeiconsLicense } from '@hugeicons/react-pro';
import Image from 'next/image';
import { Button } from '@/app/ui/form';
import { useState } from 'react';
import clsx from 'clsx';

hugeiconsLicense(
  '890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=',
);

export default function DownloadApp() {
  const [closed, setClosed] = useState<boolean>(false);
  return (
    <div
      className={clsx(
        `col-span-12 border-b-[1px] border-gray-100 px-4 py-4 md:col-span-10 md:col-start-2 md:mx-0 md:hidden`,
        {
          hidden: closed,
          block: !closed,
        },
      )}
    >
      <div className="inline-flex w-full items-center justify-between">
        <div className="inline-flex items-center">
          <Cancel01Icon
            size={16}
            variant="twotone"
            className="mr-2"
            onClick={() => setClosed(true)}
          />
          <Image
            src="/images/logo-small.svg"
            alt="Oltukai logo"
            width={30}
            height={40}
            className="mr-2"
          />
          <div className="flex flex-col">
            <p className="text-sm font-medium">Download the app</p>
            <p className="text-xs font-normal text-gray-400">
              Enjoy the best experience on the app
            </p>
          </div>
        </div>
        <Button onClick={() => console.log('Download app')} size="small">
          Use App
        </Button>
      </div>
    </div>
  );
}
