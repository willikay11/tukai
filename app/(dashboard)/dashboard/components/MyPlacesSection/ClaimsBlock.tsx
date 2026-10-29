'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';
import { Claim, ClaimStatus } from '@/types/claim';

const STATUS_STYLE: Record<ClaimStatus, { label: string; bg: string; fg: string }> = {
  review: { label: 'Under review', bg: 'bg-warn-surface', fg: 'text-warn' },
  more: { label: 'Needs more documents', bg: 'bg-warn-surface', fg: 'text-warn' },
  rejected: { label: 'Not approved', bg: 'bg-danger-surface', fg: 'text-danger-deep' },
  approved: { label: 'Approved', bg: 'bg-surface-brand', fg: 'text-brand' },
  cancelled: { label: 'Cancelled', bg: 'bg-surface', fg: 'text-ink-muted' },
};

/** Claims not yet approved, or approved in the last 7 days - see useDashboardPlaces. */
export const ClaimsBlock = ({
  claims,
  onOpenClaim,
}: {
  claims: Claim[];
  onOpenClaim: (claimId: string) => void;
}) => {
  if (claims.length === 0) return null;

  return (
    <div className="mt-3 flex min-w-0 flex-col gap-3">
      <h2 className="m-0 text-[17px] font-bold tracking-[-0.2px] text-brand-ink">Your claims</h2>

      <div className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(min(100%,360px),1fr))] items-start gap-x-3 gap-y-2">
        {claims.map((claim) => {
          const style = STATUS_STYLE[claim.status];
          const place = claim.places[0];

          return (
            <button
              key={claim.id}
              type="button"
              onClick={() => onOpenClaim(claim.id)}
              className="flex min-h-[72px] min-w-0 items-center gap-3.5 rounded-xl bg-surface py-2.5 pl-2.5 pr-3.5 text-left hover:bg-[#EDEFEC]"
            >
              {place?.photo ? (
                <span className="relative block h-[52px] w-[52px] flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
                  <PhotoImage src={place.photo} alt="" fill sizes="52px" className="object-cover" />
                </span>
              ) : (
                <span className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-xl bg-surface-brand text-brand">
                  <IconComponent iconName="StoreVerified01Icon" size={22} color="currentColor" />
                </span>
              )}

              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-[15px] font-semibold text-gray-900">
                  {claim.places.map((p) => p.title).join(', ') || claim.communityName}
                </span>
                <span className="text-[13.5px] text-ink-muted">For {claim.communityName}</span>
              </span>

              <span
                className={cn(
                  'flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold',
                  style.bg,
                  style.fg,
                )}
              >
                {style.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
