'use client';

import { useEffect, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useUpdateMyProfile } from '@/app/shared/hooks/useAuth';
import { useToast } from '@/app/shared/hooks/useToast';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

import { MyProfile } from '../profile';

const SOCIAL_FIELDS: Array<{ id: keyof Draft; label: string; icon: string }> = [
  { id: 'instagramUrl', label: 'Instagram', icon: 'InstagramIcon' },
  { id: 'xUrl', label: 'X', icon: 'NewTwitterIcon' },
  { id: 'tiktokUrl', label: 'TikTok', icon: 'TiktokIcon' },
];

const BIO_MAX = 160;
const USERNAME_MAX = 20;
const USERNAME_PATTERN = /^[a-z0-9._]{3,20}$/;

type Draft = {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  instagramUrl: string;
  tiktokUrl: string;
  xUrl: string;
};

const draftFrom = (profile?: MyProfile | null): Draft => ({
  firstName: profile?.firstName ?? '',
  lastName: profile?.lastName ?? '',
  displayName: profile?.displayName ?? '',
  bio: profile?.bio ?? '',
  instagramUrl: profile?.instagramUrl ?? '',
  tiktokUrl: profile?.tiktokUrl ?? '',
  xUrl: profile?.xUrl ?? '',
});

const sameDraft = (a: Draft, b: Draft) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Editing a profile.
 *
 * Only what the API lets a reader change: the picture is read-only on this
 * serializer, and the email is verified rather than typed, so neither is
 * offered here. There is no field for a city either, so the handoff's City
 * dropdown is left out rather than built against nothing.
 */
