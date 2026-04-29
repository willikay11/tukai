'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SignInForm } from '@/components/ui/form/sign-in';
import { toast } from '@/hooks/use-toast';

export const AuthGuard = () => {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(false);
        router.back();
      }}
    >
      <DialogContent className="px-4 md:px-16">
        <SignInForm
          onLogin={() => {
            toast({
              description: 'Welcome Back!',
              variant: 'success',
            });
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
