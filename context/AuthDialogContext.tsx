'use client';

import { ReactNode, createContext, useContext, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SignInForm } from '@/components/ui/form/sign-in';
import { toast } from '@/app/shared/hooks/useToast';

type AuthDialogType = {
  setOpenSignIn: (open: boolean) => void;
  openSignInWithCallback: (onLoginSuccess: () => void) => void;
};

const AuthDialogContext = createContext<AuthDialogType | undefined>(undefined);

export const AuthDialogProvider = ({ children }: { children: ReactNode }) => {
  const [openSignIn, setOpenSignIn] = useState(false);
  const [onLoginSuccess, setOnLoginSuccess] = useState<(() => void) | null>(null);
  const router = useRouter();

  return (
    <AuthDialogContext.Provider
      value={{
        setOpenSignIn: (open: boolean) => {
          setOpenSignIn(open);
          if (!open) setOnLoginSuccess(null);
        },
        openSignInWithCallback: (callback: () => void) => {
          setOnLoginSuccess(() => callback);
          setOpenSignIn(true);
        },
      }}
    >
      <Dialog
        open={openSignIn}
        onOpenChange={() => {
          setOpenSignIn(false);
          router.back();
        }}
      >
        <DialogContent className="gap-0 px-4 md:px-16">
          <SignInForm
            onLogin={() => {
              setOpenSignIn(false);
              onLoginSuccess?.();
              setOnLoginSuccess(null);
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
