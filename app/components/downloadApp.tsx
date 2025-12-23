'use client';

import { Cancel01Icon } from '@hugeicons/react-pro';
import Image from 'next/image';
import { Button } from '@/app/components/form';
import { useEffect, useState } from 'react';

export default function DownloadApp() {
  const [closed, setClosed] = useState<boolean>(false);
  const [device, setDevice] = useState<'ios' | 'android' | 'other'>('other');

  const onDownloadApp = () => {
    let url = 'https://play.google.com/store/apps/details?id=com.tukaitravels.app&hl=en';

    if (device === 'ios') {
      url = 'https://apps.apple.com/ke/app/tukai/idcom.tukaitravels.app';
    }

    window.open(url, '_blank');
  };

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor;

    if (/android/i.test(ua)) {
      setDevice('android');
    } else if (/iPad|iPhone|iPod/.test(ua)) {
      setDevice('ios');
    } else {
      setDevice('other');
    }
  }, []);

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
            alt="Tukai logo"
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
        <Button onClick={onDownloadApp} size="small">
          Use App
        </Button>
      </div>
    </div>
  );
}
