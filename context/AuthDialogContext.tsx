'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import SignInForm from '@/components/ui/form/sign-in';
import { toast } from '@/hooks/use-toast';
import { createContext, useContext, useState, ReactNode } from 'react';

type AuthDialogType = {
  setOpenSignIn: (open: boolean) => void;
};

const AuthDialogContext = createContext<AuthDialogType | undefined>(undefined);

export const AuthDialogProvider = ({ children }: { children: ReactNode }) => {
  const [openSignIn, setOpenSignIn] = useState(false);

  return (
    <AuthDialogContext.Provider
      value={{
        setOpenSignIn: (open: boolean) => {
          setOpenSignIn(open);
        },
      }}
    >
      <Dialog open={openSignIn} onOpenChange={setOpenSignIn}>
        <DialogContent className="px-4 md:px-16">
          <SignInForm
            onLogin={() => {
              setOpenSignIn(false);
              toast({
                description: 'Welcome Back!',
                variant: 'success',
              });
            }}
          />
        </DialogContent>
      </Dialog>
      {children}
    </AuthDialogContext.Provider>
  );
};

export const useAuthDialog = () => {
  const context = useContext(AuthDialogContext);
  if (!context) throw new Error('useAuthDialog must be used inside AuthDialogProvider');
  return context;
};
