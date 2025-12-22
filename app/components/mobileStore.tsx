'use client';

import Image from 'next/image';

export default function MobileStore() {
  
    const onDownloadApp = (url: string) => {
      window.open(url, '_blank');
    };

  return (
    <div className="inline-flex w-full items-center justify-center">
      <Image
        src="/images/apple-store.png"
        width={100}
        height={70}
        style={{ width: '100px', height: '35px' }}
        alt="Google play store"
        className="mr-2"
        onClick={() => onDownloadApp('https://apps.apple.com/us/app/tukai/id6751051486')}
      />
      <Image
        src="/images/google-play-store.png"
        width={100}
        height={90}
        style={{ width: '110px', height: '35px' }}
        alt="Google play store"
        onClick={() => onDownloadApp('https://play.google.com/store/apps/details?id=com.tukaitravels.app&hl=en')}
      />
    </div>
  );
}
