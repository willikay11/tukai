'use client';

import { useMemo, useState } from 'react';

import { z } from 'zod';

import type { useCreateExperienceFlow } from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
import type { CommunityOption } from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
import { IconComponent } from '@/app/shared/components/Icons';
import { useGetUsers } from '@/app/shared/hooks/useAuth';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { getCommunityPhoto } from '@/components/ui/community-pill';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Community } from '@/types/community';
import type { Experience } from '@/types/experience';

type Flow = ReturnType<typeof useCreateExperienceFlow>;

// `useGetUsers`/`getUsers` has no typed response - this is the shape this
// step actually reads off each result.
interface SearchedUser {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

interface InviteGuestsStepProps {
  flow: Flow;
}

type Guest = Experience['guests'][number];

interface SearchPerson {
  id: string;
  name: string;
  email: string;
  image?: string;
}

const emailSchema = z.string().email();

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '?';

/**
 * Step 5: Invite guests (tk-step__intro / tk-sugg / tk-people / tk-comm-picks
 * in create-experience.css). Per the handoff, this step is visually and
 * behaviourally identical to Create community's own invite section - the
 * search/suggestions/invited-people markup below mirrors
 * InvitePeopleField.tsx and the "Your communities" toggle-pills mirror
 * CreateCommunityForm.tsx's YourCommunities, 1:1.
 *
 * `Experience['guests']` only carries {id, email, dateCreated, status} - no
 * name or avatar - so the richer display info (name, avatar) a picked person
 * or email row needs for its pill is tracked separately here, keyed by id,
 * purely for rendering. It is never sent through `updateInviteFormData`.
 */
export const InviteGuestsStep = ({ flow }: InviteGuestsStepProps) => {
  const { about, invite } = flow.formData;
  const { invitedGuests, invitedCommunityIds, invitedCommunities } = invite;

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [guestDisplayById, setGuestDisplayById] = useState<
    Record<string, { name: string; image?: string }>
  >({});

  const trimmed = query.trim();
  const isValidEmail = emailSchema.safeParse(trimmed).success;

  const alreadyInvited = (email: string) =>
    invitedGuests.some((guest) => guest.email.toLowerCase() === email.toLowerCase());

  const normalizedQuery = trimmed.length > 0 ? trimmed : undefined;
  const { data: users = [], isFetching: isSearching } = useGetUsers(1, 10, normalizedQuery);

  const results: SearchPerson[] = useMemo(() => {
    if (!normalizedQuery) return [];

    return (users as SearchedUser[])
      .map((user) => ({
        id: user.id,
        name:
          user.displayName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
        email: user.email,
        image: user.picture,
      }))
      .filter((person) => !alreadyInvited(person.email));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, normalizedQuery, invitedGuests]);

  const suggestions = results.slice(0, 4);
  const showPanel = isFocused && trimmed.length > 0;
  const showNoMatch =
    showPanel && trimmed.length >= 2 && suggestions.length === 0 && !isSearching && !isValidEmail;

  const addGuest = (person: SearchPerson) => {
    if (alreadyInvited(person.email)) return;

    const guest: Guest = {
      id: person.id,
      email: person.email,
      dateCreated: new Date().toISOString(),
      status: 'invited',
    };

    flow.updateInviteFormData({ invitedGuests: [...invitedGuests, guest] });
    setGuestDisplayById((prev) => ({
      ...prev,
      [person.id]: { name: person.name, image: person.image },
    }));
    setQuery('');
  };

  const addEmail = () => {
    if (!isValidEmail || alreadyInvited(trimmed)) return;

    const id = `email-${Date.now()}`;
    const guest: Guest = {
      id,
      email: trimmed,
      dateCreated: new Date().toISOString(),
      status: 'invited',
    };

    flow.updateInviteFormData({ invitedGuests: [...invitedGuests, guest] });
    setGuestDisplayById((prev) => ({ ...prev, [id]: { name: trimmed } }));
    setQuery('');
  };

  const removeGuest = (id: string) => {
    flow.updateInviteFormData({
      invitedGuests: invitedGuests.filter((guest) => guest.id !== id),
    });
    setGuestDisplayById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !trimmed) return;
    event.preventDefault();

    const [firstMatch] = suggestions;
    if (firstMatch) {
      addGuest(firstMatch);
      return;
    }

    addEmail();
  };

  // Communities the host owns OR belongs to - broader than
  // `flow.communitiesForSelector` (useCreateExperienceFlow.ts:1720-1729),
  // which is scoped to `createdBy: currentUserId` for the Date & type
  // host-community picker (owned only). "Your communities" here needs the
  // same source Create community's own picker uses:
  // useCreateCommunityDrawer.ts:55-59 - `useGetCommunities({ following: true })`.
  const { data: myCommunitiesResponse, isFetching: isFetchingMyCommunities } = useGetCommunities({
    page: 1,
    enabled: true,
    following: true,
  });

  const myCommunities: Community[] = useMemo(
    () => myCommunitiesResponse?.data?.results ?? [],
    [myCommunitiesResponse],
  );

