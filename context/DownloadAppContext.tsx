'use client';
import MobileStore from '@/app/components/mobileStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type DownloadAppContextType = {
  onOpen: () => void;
};

const DownloadAppContext = createContext<DownloadAppContextType | undefined>(undefined);

export const DownloadAppProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [device, setDevice] = useState<'ios' | 'android' | 'other'>('other');

  const onOpen = () => setIsOpen(true);

  const onDownloadApp = () => {
    let url = 'https://play.google.com/store/apps/details?id=com.tukaitravels.app&hl=en';

    if (device === 'ios') {
      url = 'https://apps.apple.com/us/app/tukai/id6751051486';
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

  return (
    <DownloadAppContext.Provider value={{ onOpen }}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="h-fit w-[80%] !p-0 md:w-[20rem]">
          <div className="px-4 pt-4">
            <p className="mb-2.5 text-sm text-gray-700">Please download the app to continue</p>
            <Button
              className="h-[45px] w-full"
              onClick={() => {
                onDownloadApp();
                setIsOpen(false);
              }}
            >
              Download App
            </Button>
          </div>
          <Separator />
          <div className="mb-4">
            <MobileStore />
          </div>
        </DialogContent>
      </Dialog>
      {children}
    </DownloadAppContext.Provider>
  );
};

export const useDownloadApp = () => {
  const context = useContext(DownloadAppContext);
  if (!context) throw new Error('useDownloadApp must be used inside DownloadAppProvider');
  return context;
};
