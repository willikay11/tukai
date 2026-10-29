'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { useConnectPlaceDrawer } from '@/context/ConnectPlaceDrawerContext';

/**
 * "Claim {place}" - shown only for an unclaimed place, on both the place page
 * and the place drawer. Used to be two near-duplicate copies
 * (ClaimPlacePrompt on the page, PlaceClaimSection in the drawer, per
 * docs/tasks/place-drawer/PD-14-claim.md); this is the one the handoff's
 * tk-claimcard / tk-claimst markup describes, now shared by both.
 *
 * Reads the mock claim store off ConnectPlaceDrawerContext to switch to the
 * "claim already open" status strip once the reader has started one.
 */
const WHAT_YOU_GET: { icon: string; title: string; detail: string }[] = [
  {
    icon: 'Calendar03Icon',
    title: 'Take reservations',
    detail: 'Open bookings to everyone browsing Tukai, and accept or decline each request.',
  },
  {
    icon: 'ChartLineData01Icon',
    title: 'Manage it from your Dashboard',
    detail: 'The listing joins Your places, alongside the experiences your community runs.',
  },
  {
    icon: 'UserMultipleIcon',
    title: 'Own it as a community',
    detail: 'Ownership sits with a community you run, so your whole team can manage it.',
  },
];

export const ClaimCard = ({ placeId, placeName }: { placeId: string; placeName: string }) => {
  const connectDrawer = useConnectPlaceDrawer();
  const claim = connectDrawer?.getClaimForPlace(placeId);

  if (claim) {
    const isMoreDocuments = claim.status === 'more';

    return (
      <div className="flex flex-col gap-3.5 rounded-xl bg-warn-surface p-[18px]">
        <div className="flex items-start gap-3">
          <IconComponent
            iconName={isMoreDocuments ? 'InformationCircleIcon' : 'HourglassIcon'}
            size={22}
            color="currentColor"
            className="mt-0.5 flex-shrink-0 text-warn"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="text-[17px] font-bold text-gray-800">
              {isMoreDocuments ? 'Tukai needs more documents' : 'Your claim is under review'}
            </h3>
            <p className="text-sm leading-relaxed text-[#5B4A2E]">
              Sent for {claim.communityName}. Tukai usually reviews claims within 2 working days,
              and nothing changes here until it&apos;s approved.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pl-[34px]">
          <button
            type="button"
            onClick={() => connectDrawer?.openConnectPlace({ claimId: claim.id })}
            className="inline-flex h-11 items-center rounded-full bg-white px-[18px] text-[14.5px] font-semibold text-warn hover:bg-white/70"
          >
            View claim
          </button>
          {isMoreDocuments && (
            <button
              type="button"
              onClick={() =>
                connectDrawer?.openConnectPlace({ claimId: claim.id, view: 'documents' })
              }
              className="inline-flex h-11 items-center px-3 text-[14.5px] font-semibold text-warn hover:underline"
            >
              Add documents
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <div>
        <h3 className="text-19 font-bold text-gray-800">Claim {placeName}</h3>
        <p className="mt-1.5 text-sm leading-[1.45] text-ink-muted">
          Nobody has claimed this place yet. If you own or manage it, claim it for a community you
          run.
        </p>
      </div>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-x-6 gap-y-5">
        {WHAT_YOU_GET.map((item) => (
          <li key={item.title} className="flex min-w-0 items-start gap-4">
            <IconComponent
              iconName={item.icon}
              size={22}
              color="currentColor"
              className="mt-px flex-shrink-0 text-brand"
            />
            <div className="flex min-w-0 flex-col gap-[3px]">
              <p className="text-[15px] font-semibold text-gray-800">{item.title}</p>
              <p className="text-[14.5px] leading-[1.45] text-ink-muted">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-start gap-2.5 rounded-xl bg-surface px-3.5 py-3">
        <IconComponent
          iconName="InformationCircleIcon"
          size={19}
          color="currentColor"
          className="mt-px flex-shrink-0 text-brand"
        />
        <p className="text-sm leading-[1.5] text-gray-800">
          You will need a published community you run, and documents showing you own or manage the
          business such as a licence, a certificate of incorporation, or similar. A claim is
          reviewed before it goes live.
        </p>
      </div>

      <Button
        type="button"
        variant="lime"
        onClick={() => connectDrawer?.openConnectPlace({ placeId })}
        className="h-11 w-fit rounded-full pl-4 pr-5 text-[15px] font-medium shadow-lime-glow"
      >
        <IconComponent iconName="StoreVerified01Icon" size={19} color="currentColor" />
        Start claim
      </Button>
    </div>
  );
};
