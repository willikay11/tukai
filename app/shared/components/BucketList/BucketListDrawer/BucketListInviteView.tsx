'use client';

import { useEffect, useId, useState } from 'react';

import { useSession } from 'next-auth/react';

import { useQuery } from '@tanstack/react-query';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import {
  BucketListInvitee,
  useBucketList,
  useBucketListMembers,
  useInviteBucketListMembers,
} from '@/app/shared/hooks/useBucketLists';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { searchUsers } from '@/services/experience';
import { BucketListDetail, BucketListMember } from '@/types/bucket-list';
import { LinkedUser, linkedUserName } from '@/types/user';

import { SEARCH_INPUT } from './BucketListMembersView';
import { BucketListPanelFrame } from './BucketListPanelFrame';
import {
  BucketListNav,
  inviteSendLabel,
  inviteSentToast,
  isEmailAddress,
} from './bucket-list-drawer';

type Person = LinkedUser & { email?: string; username?: string };

/** Someone picked to invite - a Tukai account, or an email address. */
interface PickedPerson {
  key: string;
  name: string;
  firstName: string;
  user?: Person;
  email?: string;
}

const MAX_SUGGESTIONS = 5;

/** The people a search found. The endpoint answers with a page or a bare array. */
const peopleFrom = (payload: unknown): Person[] =>
  Array.isArray(payload)
    ? payload
    : (((payload as { results?: unknown })?.results as Person[] | undefined) ?? []);

const pickFromUser = (user: Person): PickedPerson => ({
  key: `user:${user.id}`,
  name: linkedUserName(user),
  firstName: user.firstName?.trim() || linkedUserName(user).split(' ')[0],
  user,
});

const pickFromEmail = (email: string): PickedPerson => ({
  key: `email:${email.toLowerCase()}`,
  name: email,
  firstName: email,
  email,
});

/** The value the search last settled on, a beat after typing stops. */
const useSettled = (value: string, delay = 300) => {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return settled;
};

const PickFace = ({ pick }: { pick: PickedPerson }) =>
  pick.user ? (
    <span
      aria-hidden="true"
      className="relative block h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-surface-brand"
    >
      <PhotoImage
        src={pick.user.picture ?? undefined}
        alt=""
        fill
        sizes="40px"
        className="object-cover"
        fallback={
          <span className="flex h-full w-full items-center justify-center bg-[#E3E8E5] text-[15px] font-semibold text-ink">
            {pick.name.charAt(0).toUpperCase()}
          </span>
        }
      />
    </span>
  ) : (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#E3E8E5] text-[15px] font-semibold text-ink"
    >
      @
    </span>
  );

/**
 * Invite members, for the owner of a private list. Public lists have no
 * invites - anyone can join them.
 *
 * The search is a combobox: the suggestions are a listbox the arrow keys move
 * through, Enter adds the highlighted one (the first by default), and each
 * person added is announced.
 */
