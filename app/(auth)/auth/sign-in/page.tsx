'use client';

import { useRouter } from 'next/navigation';

import { AuthCard } from '@/app/shared/components/Auth';
import { toast } from '@/app/shared/hooks/useToast';

export default function Page() {
  const router = useRouter();

  return (
    <AuthCard
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