  const toggleCommunity = (community: Community) => {
    const isSelected = invitedCommunityIds.includes(community.id);

    if (isSelected) {
      flow.updateInviteFormData({
        invitedCommunityIds: invitedCommunityIds.filter((id) => id !== community.id),
        invitedCommunities: invitedCommunities.filter((c) => c.id !== community.id),
      });
      return;
    }

    const option: CommunityOption = {
      id: community.id,
      name: community.title,
      imageUrl: getCommunityPhoto(community) ?? '',
    };

    flow.updateInviteFormData({
      invitedCommunityIds: [...invitedCommunityIds, community.id],
      invitedCommunities: [...invitedCommunities, option],
    });
  };

  const hasAnyCommunities = isFetchingMyCommunities || myCommunities.length > 0;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h2 className="text-22 font-bold leading-tight tracking-[-0.3px] text-gray-800">
          Invite your friends and communities
        </h2>
        <p className="text-15 leading-relaxed text-gray-800">
          Invite people one by one, or invite the members of communities you own or belong to.
        </p>
      </div>

      {about.visibility === 'private' && (
        <p className="-mt-2.5 rounded-xl bg-surface-brand px-4 py-3 text-[14.5px] leading-relaxed text-brand-ink">
          This experience is private. Only the people and communities you invite can see and book
          it.
        </p>
      )}

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Input
            type="text"
            aria-label="Search by name or add their email"
            placeholder="Search by name or add their email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => window.setTimeout(() => setIsFocused(false), 150)}
            onKeyDown={handleKeyDown}
            containerClassName="h-14 rounded-xl"
            suffixIcon={<IconComponent iconName="Search01Icon" size={20} color="currentColor" />}
          />

          {showPanel && (suggestions.length > 0 || isValidEmail) && (
            <div className="absolute z-10 mt-1 flex w-full flex-col gap-0.5 rounded-xl bg-white p-1.5 shadow-[0_10px_28px_rgba(1,51,52,.14)]">
              {suggestions.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addGuest(person)}
                  className="flex min-h-[52px] items-center gap-3 rounded-[10px] px-2.5 py-1.5 text-left hover:bg-surface"
                >
                  {person.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={person.image}
                      alt=""
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#E3E8E5] text-[15px] font-semibold text-ink">
                      {initial(person.name)}
                    </span>
                  )}

                  <span className="flex min-w-0 flex-col gap-px">
                    <span className="truncate text-[15px] font-medium text-gray-800">
                      {person.name}
                    </span>
                    <span className="text-13 text-ink-muted">On Tukai</span>
                  </span>
                </button>
              ))}

              {isValidEmail && !alreadyInvited(trimmed) && (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={addEmail}
                  className="flex min-h-[52px] items-center gap-3 rounded-[10px] px-2.5 py-1.5 text-left hover:bg-surface"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-brand text-brand">
                    <IconComponent iconName="Mail01Icon" size={18} color="currentColor" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-px">
                    <span className="truncate text-[15px] font-medium text-gray-800">
                      {trimmed}
                    </span>
                    <span className="text-13 text-ink-muted">Invite by email</span>
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {showNoMatch && (
          <p className="text-sm text-ink-muted">
            No one on Tukai matches &ldquo;{trimmed}&rdquo;. Add their email address instead.
          </p>
        )}

        {invitedGuests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {invitedGuests.map((guest) => {
              const display = guestDisplayById[guest.id];
              const label = display?.name || guest.email;

              return (
                <span
                  key={guest.id}
                  className="inline-flex h-[52px] max-w-full items-center gap-2 rounded-full bg-surface py-0 pl-1.5 pr-0.5"
                >
                  {display?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={display.image}
                      alt=""
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#E3E8E5] text-[15px] font-semibold text-ink">
                      {initial(label)}
                    </span>
                  )}

                  <span className="max-w-[160px] truncate text-[15px] text-gray-800">{label}</span>

                  <button
                    type="button"
                    onClick={() => removeGuest(guest.id)}
                    aria-label={`Remove ${label}`}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:text-gray-800"
                  >
                    <IconComponent iconName="CancelCircleIcon" size={22} color="currentColor" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {hasAnyCommunities && (
        <>
          <div className="-mx-6 h-px bg-gray-200" aria-hidden="true" />

          {isFetchingMyCommunities ? (
            <div className="flex flex-wrap gap-2.5">
              {[0, 1, 2].map((key) => (
                <div key={key} className="h-[52px] w-32 animate-pulse rounded-full bg-surface" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <span className="text-15 font-semibold text-gray-800">Your communities</span>
              <span className="-mt-2 text-sm text-ink-muted">
                Select the communities you would like to invite.
              </span>

              <div className="flex flex-wrap gap-2.5" role="group">
                {myCommunities.map((community) => {
                  const active = invitedCommunityIds.includes(community.id);
                  const photo = getCommunityPhoto(community);

                  return (
                    <button
                      key={community.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleCommunity(community)}
                      className={cn(
                        'inline-flex max-w-full min-h-[52px] items-center gap-2.5 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-5 text-[15px] font-medium transition-colors',
                        active
                          ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                          : 'bg-surface text-gray-800',
                      )}
                    >
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photo}
                          alt=""
                          className="h-10 w-10 flex-shrink-0 rounded-full bg-surface-brand object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-brand text-brand">
                          {community.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="min-w-0 truncate">{community.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
