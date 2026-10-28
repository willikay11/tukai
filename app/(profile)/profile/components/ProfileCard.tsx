'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';

import { profileCount, profileHandle, profileName, profileSocials, MyProfile } from '../profile';

const Stat = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    aria-label={`${value} ${label}`}
    className="flex min-h-[66px] min-w-0 flex-col items-start gap-0.5 bg-white px-[18px] py-3 text-left transition-colors enabled:cursor-pointer enabled:hover:bg-surface-stat-hover"
  >
    <span className="text-19 font-bold leading-[1.2] text-brand-ink">{value}</span>
    <span className="text-13 text-ink-muted">{label}</span>
  </button>
);

export const ProfileCard = ({
  profile,
  sessionName,
  sessionImage,
  followingDisplayName,
  attendedCount,
  onAttendedClick,
}: {
  profile?: MyProfile | null;
  sessionName?: string | null;
  sessionImage?: string | null;
  followingDisplayName?: string | null;
  attendedCount: number;
  onAttendedClick: () => void;
}) => {
  const name = profileName(profile, sessionName ?? 'You');
  const handle = profileHandle(profile) ?? (followingDisplayName ? `@${followingDisplayName}` : null);
  const picture = profile?.picture ?? sessionImage ?? undefined;
  const socials = profileSocials(profile);
  const since = profile?.dateCreated ? moment(profile.dateCreated).format('MMMM YYYY') : null;

  return (
    <aside aria-label="Profile" className="flex min-w-0 flex-[1_1_340px] flex-col gap-2 max-w-[380px]">
      <div className="flex flex-col gap-1.5 rounded-xl border-[0.5px] border-line-shell bg-shell p-1.5">
        <div className="overflow-hidden rounded-xl border-[0.5px] border-surface bg-white shadow-[0_0_4px_0_rgba(0,0,0,.12)]">
          <div className="flex flex-col gap-3.5 p-[18px]">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-full bg-surface-brand">
                <PhotoImage
                  src={picture}
                  alt={name}
                  fill
                  sizes="72px"
                  className="object-cover"
                  fallback={
                    <span className="flex h-full w-full items-center justify-center text-xl font-bold text-ink">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  }
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex min-w-0 items-center gap-1.5">
                  <h1 className="min-w-0 text-[21px] font-bold leading-[1.25] tracking-[-0.35px] text-brand-ink [text-wrap:balance]">
                    {name}
                  </h1>
                  {profile?.hasSubscribed && (
                    <span role="img" aria-label="Verified" className="flex-shrink-0 text-brand">
                      <IconComponent
                        iconName="CheckmarkBadge01Icon"
                        variant="bulk"
                        size={20}
                        color="currentColor"
                      />
                    </span>
                  )}
                </div>

                {handle && (
                  <p className="truncate text-sm text-ink-muted" title={handle}>
                    {handle}
                  </p>
                )}
              </div>
            </div>

            {profile?.bio && (
              <p className="text-[14.5px] leading-[1.55] text-gray-900">{profile.bio}</p>
            )}

            {since && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13.5px] leading-[1.4] text-ink-muted">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <IconComponent iconName="Calendar03Icon" size={16} color="currentColor" />
                  Since {since}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-px border-t border-surface-muted bg-surface-muted">
            <Stat label="Followers" value={String(profileCount(profile?.followersCount))} />
            <Stat label="Following" value={String(profileCount(profile?.followingCount))} />
            <Stat label="Attended" value={String(attendedCount)} onClick={onAttendedClick} />
          </div>
        </div>

        {socials.length > 0 && (
          <div className="-mt-1.5 grid grid-cols-3">
            {socials.map((social, index) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${name} on ${social.label}`}
                className={cn(
                  'flex h-[50px] items-center justify-center pt-1.5 text-gray-900 transition-colors hover:text-brand',
                  index > 0 && 'border-l border-surface-muted',
                )}
              >
                <IconComponent iconName={social.icon} size={20} color="currentColor" />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 px-1.5">
        <a
          href="/terms"
          className={cn(
            'h-11 rounded-full px-1.5 text-13 text-ink-muted transition-colors hover:text-brand-ink',
            'inline-flex items-center',
          )}
        >
          Terms of use
        </a>
        <span aria-hidden="true" className="h-3 w-px bg-line" />
        <a
          href="/privacy"
          className="inline-flex h-11 items-center rounded-full px-1.5 text-13 text-ink-muted transition-colors hover:text-brand-ink"
        >
          Privacy policy
        </a>
      </div>
    </aside>
  );
};
