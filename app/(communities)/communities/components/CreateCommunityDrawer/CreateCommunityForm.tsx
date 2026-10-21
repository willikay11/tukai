'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCommunityPhoto } from '@/components/ui/community-pill';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Community } from '@/types/community';
import { Interest } from '@/types/interest';

import { InvitePeopleField } from './InvitePeopleField';
import { PosterField } from './PosterField';
import type { CommunityVisibility, DraftPhoto, InvitedPerson } from './useCreateCommunityDrawer';

const TYPE_OPTIONS: { value: CommunityVisibility; label: string; note: string }[] = [
  { value: 'public', label: 'Public', note: '(Everyone)' },
  { value: 'private', label: 'Private', note: '(Only invited people)' },
];

const TypeToggle = ({
  value,
  onChange,
}: {
  value: CommunityVisibility;
  onChange: (value: CommunityVisibility) => void;
}) => (
  <div role="radiogroup" aria-labelledby="nc-type" className="flex flex-wrap gap-2.5">
    {TYPE_OPTIONS.map((option) => {
      const checked = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={checked}
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex min-h-12 items-center gap-1.5 whitespace-nowrap rounded-full px-[22px] text-[15px] font-medium transition-colors',
            checked
              ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
              : 'bg-surface text-gray-800',
          )}
        >
          {option.label}
          <span className={checked ? 'text-surface-brand' : 'text-ink-muted'}>{option.note}</span>
        </button>
      );
    })}
  </div>
);

