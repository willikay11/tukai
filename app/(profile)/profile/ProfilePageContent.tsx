'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { PageContainer } from '@/app/shared/components/Layout';
import { useMyProfile } from '@/app/shared/hooks/useAuth';
import { Button } from '@/components/ui/button';

import { EditProfileDrawer } from './components/EditProfileDrawer';
import {
  MyProfile,
  interestName,
  profileCount,
  profileHandle,
  profileName,
  profileSocials,
} from './profile';

/** Where the rest of a reader's own things live. */
const SHORTCUTS = [
  { label: 'My plans', href: '/plans', icon: 'MapsIcon' },
  { label: 'Bucket lists', href: '/bucket-lists', icon: 'ShoppingBasket01Icon' },
  {
    label: 'My communities',
    href: '/communities?category=my-communities',
    icon: 'UserMultipleIcon',
  },
  { label: 'Control Center', href: '/control-center', icon: 'Analytics01Icon' },
];

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-start gap-0.5 bg-white px-4 py-3">
    <span className="text-19 font-bold leading-tight text-brand-ink">{value}</span>
    <span className="text-13 text-ink-muted">{label}</span>
  </div>
);

/**
 * A reader's own profile.
 *
 * ⚠️ The profile menu has linked here since it was built, and there was no page
 * — only an `api/route.ts` beside it — so "My Profile" answered with a 404.
 *
 * Everything shown comes off `GET /accounts/users/{id}/`. The picture is
 * read-only on that serializer, so it is shown and not editable here; the
 * canvas's cover photo has no field at all, so the header uses the brand ground
 * rather than inventing one.
 */
export const ProfilePageContent = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: response, isLoading } = useMyProfile(userId);
  const profile: MyProfile | undefined = response?.success ? response.data : undefined;

  if (status === 'loading' || (userId && isLoading)) {
    return (
      <PageContainer className="py-6">
        <div className="h-40 animate-pulse rounded-3xl bg-gray-100" />
      </PageContainer>
    );
  }

  if (!userId) {
    return (
      <PageContainer className="py-16 text-center">
        <p className="text-sm text-gray-500">Sign in to see your profile.</p>
        <Link href="/auth/sign-in" className="mt-4 inline-flex">
          <Button className="rounded-full px-6">Sign in</Button>
        </Link>
      </PageContainer>
    );
  }

  // The session carries a name and picture even where the profile request
  // failed, so the page is still worth showing
  const name = profileName(profile, session?.user?.name ?? 'You');
  const handle =
    profileHandle(profile) ?? (session?.user?.displayName ? `@${session.user.displayName}` : null);
  const picture = profile?.picture ?? session?.user?.image ?? undefined;
  const socials = profileSocials(profile);
  const interests = profile?.interests ?? [];

  return (
    <PageContainer className="space-y-6 py-6">
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="h-24 bg-surface-brand" />

        <div className="px-5 pb-5">
          <div className="-mt-11 flex items-end justify-between gap-4">
            <div className="relative h-[88px] w-[88px] overflow-hidden rounded-full border-4 border-white bg-surface-brand">
              <PhotoImage
                src={picture}
                alt={name}
                fill
                sizes="88px"
                className="object-cover"
                fallback={
                  <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-ink">
                    {name.charAt(0).toUpperCase()}
                  </span>
                }
              />
            </div>

            <Button
              type="button"
              variant="lime"
              onClick={() => setIsEditOpen(true)}
              className="rounded-full px-5"
            >
              <span className="flex items-center gap-2">
                <IconComponent iconName="PencilEdit02Icon" size={16} color="currentColor" />
                Edit profile
              </span>
            </Button>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <h1 className="text-[22px] font-bold leading-tight tracking-tight text-brand-ink">
              {name}
            </h1>
            {profile?.hasSubscribed && (
              <IconComponent
                iconName="CheckmarkBadge01Icon"
                variant="solid"
                size={20}
                color="currentColor"
                className="flex-shrink-0 text-brand"
              />
            )}
          </div>

          {handle && <p className="mt-0.5 text-sm text-ink-muted">{handle}</p>}

          {profile?.bio && (
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-gray-900">{profile.bio}</p>
          )}

          {profile?.dateCreated && (
            <p className="mt-3 flex items-center gap-1.5 text-13 text-ink-muted">
              <IconComponent iconName="Calendar03Icon" size={16} color="currentColor" />
              On Tukai since {moment(profile.dateCreated).format('MMMM YYYY')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-px bg-surface-muted">
          <Stat label="Followers" value={String(profileCount(profile?.followersCount))} />
          <Stat label="Following" value={String(profileCount(profile?.followingCount))} />
          <Stat label="Interests" value={String(interests.length)} />
        </div>
      </section>

      {socials.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-gray-900">Where else to find you</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {socials.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-surface px-4 text-sm font-medium text-gray-900 transition-colors hover:bg-surface-brand"
              >
                <IconComponent iconName={social.icon} size={18} color="currentColor" />
                {social.label}
              </a>
            ))}
          </div>
        </section>
      )}

      {interests.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-gray-900">What you are into</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest.id}
                className="rounded-full bg-surface px-4 py-2 text-sm text-gray-900"
              >
                {interestName(interest)}
              </span>
            ))}
          </div>
          <Link
            href="/auth/interests"
            className="mt-2 inline-flex text-13 font-medium text-brand hover:underline"
          >
            Change your interests
          </Link>
        </section>
      )}

      <section>
        <h2 className="text-base font-bold text-gray-900">Yours</h2>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SHORTCUTS.map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 transition-colors hover:bg-surface/60"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface text-brand">
                <IconComponent iconName={shortcut.icon} size={18} color="currentColor" />
              </span>
              <span className="flex-1 text-sm font-medium text-gray-900">{shortcut.label}</span>
              <IconComponent
                iconName="ArrowRight01Icon"
                size={18}
                color="currentColor"
                className="text-ink-subtle"
              />
            </Link>
          ))}
        </div>
      </section>

      {!profile && (
        <p className="text-13 text-ink-subtle">
          Some of your profile could not be loaded. What is shown comes from this session.
        </p>
      )}

      <EditProfileDrawer
        profile={profile}
        userId={userId}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </PageContainer>
  );
};
