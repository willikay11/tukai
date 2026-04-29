'use client';

import { useRouter } from 'next/navigation';

import { SignInForm } from '@/components/ui/form/sign-in';
import { toast } from '@/hooks/use-toast';

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
