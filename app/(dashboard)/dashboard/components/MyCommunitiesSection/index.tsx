'use client';

import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { useMyCommunities } from '@/app/shared/hooks/useCommunities';

import { CommunityRow } from './CommunityRow';

export const MyCommunitiesSection = ({ userId }: { userId: string | undefined }) => {
  const router = useRouter();
  const { owned, joined, isLoading } = useMyCommunities(userId);
  const hasComms = owned.length > 0 || joined.length > 0;

  if (isLoading) {
    return (
      <section aria-label="My communities" className="flex min-w-0 flex-col gap-3">
        <div className="h-7 w-40 animate-pulse rounded-full bg-gray-100" />
        <div className="h-20 w-full animate-pulse rounded-xl bg-gray-100" />
      </section>
    );
  }

  return (
    <section aria-label="My communities" className="flex min-w-0 flex-col gap-3">
      <h2 className="m-0">
        <button
          type="button"
          onClick={() => router.push(`/communities?tab=${owned.length ? 'mine' : 'following'}`)}
          aria-label="See all my communities"
          className="inline-flex min-h-[44px] items-center gap-1 p-0 text-[17px] font-bold tracking-[-0.2px] text-brand-ink hover:text-brand"
        >
          My communities
          <IconComponent iconName="ArrowRight01Icon" size={22} color="currentColor" />
        </button>
      </h2>

      {hasComms ? (
        <div className="-mt-2 grid min-w-0 grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-x-4 gap-y-2">
          {owned.map((community) => (
            <CommunityRow key={community.id} community={community} isOwned />
          ))}
          {joined.map((community) => (
            <CommunityRow key={community.id} community={community} isOwned={false} />
          ))}
        </div>
      ) : (
        <p className="m-0 text-sm text-ink-muted">You aren’t in a community yet. Joining is instant.</p>
      )}
    </section>
  );
};
