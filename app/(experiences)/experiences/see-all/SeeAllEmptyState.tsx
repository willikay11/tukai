'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';

export const SeeAllEmptyState = ({ message }: { message: string }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <NoData message={message} />
      <Button onClick={() => router.push('/experiences')} className="rounded-full px-6">
        Back to Discover
      </Button>
    </div>
  );
};
