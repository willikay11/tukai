'use client';

import { useEffect, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useUpdateMyProfile } from '@/app/shared/hooks/useAuth';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';

import { MyProfile } from '../profile';

const FIELDS: Array<{ id: keyof Draft; label: string; placeholder: string; hint?: string }> = [
  { id: 'firstName', label: 'First name', placeholder: 'Wanjiku' },
  { id: 'lastName', label: 'Last name', placeholder: 'Maina' },
  {
    id: 'displayName',
    label: 'Handle',
    placeholder: 'wanjiku.m',
    hint: 'What people see beside your name, without the @.',
  },
  { id: 'websiteUrl', label: 'Website', placeholder: 'https://…' },
  { id: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/…' },
  { id: 'tiktokUrl', label: 'TikTok', placeholder: 'https://tiktok.com/@…' },
  { id: 'youtubeUrl', label: 'YouTube', placeholder: 'https://youtube.com/@…' },
  { id: 'xUrl', label: 'X', placeholder: 'https://x.com/…' },
];

type Draft = {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  websiteUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  xUrl: string;
};

const draftFrom = (profile?: MyProfile | null): Draft => ({
  firstName: profile?.firstName ?? '',
  lastName: profile?.lastName ?? '',
  displayName: profile?.displayName ?? '',
  bio: profile?.bio ?? '',
  websiteUrl: profile?.websiteUrl ?? '',
  instagramUrl: profile?.instagramUrl ?? '',
  tiktokUrl: profile?.tiktokUrl ?? '',
  youtubeUrl: profile?.youtubeUrl ?? '',
  xUrl: profile?.xUrl ?? '',
});

/**
 * Editing a profile.
 *
 * Only what the API lets a reader change: the picture is read-only on this
 * serializer, and the email is verified rather than typed, so neither is
 * offered here.
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

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!draft.firstName.trim()) {
      setError('A first name is the one thing people need to recognise you.');
      return;
    }

    save(
      {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        // The handle is stored without its @, however it was typed
        displayName: draft.displayName.trim().replace(/^@/, ''),
        bio: draft.bio.trim(),
        websiteUrl: draft.websiteUrl.trim(),
        instagramUrl: draft.instagramUrl.trim(),
        tiktokUrl: draft.tiktokUrl.trim(),
        youtubeUrl: draft.youtubeUrl.trim(),
        xUrl: draft.xUrl.trim(),
      },
      {
        onSuccess: () => {
          toast({ title: 'Profile saved', variant: 'success' });
          onClose();
        },
        onError: (failure: Error) => setError(failure.message),
      },
    );
  };

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && onClose()} width="narrow">
      <form onSubmit={submit} className="flex min-h-full flex-col">
        <div className="flex items-center gap-3 border-b border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-brand"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
          </button>
          <h2 className="text-19 font-bold tracking-tight text-gray-900">Edit profile</h2>
        </div>

        <div className="flex flex-1 flex-col gap-4 px-6 py-6">
          {FIELDS.slice(0, 3).map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label htmlFor={field.id} className="text-15 font-semibold text-gray-900">
                {field.label}
              </label>
              <input
                id={field.id}
                type="text"
                value={draft[field.id]}
                onChange={(event) => set(field.id, event.target.value)}
                placeholder={field.placeholder}
                className="h-[52px] rounded-14 border border-line bg-white px-4 text-15 text-gray-900 outline-none focus:border-brand"
              />
              {field.hint && <span className="text-13 text-ink-muted">{field.hint}</span>}
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-15 font-semibold text-gray-900">
              About you
            </label>
            <Textarea
              id="bio"
              value={draft.bio}
              onChange={(event) => set('bio', event.target.value)}
              rows={4}
              placeholder="Weekend hiker, slow reader, always up for a sunrise walk."
              className="rounded-14 border-line text-15"
            />
          </div>

          <div aria-hidden="true" className="-mx-6 h-px bg-surface-muted" />

          <p className="text-15 font-semibold text-gray-900">Where else to find you</p>

          {FIELDS.slice(3).map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label htmlFor={field.id} className="text-13 font-medium text-ink-muted">
                {field.label}
              </label>
              <input
                id={field.id}
                type="url"
                value={draft[field.id]}
                onChange={(event) => set(field.id, event.target.value)}
                placeholder={field.placeholder}
                className="h-12 rounded-14 border border-line bg-white px-4 text-15 text-gray-900 outline-none focus:border-brand"
              />
            </div>
          ))}

          {error && (
            <p role="alert" className="text-13 text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          <Button type="button" variant="ghost" onClick={onClose} className="text-danger">
            Cancel
          </Button>
          <Button type="submit" variant="lime" isLoading={isPending} className="rounded-full px-6">
            Save profile
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
