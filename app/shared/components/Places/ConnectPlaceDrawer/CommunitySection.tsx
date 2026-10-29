'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCommunityPhoto } from '@/components/ui/community-pill';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Community } from '@/types/community';

import type { CommunityVisibility } from './useConnectPlaceDrawer';

const VISIBILITY_OPTIONS: { value: CommunityVisibility; label: string; note: string }[] = [
  { value: 'public', label: 'Public', note: '(everyone)' },
  { value: 'private', label: 'Private', note: '(invited people)' },
];

export interface CommunitySectionProps {
  communities: Community[];
  isLoadingCommunities: boolean;
  selectedCommunityId: string;
  onSelect: (communityId: string) => void;
  isNewCommunityBoxOpen: boolean;
  setIsNewCommunityBoxOpen: (open: boolean) => void;
  canCloseNewCommunityBox: boolean;
  newCommunityName: string;
  setNewCommunityName: (value: string) => void;
  newCommunityVisibility: CommunityVisibility;
  setNewCommunityVisibility: (value: CommunityVisibility) => void;
  isCreatingCommunity: boolean;
  onCreateCommunity: () => void;
}

/**
 * The community you pick owns the place once the claim is approved. Only
 * communities the reader owns are offered - membership elsewhere isn't
 * enough to claim with.
 */
export const CommunitySection = ({
  communities,
  isLoadingCommunities,
  selectedCommunityId,
  onSelect,
  isNewCommunityBoxOpen,
  setIsNewCommunityBoxOpen,
  canCloseNewCommunityBox,
  newCommunityName,
  setNewCommunityName,
  newCommunityVisibility,
  setNewCommunityVisibility,
  isCreatingCommunity,
  onCreateCommunity,
}: CommunitySectionProps) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <section className="-mt-2.5 flex flex-col gap-3" aria-label="Community">
      <div className="flex min-h-11 items-center gap-0.5">
        <span className="text-[15px] font-semibold leading-tight text-gray-800">
          Select community
        </span>
        <button
          type="button"
          onClick={() => setIsInfoOpen((open) => !open)}
          aria-expanded={isInfoOpen}
          aria-label="What the community does"
          className="flex h-11 w-11 items-center justify-center rounded-full text-brand hover:bg-surface-brand"
        >
          <IconComponent iconName="InformationCircleIcon" size={20} color="currentColor" />
        </button>
      </div>

      {isInfoOpen && (
        <p className="-mt-2 text-sm leading-relaxed text-ink">
          The community you pick owns the place on Tukai. Its owners manage the reservations, hours
          and experiences there.
        </p>
      )}

      {!isLoadingCommunities && communities.length > 0 && (
        <div role="radiogroup" aria-label="Community" className="flex flex-wrap gap-2">
          {communities.map((community) => {
            const checked = community.id === selectedCommunityId;

            return (
              <button
                key={community.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => onSelect(community.id)}
                className={cn(
                  'inline-flex max-h-12 items-center gap-2.5 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-5 text-[14.5px] font-semibold transition-colors',
                  checked
                    ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                    : 'bg-surface text-gray-800',
                )}
              >
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={getCommunityPhoto(community)} alt="" />
                  <AvatarFallback className="bg-surface-brand text-brand">
                    {community.title.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{community.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {!isNewCommunityBoxOpen && (
        <button
          type="button"
          onClick={() => setIsNewCommunityBoxOpen(true)}
          className="inline-flex h-11 w-fit items-center gap-2 text-[15px] font-semibold text-brand hover:underline"
        >
          <IconComponent
            iconName="UserAdd02Icon"
            size={20}
            color="currentColor"
            className="flex-shrink-0"
          />
          Create a community
        </button>
      )}

      {isNewCommunityBoxOpen && (
        <div className="flex flex-col gap-3 rounded-xl bg-surface p-4">
          <div className="flex min-h-6 items-center justify-between gap-2">
            <span className="text-[15px] font-semibold text-gray-800">New community</span>
            {canCloseNewCommunityBox && (
              <button
                type="button"
                onClick={() => setIsNewCommunityBoxOpen(false)}
                aria-label="Close new community"
                className="-m-2.5 flex h-11 w-11 items-center justify-center rounded-full text-gray-800 hover:bg-surface-brand"
              >
                <IconComponent iconName="Cancel01Icon" size={18} color="currentColor" />
              </button>
            )}
          </div>

          <p className="-mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
            It owns this place once the claim is approved. Add a photo, a description and members
            from its page later.
          </p>

          <Input
            type="text"
            placeholder="Community name"
            aria-label="Community name"
            maxLength={60}
            value={newCommunityName}
            onChange={(event) => setNewCommunityName(event.target.value)}
            containerClassName="h-14 rounded-xl bg-white"
          />

          <div role="radiogroup" aria-label="Who can see it" className="flex flex-wrap gap-2">
            {VISIBILITY_OPTIONS.map((option) => {
              const checked = option.value === newCommunityVisibility;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => setNewCommunityVisibility(option.value)}
                  className={cn(
                    'inline-flex h-11 items-center gap-1 whitespace-nowrap rounded-full px-[18px] text-[14.5px] font-medium transition-colors',
                    checked
                      ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                      : 'bg-white text-gray-800',
                  )}
                >
                  {option.label}
                  <span className={checked ? 'text-surface-brand' : 'text-ink-muted'}>
                    {option.note}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onCreateCommunity}
            disabled={!newCommunityName.trim() || isCreatingCommunity}
            className="inline-flex h-11 w-fit items-center rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-5 text-[14.5px] font-semibold text-white disabled:bg-surface-brand disabled:text-ink-muted"
          >
            Create community
          </button>
        </div>
      )}
    </section>
  );
};
