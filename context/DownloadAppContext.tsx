'use client';
import MobileStore from '@/app/components/mobileStore';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createContext, useContext, useState, ReactNode } from 'react';

type DownloadAppContextType = {
  onOpen: () => void;
};

const DownloadAppContext = createContext<DownloadAppContextType | undefined>(undefined);

export const DownloadAppProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onOpen = () => setIsOpen(true);

  return (
    <DownloadAppContext.Provider value={{ onOpen }}>
      <AlertDialog open={isOpen}>
        <AlertDialogContent className="h-fit w-[20rem] max-w-none p-0">
          <div className="px-4 pt-4">
            <p className="mb-2.5 text-sm text-gray-700">Please download the app to continue</p>
            <Button className="h-[45px] w-full">Download App</Button>
          </div>
          <Separator />
          <div className="pb-4">
            <MobileStore />
          </div>
        </AlertDialogContent>
      </AlertDialog>
      {children}
    </DownloadAppContext.Provider>
  );
};

export const useDownloadApp = () => {
  const context = useContext(DownloadAppContext);
  if (!context) throw new Error('useDownloadApp must be used inside DownloadAppProvider');
  return context;
};
