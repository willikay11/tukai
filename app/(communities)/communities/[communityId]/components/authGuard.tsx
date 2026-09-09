'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { AuthCard, AuthDialogContent } from '@/app/shared/components/Auth';
import { toast } from '@/app/shared/hooks/useToast';
import { Dialog } from '@/components/ui/dialog';

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
      <AuthDialogContent>
        <AuthCard
          onLogin={() => {
            toast({
              description: 'Welcome Back!',
              variant: 'success',
            });
            setOpen(false);
            router.refresh();
          }}
        />
      </AuthDialogContent>
    </Dialog>
  );
};
