'use client';

import Link from 'next/link';

import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { Community } from '@/types/community';

import { CommunityProfileCard } from './CommunityProfileCard';

const EmptyPanel = ({ message, cta, href }: { message: string; cta: string; href: string }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-5 py-[18px]">
    <span className="text-sm text-ink-muted">{message}</span>
    <Link
      href={href}
      className="h-11 whitespace-nowrap rounded-full border border-line px-[18px] text-sm font-semibold leading-[44px] text-brand-ink"
    >
      {cta}
    </Link>
  </div>
);

const CommunityGrid = ({ communities }: { communities: Community[] }) => (
  <div className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(max(190px,(100%_-_40px)/3),1fr))] gap-x-5 gap-y-6">
    {communities.map((community) => (
      <CommunityProfileCard key={community.id} community={community} />
    ))}
  </div>
);

export const CommunitiesTab = ({ userId }: { userId?: string | null }) => {
  const enabled = Boolean(userId);

  const { data: ownedResponse, isLoading: isLoadingOwned } = useGetCommunities({
    page: 1,
    enabled,
    createdBy: userId ?? undefined,
  });
  const { data: joinedResponse, isLoading: isLoadingJoined } = useGetCommunities({
    page: 1,
    enabled,
    following: true,
  });

  const owned: Community[] = ownedResponse?.data?.results ?? [];
  const joined: Community[] = (joinedResponse?.data?.results ?? []).filter(
    (community: Community) => !owned.some((own) => own.id === community.id),
  );

  if (isLoadingOwned || isLoadingJoined) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(max(190px,(100%_-_40px)/3),1fr))] gap-x-5 gap-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[62px] animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="text-19 font-bold tracking-[-0.3px] text-brand-ink">
          You run{owned.length > 0 && ` (${owned.length})`}
        </h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">You can host experiences in these.</p>

        {owned.length > 0 ? (
          <CommunityGrid communities={owned} />
        ) : (
          <div className="mt-3.5">
            <EmptyPanel
              message="You don't run a community yet."
              cta="Create a community"
              href="/communities?create=community"
            />
          </div>
        )}
      </div>

      <div>
        <h2 className="text-19 font-bold tracking-[-0.3px] text-brand-ink">
          You joined{joined.length > 0 && ` (${joined.length})`}
        </h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">
          Joining never books or pays for anything.
        </p>

        {joined.length > 0 ? (
          <CommunityGrid communities={joined} />
        ) : (
          <div className="mt-3.5">
            <EmptyPanel
              message="You have not joined a community yet. Joining is instant."
              cta="Browse communities"
              href="/communities"
            />
          </div>
        )}
      </div>
    </div>
  );
};
