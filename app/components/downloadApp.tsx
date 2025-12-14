'use client';

import { Cancel01Icon } from '@hugeicons/react-pro';
import Image from 'next/image';
import { Button } from '@/app/components/form';
import { useState } from 'react';

export default function DownloadApp() {
  const [closed, setClosed] = useState<boolean>(false);

  if (closed) return null;

  return (
      <div className="w-full bg-green-100 px-4 py-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <Cancel01Icon
              size={16}
              variant="twotone"
              className="mr-2 cursor-pointer"
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
              <p className="text-xs font-medium text-gray-500">
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