export const EditProfileDrawer = ({
  profile,
  userId,
  isOpen,
  onClose,
}: {
  profile?: MyProfile | null;
  userId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const [draft, setDraft] = useState<Draft>(draftFrom(profile));
  const [error, setError] = useState<string | null>(null);

  const { mutate: save, isPending } = useUpdateMyProfile(userId);

  // The drawer stays mounted between openings, so the fields follow the profile
  useEffect(() => {
    if (isOpen) {
      setDraft(draftFrom(profile));
      setError(null);
    }
  }, [isOpen, profile]);

  const set = (id: keyof Draft, value: string) =>
    setDraft((current) => ({ ...current, [id]: value }));

  const saved = draftFrom(profile);
  const changed = !sameDraft(draft, saved);
  const nameValid = [draft.firstName, draft.lastName].join('').trim().length > 1;
  const usernameValid = USERNAME_PATTERN.test(draft.displayName);
  const ready = changed && nameValid && usernameValid;

  const close = () => {
    setDraft(saved);
    setError(null);
    onClose();
  };

  const submit = () => {
    setError(null);

    if (!nameValid) {
      setError('Add your name.');
      return;
    }

    if (!usernameValid) {
      setError('Usernames are 3 to 20 characters: letters, numbers, full stops and underscores.');
      return;
    }

    save(
      {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        displayName: draft.displayName,
        bio: draft.bio.trim(),
        instagramUrl: draft.instagramUrl.trim(),
        tiktokUrl: draft.tiktokUrl.trim(),
        xUrl: draft.xUrl.trim(),
      },
      {
        onSuccess: () => {
          toast({ title: 'Your profile is updated.', variant: 'success' });
          onClose();
        },
        onError: (failure: Error) => setError(failure.message),
      },
    );
  };

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && close()} ariaLabel="Personal details">
      <div className="flex min-h-full flex-col">
        <div className="flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-[24px] font-bold tracking-[-0.4px] text-gray-900">
            Personal details
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-danger transition-colors hover:bg-danger-surface"
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-7 px-6 pb-9 pt-5">
          <div className="flex items-center gap-4">
            <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-full bg-surface-brand">
              <PhotoImage
                src={profile?.picture}
                alt=""
                fill
                sizes="72px"
                className="object-cover"
                fallback={<span className="h-full w-full bg-surface-brand" />}
              />
            </div>
            <button
              type="button"
              onClick={() =>
                toast({
                  description:
                    'Pick a photo from your library. It shows on your profile, reviews and moments.',
                })
              }
              className="inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-surface px-4 text-[14.5px] font-semibold text-brand-ink hover:bg-surface-brand"
            >
              <IconComponent iconName="Camera01Icon" size={18} color="currentColor" />
              Change photo
            </button>
          </div>

          <div aria-hidden="true" className="h-px flex-shrink-0 bg-surface-muted" />

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <label htmlFor="ac-first-name" className="text-[15px] font-semibold text-gray-900">
                  First name
                </label>
                <input
                  id="ac-first-name"
                  type="text"
                  value={draft.firstName}
                  onChange={(event) => set('firstName', event.target.value.slice(0, 32))}
                  placeholder="Wanjiku"
                  className="h-14 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-gray-900 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <label htmlFor="ac-last-name" className="text-[15px] font-semibold text-gray-900">
                  Last name
                </label>
                <input
                  id="ac-last-name"
                  type="text"
                  value={draft.lastName}
                  onChange={(event) => set('lastName', event.target.value.slice(0, 32))}
                  placeholder="Maina"
                  className="h-14 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-gray-900 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="ac-user" className="text-[15px] font-semibold text-gray-900">
              Username
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-ink-muted">
                @
              </span>
              <input
                id="ac-user"
                type="text"
                value={draft.displayName}
                onChange={(event) =>
                  set(
                    'displayName',
                    event.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9._]/g, '')
                      .slice(0, USERNAME_MAX),
                  )
                }
                placeholder="username"
                autoComplete="off"
                spellCheck={false}
                className="h-14 w-full rounded-xl border border-line bg-white pl-[34px] pr-4 text-[15px] text-gray-900 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="ac-bio" className="text-[15px] font-semibold text-gray-900">
                Bio
              </label>
              <span className="text-13 text-ink-muted">
                {draft.bio.length}/{BIO_MAX}
              </span>
            </div>
            <textarea
              id="ac-bio"
              value={draft.bio}
              onChange={(event) => set('bio', event.target.value.slice(0, BIO_MAX))}
              rows={3}
              placeholder="A line or two about what you like doing"
              className="w-full resize-y rounded-xl border border-line bg-white px-4 py-3.5 text-[15px] leading-normal text-gray-900 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
            />
          </div>

          <div aria-hidden="true" className="h-px flex-shrink-0 bg-surface-muted" />

          <div className="flex flex-col gap-2.5">
            <span className="text-[15px] font-semibold text-gray-900">
              Social links <span className="font-normal text-ink-muted">(optional)</span>
            </span>

            {SOCIAL_FIELDS.map((field) => (
              <div key={field.id} className="relative">
                <IconComponent
                  iconName={field.icon}
                  size={20}
                  color="currentColor"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-900"
                />
                <span className="pointer-events-none absolute left-[46px] top-1/2 -translate-y-1/2 text-[15px] text-ink-muted">
                  @
                </span>
                <input
                  type="text"
                  value={draft[field.id]}
                  onChange={(event) =>
                    set(
                      field.id,
                      event.target.value.replace(/^@/, '').replace(/\s/g, '').slice(0, 30),
                    )
                  }
                  placeholder={`${field.label} username`}
                  aria-label={`${field.label} username`}
                  autoComplete="off"
                  spellCheck={false}
                  className={cn(
                    'h-14 w-full rounded-xl border border-line bg-white pl-16 pr-4 text-[15px] text-gray-900 outline-none placeholder:text-ink-subtle',
                    'focus:border-brand focus:ring-[3px] focus:ring-surface-brand',
                  )}
                />
              </div>
            ))}
          </div>

          {error && (
            <p role="alert" className="text-[13.5px] leading-[1.45] text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
          <button
            type="button"
            onClick={close}
            className="h-12 px-1.5 text-[15px] font-medium text-danger hover:underline"
          >
            Cancel
          </button>

          <span aria-hidden="true" className="flex-1" />

          <button
            type="button"
            onClick={submit}
            disabled={!ready || isPending}
            aria-disabled={!ready}
            className="h-12 whitespace-nowrap rounded-full bg-lime px-6 text-[15px] font-semibold text-brand-ink enabled:hover:bg-lime-dark disabled:bg-[#E4F4B5] disabled:text-[#5E7A45]"
          >
            Save changes
          </button>
        </div>
      </div>
    </Drawer>
  );
};
