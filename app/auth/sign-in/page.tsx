// noinspection TypeScriptValidateTypes,JSRemoveUnnecessaryParentheses

'use client';

import SignInForm from '@/components/ui/form/sign-in';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
