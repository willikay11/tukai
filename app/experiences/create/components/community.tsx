'use client';

import { useMemo } from 'react';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/components/iconComponent';
import { Button } from '@/components/ui/button';
import { useGetCommunities } from '@/hooks/communities';

type CommunityOption = {
  id: string;
  title: string;
  image: string;
};

interface CreateExperienceCommunityProps {
  selectedCommunityId: string | null;
  onSelectCommunity: (communityId: string) => void;
  onContinue: () => void;
}

export default function CreateExperienceCommunity({
  selectedCommunityId,
  onSelectCommunity,
  onContinue,
}: CreateExperienceCommunityProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const currentUserId = session?.user?.id ?? undefined;

  const { data: createdCommunitiesResponse, isLoading: isLoadingCreatedCommunities } =
    useGetCommunities({
      page: 1,
      enabled: sessionStatus === 'authenticated' && !!currentUserId,
      createdBy: currentUserId,
    });

  const { data: followingCommunitiesResponse, isLoading: isLoadingFollowingCommunities } =
    useGetCommunities({
      page: 1,
      enabled: sessionStatus === 'authenticated' && !!currentUserId,
      following: true,
    });

  const createdCommunities = useMemo<CommunityOption[]>(() => {
    const results = (createdCommunitiesResponse?.data?.results ?? []) as any[];

    return results.map((community) => ({
      id: community.id,
      title: community.title || 'Untitled community',
      image: community.photos?.[0]?.photo || '',
    }));
  }, [createdCommunitiesResponse]);

  const coHostCommunities = useMemo<CommunityOption[]>(() => {
    const createdIds = new Set(createdCommunities.map((community) => community.id));
    const followingResults = (followingCommunitiesResponse?.data?.results ?? []) as any[];

    return followingResults
      .filter((community) => {
        if (createdIds.has(community.id)) {
          return false;
        }

        return (community.members ?? []).some((member: any) => {
          const isCurrentUser = member?.user?.id === currentUserId;
          const isCoHostRole = member?.role === 'admin' || member?.role === 'moderator';
          return isCurrentUser && isCoHostRole;
        });
      })
      .map((community) => ({
        id: community.id,
        title: community.title || 'Untitled community',
        image: community.photos?.[0]?.photo || '',
      }));
  }, [createdCommunities, currentUserId, followingCommunitiesResponse]);

  return (
    <div className="w-full">
      <h1 className="text-xl font-semibold text-gray-700">Select Community</h1>
      <p className="mt-2 text-xs text-gray-700">
        Select the community you would like to create this experience under
      </p>

      <div className="mt-6">
        <p className="text-xs font-semibold text-gray-900">Communities created by you</p>

        {isLoadingCreatedCommunities ? (
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[86px] animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
              />
            ))}
          </div>
        ) : createdCommunities.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">You have not created any communities yet.</p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {createdCommunities.map((community) => {
              const isSelected = selectedCommunityId === community.id;

              return (
                <button
                  key={community.id}
                  type="button"
                  onClick={() => onSelectCommunity(community.id)}
                  className={`flex items-center gap-3 rounded-[12px] border p-1.5 text-left transition-colors ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="relative h-[56px] w-[86px] flex-shrink-0 overflow-hidden rounded-[12px] bg-gray-100">
                    {community.image ? (
                      <Image
                        src={community.image}
                        alt={community.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200" />
                    )}
                  </div>

                  <p className="line-clamp-2 flex-1 text-xs leading-[1.2] text-gray-800">
                    {community.title}
                  </p>

                  <span
                    className={`h-4 w-4 rounded-full border-2 ${
                      isSelected ? 'border-emerald-700' : 'border-gray-400'
                    } inline-flex items-center justify-center`}
                  >
                    {isSelected ? <span className="h-2 w-2 rounded-full bg-emerald-700" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <Button
          type="button"
          variant="gradient"
          className="mt-5 rounded-full"
          onClick={() => router.push('/communities/create')}
        >
          <IconComponent iconName="UserMultipleIcon" variant='twotone' size={18} color="white" />
          Create New Community
        </Button>

        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-900">Communities where you are a co-host</p>

          {isLoadingFollowingCommunities ? (
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={`co-host-loading-${item}`}
                  className="h-[86px] animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
                />
              ))}
            </div>
          ) : coHostCommunities.length === 0 ? (
            <p className="mt-4 text-xs text-gray-500">
              You are not a co-host in other communities yet.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {coHostCommunities.map((community) => {
                const isSelected = selectedCommunityId === community.id;

                return (
                  <button
                    key={community.id}
                    type="button"
                    onClick={() => onSelectCommunity(community.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="relative h-[56px] w-[86px] flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {community.image ? (
                        <Image
                          src={community.image}
                          alt={community.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200" />
                      )}
                    </div>

                    <p className="line-clamp-2 flex-1 text-2xl leading-[1.2] text-gray-800">
                      {community.title}
                    </p>

                    <span
                      className={`h-6 w-6 rounded-full border-2 ${
                        isSelected ? 'border-emerald-700' : 'border-gray-400'
                      } inline-flex items-center justify-center`}
                    >
                      {isSelected ? <span className="h-3 w-3 rounded-full bg-emerald-700" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between">
        <Button
          type="button"
          variant="text"
          className="text-red-500 hover:text-red-600"
          onClick={() => router.push('/')}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="gradient"
          disabled={!selectedCommunityId}
          onClick={onContinue}
          className="rounded-full"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
