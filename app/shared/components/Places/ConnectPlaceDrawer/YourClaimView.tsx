'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';
import { Claim, ClaimStatus } from '@/types/claim';
import { placePath } from '@/utils/detail-paths';

import { OWNERSHIP_DOCUMENT_TYPES } from './documentTypes';
import { joinPlaceNames } from './useConnectPlaceDrawer';

const STATUS_CONFIG: Record<
  ClaimStatus,
  { title: string; icon: string; surfaceClassName: string; textClassName: string }
> = {
  review: {
    title: 'Under review',
    icon: 'HourglassIcon',
    surfaceClassName: 'bg-warn-surface',
    textClassName: 'text-warn',
  },
  more: {
    title: 'Needs more documents',
    icon: 'InformationCircleIcon',
    surfaceClassName: 'bg-warn-surface',
    textClassName: 'text-warn',
  },
  rejected: {
    title: 'Not approved',
    icon: 'CancelCircleIcon',
    surfaceClassName: 'bg-danger-surface',
    textClassName: 'text-danger-deep',
  },
  approved: {
    title: 'Approved',
    icon: 'CheckmarkBadge01Icon',
    surfaceClassName: 'bg-surface-brand',
    textClassName: 'text-brand',
  },
  cancelled: {
    title: 'Cancelled',
    icon: 'CancelCircleIcon',
    surfaceClassName: 'bg-surface',
    textClassName: 'text-ink',
  },
};

const statusLine = (claim: Claim) => {
  const places = joinPlaceNames(claim.places.map((place) => place.title));

  switch (claim.status) {
    case 'review':
      return `Tukai usually reviews claims within 2 working days. Nothing changes on ${places} until it's approved.`;
    case 'more':
      return claim.reviewNote || 'Tukai needs another document before it can approve this claim.';
    case 'rejected':
      return claim.reviewNote || "Tukai couldn't confirm that your community owns this place.";
    case 'approved':
      return `${claim.communityName} now runs ${places}. Set up reservations to start taking bookings.`;
    case 'cancelled':
      return 'You cancelled this claim.';
    default:
      return '';
  }
};

export const YourClaimView = ({
  claim,
  onCancelClaim,
}: {
  claim: Claim;
  onCancelClaim: () => void;
}) => {
  const status = STATUS_CONFIG[claim.status];
  const canCancel = claim.status === 'review' || claim.status === 'more';

  return (
    <div className="flex flex-col gap-6">
      <div className={cn('flex items-start gap-3 rounded-xl p-4', status.surfaceClassName)}>
        <IconComponent
          iconName={status.icon}
          size={22}
          color="currentColor"
          className={cn('mt-0.5 flex-shrink-0', status.textClassName)}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className={cn('text-lg font-bold', status.textClassName)}>{status.title}</h2>
          <p className="text-[14.5px] leading-relaxed text-gray-800">{statusLine(claim)}</p>
        </div>
      </div>

      <section className="flex flex-col gap-3" aria-label="Places in this claim">
        <span className="text-[13px] font-semibold text-ink-muted">Places in this claim</span>

        {claim.places.map((place) => (
          <div key={place.id} className="flex flex-wrap items-center gap-2.5">
            <div className="flex min-w-[220px] flex-1 items-center gap-3">
              <span className="relative block h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
                <PhotoImage src={place.photo} alt="" fill className="object-cover" fallbackIconSize={16} />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[15.5px] font-semibold text-gray-800">{place.title}</span>
                {place.locality && <span className="text-[13.5px] text-ink-muted">{place.locality}</span>}
              </div>
            </div>

            {claim.status === 'approved' && place.isOnTukai && (
              <Link
                href={placePath(place)}
                className="inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-full bg-surface-brand px-4 text-sm font-semibold text-brand hover:bg-surface-tab"
              >
                <IconComponent iconName="Settings02Icon" size={18} color="currentColor" />
                Set up reservations
              </Link>
            )}

            {place.isOnTukai && (
              <Link
                href={placePath(place)}
                aria-label={`Open ${place.title}`}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-brand hover:bg-surface-brand"
              >
                <IconComponent iconName="ArrowUpRight01Icon" size={18} color="currentColor" />
              </Link>
            )}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2.5" aria-label="Owned by">
        <span className="text-[13px] font-semibold text-ink-muted">Community that owns it</span>
        <div className="flex items-center gap-3">
          <span className="relative block h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-surface-brand">
            <PhotoImage src={claim.communityPhoto} alt="" fill className="object-cover" fallbackIconSize={14} />
          </span>
          <span className="text-[15.5px] font-semibold text-gray-800">{claim.communityName}</span>
        </div>
      </section>

      {claim.documents.length > 0 && (
        <section className="flex flex-col gap-2.5" aria-label="Documents">
          <span className="text-[13px] font-semibold text-ink-muted">Documents</span>
          {claim.documents.map((document) => (
            <div key={document.id} className="flex min-h-14 items-center gap-3 rounded-xl bg-surface px-3.5 py-2">
              <IconComponent iconName="Copy01Icon" size={20} color="currentColor" className="flex-shrink-0 text-brand" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[14.5px] font-semibold text-gray-800">
                  {OWNERSHIP_DOCUMENT_TYPES.find((type) => type.value === document.documentType)?.label ??
                    document.documentType}
                </span>
                <span className="truncate text-[13px] text-ink-muted">{document.fileName}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {claim.notes && (
        <section className="flex flex-col gap-1.5" aria-label="Notes">
          <span className="text-[13px] font-semibold text-ink-muted">Notes</span>
          <p className="text-[14.5px] leading-relaxed text-gray-800">{claim.notes}</p>
        </section>
      )}

      <p className="text-13 text-ink-muted">
        Sent{' '}
        {new Date(claim.sentAt).toLocaleString(undefined, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </p>

      {canCancel && (
        <button
          type="button"
          onClick={onCancelClaim}
          className="-mt-2.5 inline-flex h-11 w-fit items-center gap-2 pr-3 text-[14.5px] font-semibold text-danger hover:underline"
        >
          <IconComponent iconName="CancelCircleIcon" size={18} color="currentColor" />
          Cancel claim
        </button>
      )}
    </div>
  );
};
