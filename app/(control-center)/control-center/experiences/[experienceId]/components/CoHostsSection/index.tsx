'use client';

import { useState } from 'react';

import { z } from 'zod';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  useAddCoHosts,
  useCoHostInvites,
  useRemoveCoHost,
  useSearchUsersDebounced,
} from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CoHostInvite, coHostInviteStatusLabel, openCoHostInvites } from '@/types/coHost';
import { Experience } from '@/types/experience';
import { LinkedUser, linkedUserName } from '@/types/user';

import { matchUserByEmail } from './co-hosts';

const emailSchema = z.string().email();

const Person = ({
  name,
  image,
  note,
  onRemove,
  removeLabel,
  isBusy,
}: {
  name: string;
  image?: string | null;
  note?: string;
  onRemove?: () => void;
  removeLabel?: string;
  isBusy?: boolean;
}) => (
  <div className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-b-0">
    {image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt="" className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
    ) : (
      <span
        aria-hidden="true"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-line text-15 font-semibold text-ink"
      >
        {name.charAt(0).toUpperCase()}
      </span>
    )}

    <div className="min-w-0 flex-1">
      <p className="truncate text-15 font-medium text-gray-900">{name}</p>
      {note && <p className="text-13 text-ink-muted">{note}</p>}
    </div>

    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        disabled={isBusy}
        aria-label={removeLabel}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:text-danger disabled:opacity-50"
      >
        <IconComponent iconName="CancelCircleIcon" size={22} color="currentColor" />
      </button>
    )}
  </div>
);

/**
 * Co-hosts, and who has been asked to be one.
 *
 * The endpoints existed and nothing called them: a host could not share an
 * experience with anyone. Inviting is not the same as co-hosting — the API
 * records a PENDING invite and waits — so both lists are shown, and the pending
 * one says what it is waiting for.
 */
export const CoHostsSection = ({ experience }: { experience: Experience }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: invitesResponse } = useCoHostInvites(experience.id);
  const { mutateAsync: findUser, isPending: isSearching } = useSearchUsersDebounced();
  const { mutate: addCoHosts, isPending: isInviting } = useAddCoHosts(experience.id);
  const { mutate: removeCoHost, isPending: isRemoving, variables } = useRemoveCoHost(experience.id);

  const invites: CoHostInvite[] = invitesResponse?.data?.results ?? invitesResponse?.data ?? [];
  const pending = openCoHostInvites(Array.isArray(invites) ? invites : []);
  const coHosts = experience.coHosts ?? [];

  const invite = async () => {
    setError(null);

    if (!emailSchema.safeParse(email.trim()).success) {
      setError('Enter the email address of their Tukai account.');
      return;
    }

    let person: LinkedUser | undefined;

    try {
      const response = await findUser(email.trim());
      person = matchUserByEmail(response?.data, email);
    } catch {
      setError('Could not look up that address. Please try again.');
      return;
    }

    if (!person) {
      // A co-host has to hold the experience's permissions, so an address with
      // no account behind it cannot be invited the way a guest can
      setError('No Tukai account uses that address. A co-host needs an account.');
      return;
    }

    addCoHosts([person.id], {
      onSuccess: () => {
        setEmail('');
        toast({
          title: `${linkedUserName(person)} has been invited`,
          description: 'They co-host this experience once they accept.',
          variant: 'success',
        });
      },
      onError: (failure: Error) =>
        toast({
          title: 'Could not invite this co-host',
          description: failure.message,
          variant: 'destructive',
        }),
    });
  };

  const remove = (user: LinkedUser) =>
    removeCoHost(user.id, {
      onSuccess: () =>
        toast({
          title: `${linkedUserName(user)} is no longer a co-host`,
          description: 'They lose access to managing this experience.',
          variant: 'success',
        }),
      onError: (failure: Error) =>
        toast({
          title: 'Could not remove this co-host',
          description: failure.message,
          variant: 'destructive',
        }),
    });

  return (
    <section className="space-y-2">
      <h3 className="text-base font-bold text-gray-900">Co-hosts</h3>
      <p className="text-13 leading-relaxed text-ink-muted">
        A co-host can manage this experience with you.
      </p>

      {coHosts.length === 0 && pending.length === 0 ? (
        <p className="py-3 text-sm text-ink-subtle">No one else manages this experience yet.</p>
      ) : (
        <div>
          {coHosts.map((coHost) => (
            <Person
              key={coHost.id}
              name={linkedUserName(coHost)}
              image={coHost.picture}
              note="Co-host"
              onRemove={() => remove(coHost)}
              removeLabel={`Remove ${linkedUserName(coHost)}`}
              isBusy={isRemoving && variables === coHost.id}
            />
          ))}

          {pending.map((one) => (
            <Person
              key={one.id}
              name={linkedUserName(one.invitedUser)}
              image={one.invitedUser?.picture}
              note={coHostInviteStatusLabel(one.status)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
            aria-label="Co-host email address"
            placeholder="Their Tukai account email"
            className={cn(
              'h-11 w-full rounded-full border bg-white px-4 text-sm text-gray-900 outline-none focus:border-brand',
              error ? 'border-danger' : 'border-line',
            )}
          />
          {error && (
            <p role="alert" className="mt-1 text-13 text-danger">
              {error}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="lime"
          onClick={invite}
          isLoading={isSearching || isInviting}
          className="rounded-full px-5"
        >
          Invite co-host
        </Button>
      </div>
    </section>
  );
};
