'use client';

import { useRouter } from 'next/navigation';

import { toast } from '@/app/shared/hooks/useToast';
import { SignInForm } from '@/components/ui/form/sign-in';

export default function Page() {
  const router = useRouter();

  return (
    <SignInForm
      onLogin={() => {
        toast({
          description: 'Welcome Back!',
          variant: 'success',
        });

        router.push('/');
      }}
    />
  );
}
