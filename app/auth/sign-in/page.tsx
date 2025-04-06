// noinspection TypeScriptValidateTypes,JSRemoveUnnecessaryParentheses

'use client';

import SignInForm from '@/components/ui/form/sign-in';
import { toast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const { data: session } = useSession();

  useEffect(() => {
    console.log(session);
    if (session && !session?.user?.hasInterests) {
      router.push('/auth/interests');
      return;
    }
    if (session && (!session?.user?.hasBillingDetails || !session?.user?.hasSubscribed)) {
      router.push('/auth/subscribe');
      return;
    }
  }, [session]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'User already exists',
        description: 'Please sign in to continue',
        variant: 'destructive',
      });
    }
  }, [error]);

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
