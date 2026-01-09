'use client';

import { useEffect, useState } from 'react';

import IconComponent from './iconComponent';
import MobileStore from './mobileStore';

export default function DownloadApp() {
  const [showDownloadApp, setShowDownloadApp] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDownloadApp(false);
    }, 15000); // Hide after 15 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!showDownloadApp) {
    return null;
  }
  return (
    <div className="fixed bottom-24 left-1 right-1 z-50 mx-4 rounded-[15px] bg-white shadow-md md:mx-auto">
      <div className="p-4">
        <div className="mb-2 inline-flex w-full items-center justify-between">
          <p className="mb-2 text-xl font-black text-gray-700">Download the Tukai App</p>
          <div onClick={() => setShowDownloadApp(false)}>
            <IconComponent iconName="Cancel01Icon" size={24} color="gray" />
          </div>
        </div>
        <p className="text-sm text-gray-700">
          Download Tukai to create experiences and enjoy more features
        </p>
        <MobileStore className="mt-2.5 !justify-start" />
      </div>
    </div>
  );
}