const CategoryChips = ({
  categories,
  selectedIds,
  onToggle,
}: {
  categories: Interest[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) => (
  <div role="group" aria-labelledby="nc-cats" className="flex flex-wrap gap-2">
    {categories.map((category) => {
      const active = selectedIds.includes(category.id);

      return (
        <button
          key={category.id}
          type="button"
          aria-pressed={active}
          onClick={() => onToggle(category.id)}
          className={cn(
            'inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-[18px] text-[14.5px] font-medium transition-colors',
            active ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white' : 'bg-surface text-gray-800',
          )}
        >
          {category.icon && (
            <IconComponent
              iconName={category.icon}
              size={20}
              color="currentColor"
              className="-ml-1"
            />
          )}
          {category.name}
        </button>
      );
    })}
  </div>
);

const YourCommunities = ({
  communities,
  isLoading,
  selectedIds,
  onToggle,
}: {
  communities: Community[];
  isLoading: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2.5">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-[52px] w-32 animate-pulse rounded-full bg-surface" />
        ))}
      </div>
    );
  }

  if (communities.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <span id="nc-comms" className="text-[15px] font-semibold text-gray-800">
        Your communities
      </span>
      <span className="-mt-2 text-sm text-ink-muted">
        Select the communities you would like to invite.
      </span>

      <div role="group" aria-labelledby="nc-comms" className="flex flex-wrap gap-2.5">
        {communities.map((community) => {
          const active = selectedIds.includes(community.id);

          return (
            <button
              key={community.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(community.id)}
              className={cn(
                'inline-flex max-w-full min-h-[52px] items-center gap-2.5 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-5 text-[15px] font-medium transition-colors',
                active ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white' : 'bg-surface text-gray-800',
              )}
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={getCommunityPhoto(community)} alt="" />
                <AvatarFallback className="bg-surface-brand text-brand">
                  {community.title.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 truncate">{community.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export interface CreateCommunityFormProps {
  photos: DraftPhoto[];
  onAddPhotos: (files: File[]) => void;
  onRemovePhoto: (id: string) => void;
  onReorderPhotos: (fromIndex: number, toIndex: number) => void;
  onMovePhoto: (id: string, direction: -1 | 1) => void;
  name: string;
  onNameChange: (value: string) => void;
  visibility: CommunityVisibility;
  onVisibilityChange: (value: CommunityVisibility) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  categories: Interest[];
  selectedCategoryIds: string[];
  onToggleCategory: (id: string) => void;
  invitedPeople: InvitedPerson[];
  peopleQuery: string;
  onPeopleQueryChange: (value: string) => void;
  peopleResults: InvitedPerson[];
  isSearchingPeople: boolean;
  onAddPerson: (person: InvitedPerson) => void;
  onRemovePerson: (id: string) => void;
  myCommunities: Community[];
  isFetchingMyCommunities: boolean;
  invitedCommunityIds: string[];
  onToggleMyCommunity: (id: string) => void;
}

export const CreateCommunityForm = ({
  photos,
  onAddPhotos,
  onRemovePhoto,
  onReorderPhotos,
  onMovePhoto,
  name,
  onNameChange,
  visibility,
  onVisibilityChange,
  description,
  onDescriptionChange,
  categories,
  selectedCategoryIds,
  onToggleCategory,
  invitedPeople,
  peopleQuery,
  onPeopleQueryChange,
  peopleResults,
  isSearchingPeople,
  onAddPerson,
  onRemovePerson,
  myCommunities,
  isFetchingMyCommunities,
  invitedCommunityIds,
  onToggleMyCommunity,
}: CreateCommunityFormProps) => (
  <div className="flex flex-col gap-7">
    <div className="flex items-start gap-3 rounded-xl bg-[#DBEAFE] px-4 py-3.5">
      <IconComponent
        iconName="UserGroupIcon"
        size={21}
        color="#1D4ED8"
        className="mt-0.5 flex-shrink-0"
      />
      <span className="text-[14.5px] leading-relaxed text-gray-800">
        Think of a community as your website, business page, social media page or even a WhatsApp
        group. It organises your activities and keeps members connected from one experience to the
        next.
      </span>
    </div>

    <PosterField
      photos={photos}
      onAdd={onAddPhotos}
      onRemove={onRemovePhoto}
      onReorder={onReorderPhotos}
      onMove={onMovePhoto}
    />

    <label className="flex flex-col gap-2">
      <span className="text-[15px] font-semibold text-gray-800">Community name</span>
      <Input
        type="text"
        placeholder="Add a name"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        containerClassName="h-14 rounded-xl"
      />
    </label>

    <div className="flex flex-col gap-3">
      <span id="nc-type" className="text-[15px] font-semibold text-gray-800">
        Community type <span className="font-normal text-ink-muted">(who can see and join it)</span>
      </span>
      <TypeToggle value={visibility} onChange={onVisibilityChange} />
    </div>

    <label className="flex flex-col gap-2">
      <span className="text-[15px] font-semibold text-gray-800">Community description</span>
      <Textarea
        rows={4}
        placeholder="What brings your members together, and what do you get up to?"
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        className="min-h-[120px] rounded-xl border-line focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_#E8F1ED]"
      />
    </label>

    {categories.length > 0 && (
      <div className="flex flex-col gap-3">
        <span id="nc-cats" className="text-[15px] font-semibold text-gray-800">
          Select the categories the community falls under
        </span>
        <CategoryChips
          categories={categories}
          selectedIds={selectedCategoryIds}
          onToggle={onToggleCategory}
        />
      </div>
    )}

    <div className="h-px bg-[#E5E7EB]" aria-hidden="true" />

    <div className="flex flex-col gap-2.5">
      <span className="text-[15px] font-semibold text-gray-800">
        Invite your friends or members of other communities
      </span>
      <p className="text-[15px] leading-relaxed text-[#3F4B47]">
        Invite people one by one, or invite the members of communities you own or belong to.
      </p>
    </div>

    <InvitePeopleField
      invited={invitedPeople}
      query={peopleQuery}
      onQueryChange={onPeopleQueryChange}
      results={peopleResults}
      isSearching={isSearchingPeople}
      onAdd={onAddPerson}
      onRemove={onRemovePerson}
    />

    <YourCommunities
      communities={myCommunities}
      isLoading={isFetchingMyCommunities}
      selectedIds={invitedCommunityIds}
      onToggle={onToggleMyCommunity}
    />
  </div>
);
