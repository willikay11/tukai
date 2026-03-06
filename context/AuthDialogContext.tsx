'use client';

import { ReactNode, createContext, useContext, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import SignInForm from '@/components/ui/form/sign-in';
import { toast } from '@/hooks/use-toast';

type AuthDialogType = {
  setOpenSignIn: (open: boolean, onLoginSuccess?: () => void) => void;
};

const AuthDialogContext = createContext<AuthDialogType | undefined>(undefined);

export const AuthDialogProvider = ({ children }: { children: ReactNode }) => {
  const [openSignIn, setOpenSignIn] = useState(false);
  const onLoginSuccessRef = useRef<(() => void) | null>(null);
  const router = useRouter();

  return (
    <AuthDialogContext.Provider
      value={{
        setOpenSignIn: (open: boolean, onLoginSuccess?: () => void) => {
          onLoginSuccessRef.current = onLoginSuccess || null;
          setOpenSignIn(open);
        },
      }}
    >
      <Dialog
        open={openSignIn}
        onOpenChange={() => {
          setOpenSignIn(false);
          onLoginSuccessRef.current = null;
          router.back();
        }}
      >
        <DialogContent className="gap-0 px-4 md:px-16">
          <SignInForm
            onLogin={() => {
              onLoginSuccessRef.current?.();
              onLoginSuccessRef.current = null;
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
