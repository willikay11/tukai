'use client';

import Image from 'next/image';

export default function MobileStore() {
  return (
    <div className="inline-flex w-full items-center justify-center">
      <Image
        src="/images/apple-store.png"
        width={100}
        height={70}
        style={{ width: '100px', height: '35px' }}
        alt="Google play store"
        className="mr-2"
      />
      <Image
        src="/images/google-play-store.png"
        width={100}
        height={90}
        style={{ width: '110px', height: '35px' }}
        alt="Google play store"
      />
    </div>
  );
}
