'use client';

import Image from 'next/image';

import clsx from 'clsx';

export default function MobileStore({ className }: { className?: string }) {
  const onDownloadApp = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className={clsx('inline-flex w-full items-center justify-center', className)}>
      <Image
        src="/images/apple-store.png"
        width={100}
        height={70}
        style={{ width: '100px', height: '35px' }}
        alt="Google play store"
        className="mr-2 cursor-pointer"
        onClick={() => onDownloadApp('https://apps.apple.com/us/app/tukai/id6751051486')}
      />
      <Image
        src="/images/google-play-store.png"
        width={100}
        height={90}
        style={{ width: '110px', height: '35px' }}
        alt="Google play store"
        className="cursor-pointer"
        onClick={() =>
          onDownloadApp('https://play.google.com/store/apps/details?id=com.tukaitravels.app&hl=en')
        }
      />
    </div>
  );
}
