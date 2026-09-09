'use client';

import { ReactNode, createContext, useContext, useState } from 'react';

import { AuthCard, AuthDialogContent } from '@/app/shared/components/Auth';
import { toast } from '@/app/shared/hooks/useToast';
import { Dialog } from '@/components/ui/dialog';

type AuthDialogType = {
  setOpenSignIn: (open: boolean) => void;
  openSignInWithCallback: (onLoginSuccess: () => void) => void;
};

const AuthDialogContext = createContext<AuthDialogType | undefined>(undefined);

export const AuthDialogProvider = ({ children }: { children: ReactNode }) => {
  const [openSignIn, setOpenSignIn] = useState(false);
  const [onLoginSuccess, setOnLoginSuccess] = useState<(() => void) | null>(null);

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
      {/* Closing only closes. It used to call router.back(), so a reader who
          opened this from a place page and changed their mind was navigated
          off the page they were reading. */}
      <Dialog
        open={openSignIn}
        onOpenChange={(open) => {
          if (open) return;
          setOpenSignIn(false);
          setOnLoginSuccess(null);
        }}
      >
        <AuthDialogContent>
          <AuthCard
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
        </AuthDialogContent>
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