export const BucketListInviteView = ({
  bucketListId,
  nav,
}: {
  bucketListId: string;
  nav: BucketListNav;
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { toast } = useToast();
  const listboxId = useId();

  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<PickedPerson[]>([]);
  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  const { data: response } = useBucketList(bucketListId);
  const bucketList: BucketListDetail | undefined = response?.data;
  const isOwner = Boolean(userId) && bucketList?.owner?.id === userId;

  const { data: membersResponse } = useBucketListMembers(bucketListId, isOwner);
  const members: BucketListMember[] = Array.isArray(membersResponse?.data)
    ? membersResponse.data
    : (membersResponse?.data?.results ?? bucketList?.members ?? []);

  const { mutate: sendInvites, isPending } = useInviteBucketListMembers(bucketListId);

  const trimmed = query.trim();
  const settled = useSettled(trimmed);
  const { data: searchResponse, isFetching } = useQuery({
    queryKey: ['users', 'search', settled],
    queryFn: () => searchUsers(settled),
    enabled: settled.length >= 2,
    staleTime: 60 * 1000,
  });

  // Already on the list, already invited, or already picked
  const taken = new Set<string>([
    ...(bucketList?.owner ? [bucketList.owner.id] : []),
    ...members
      .filter((member) => member.status === 'accepted' || member.status === 'pending')
      .map((member) => member.user?.id),
    ...picked.map((pick) => pick.user?.id ?? ''),
  ]);
  const invitedEmails = new Set(
    members
      .filter((member) => member.status === 'pending')
      .map((member) => (member.user as Person)?.email?.toLowerCase())
      .filter(Boolean),
  );
  const pickedEmails = new Set(picked.map((pick) => pick.email?.toLowerCase()).filter(Boolean));

  const typedEmail = isEmailAddress(trimmed) ? trimmed.toLowerCase() : null;
  const emailTaken = Boolean(typedEmail && invitedEmails.has(typedEmail));

  const found = settled === trimmed && settled.length >= 2 ? peopleFrom(searchResponse?.data) : [];
  const people = found.filter((person) => !taken.has(person.id)).slice(0, MAX_SUGGESTIONS);
  const emailMatchesPerson = found.some((person) => person.email?.toLowerCase() === typedEmail);

  const suggestions: PickedPerson[] = [
    ...people.map(pickFromUser),
    ...(typedEmail && !emailTaken && !emailMatchesPerson && !pickedEmails.has(typedEmail)
      ? [pickFromEmail(trimmed)]
      : []),
  ];

  const showNoMatch =
    trimmed.length >= 2 && !isFetching && settled === trimmed && suggestions.length === 0;
  const isOpen = suggestions.length > 0;

  // A typed address that has not been added yet still goes out with the rest
  const pendingTypedEmail =
    typedEmail && !emailTaken && !pickedEmails.has(typedEmail) ? pickFromEmail(trimmed) : null;
  const toSend = pendingTypedEmail ? [...picked, pendingTypedEmail] : picked;

  useEffect(() => setActive(0), [suggestions.length, trimmed]);

  const add = (pick: PickedPerson) => {
    setPicked((current) => [...current, pick]);
    setQuery('');
    setAnnouncement(`${pick.name} added`);
  };

  const remove = (pick: PickedPerson) => {
    setPicked((current) => current.filter((each) => each.key !== pick.key));
    setAnnouncement(`${pick.name} removed`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && isOpen) {
      event.preventDefault();
      setActive((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && isOpen) {
      event.preventDefault();
      setActive((index) => (index - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const pick = suggestions[active] ?? suggestions[0];
      if (pick) add(pick);
    } else if (event.key === 'Escape' && query) {
      event.stopPropagation();
      setQuery('');
    }
  };

  const handleSend = () => {
    if (toSend.length === 0) return;

    const invitees: BucketListInvitee[] = toSend.map((pick) =>
      pick.user ? { userId: pick.user.id } : { email: pick.email },
    );

    sendInvites(invitees, {
      onSuccess: () => {
        toast({ title: inviteSentToast(toSend.map((pick) => pick.firstName)), variant: 'success' });
        nav.back();
      },
      onError: (failure: Error) =>
        toast({
          title: 'Could not send every invite',
          description: failure.message,
          variant: 'destructive',
        }),
    });
  };

  return (
    <BucketListPanelFrame title="Invite members" onBack={nav.back} onClose={nav.close}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label htmlFor="bl-iq" className="text-base text-gray-800">
            You can invite via username or email
          </label>
          <div className="relative">
            <input
              id="bl-iq"
              type="text"
              role="combobox"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-activedescendant={isOpen ? `${listboxId}-${active}` : undefined}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by username or add their email"
              className={`${SEARCH_INPUT} pl-4 pr-[52px]`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted">
              <IconComponent iconName="Search01Icon" size={20} color="currentColor" />
            </span>
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-label="People to invite"
            hidden={!isOpen}
            className="flex flex-col rounded-xl bg-white p-1.5 shadow-[0_10px_28px_rgba(1,51,52,.14)]"
          >
            {suggestions.map((pick, index) => (
              <li
                key={pick.key}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => add(pick)}
                onMouseEnter={() => setActive(index)}
                className={cn(
                  'flex min-h-14 cursor-pointer items-center gap-3 rounded-[10px] px-2.5 py-1.5 text-left',
                  index === active && 'bg-surface',
                )}
              >
                <PickFace pick={pick} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[15px] font-medium text-gray-800">
                    {pick.name}
                  </span>
                  <span className="text-13 text-ink-muted">
                    {pick.user
                      ? pick.user.username
                        ? `@${pick.user.username}`
                        : (pick.user.email ?? '')
                      : 'Invite by email'}
                  </span>
                </span>
                <IconComponent
                  iconName="Add01Icon"
                  size={20}
                  color="currentColor"
                  className="text-brand"
                />
              </li>
            ))}
          </ul>

          {(showNoMatch || emailTaken) && (
            <p className="text-sm text-ink-muted">
              {emailTaken
                ? 'That email already has an invite.'
                : `No one on Tukai matches “${trimmed}”. Add their email address instead.`}
            </p>
          )}
        </div>

        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>

        {picked.length > 0 && (
          <ul aria-label="Picked to invite" className="flex flex-wrap gap-2">
            {picked.map((pick) => (
              <li
                key={pick.key}
                className="inline-flex h-[52px] max-w-full items-center gap-2 rounded-full bg-surface pl-1.5 pr-0.5"
              >
                <PickFace pick={pick} />
                <span className="max-w-[180px] truncate text-[15px] text-gray-800">
                  {pick.name}
                </span>
                <button
                  type="button"
                  onClick={() => remove(pick)}
                  aria-label={`Remove ${pick.name}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-ink-subtle transition-colors hover:text-gray-800"
                >
                  <IconComponent iconName="CancelCircleIcon" size={22} color="currentColor" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={nav.back}
            className="h-12 px-1.5 text-base font-medium text-danger hover:underline"
          >
            Cancel
          </button>

          <Button
            type="button"
            variant="lime"
            onClick={handleSend}
            disabled={toSend.length === 0}
            aria-disabled={toSend.length === 0}
            isLoading={isPending}
            className="h-14 rounded-full px-[30px] text-base font-semibold hover:shadow-[0_6px_16px_rgba(176,232,0,.4)] active:scale-[.97] disabled:cursor-not-allowed disabled:bg-[#E4F4B5] disabled:text-[#5E7A45] disabled:opacity-100 disabled:shadow-none"
          >
            {inviteSendLabel(toSend.length)}
          </Button>
        </div>
      </div>
    </BucketListPanelFrame>
  );
};
