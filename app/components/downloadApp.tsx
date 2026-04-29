'use client';

import { useEffect, useState } from 'react';

import { IconComponent } from './iconComponent';
import { MobileStore } from './mobileStore';

export const DownloadApp = () => {
  const [showDownloadApp, setShowDownloadApp] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDownloadApp(false);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  if (!showDownloadApp) {
    return null;
  }
  return (
    <div className="fixed bottom-24 left-1 right-1 z-50 mx-4 rounded-[15px] bg-white shadow-md md:left-auto md:right-4 md:max-w-md">
      <div className="p-4">
        <div className="mb-2 inline-flex w-full items-center justify-between">
          <p className="text-xl font-black text-gray-700">Tukai is better on the app</p>
          <div onClick={() => setShowDownloadApp(false)}>
            <IconComponent iconName="Cancel01Icon" size={24} color="gray" />
          </div>
        </div>
        <p className="mb-2 text-sm text-gray-700">
          Download Tukai to buy tickets, discover more experiences and enjoy more features!{' '}
        </p>
        <MobileStore className="mt-2.5 !justify-start" />
      </div>
    </div>
  );
};
