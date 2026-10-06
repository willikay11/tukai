'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';

/**
 * The claim prompt as the place drawer draws it: a 19px heading, three feature
 * items, a note on what a claim takes, and a lime button.
 *
 * The place page has its own ClaimPlacePrompt. This copy is the drawer's, so
 * the drawer's type and spacing can follow its design without changing that
 * page.
 */
const WHAT_YOU_GET: { icon: string; title: string; detail: string }[] = [
  {
    icon: 'Calendar03Icon',
    title: 'Take reservations',
    detail: 'Open bookings to everyone browsing Tukai, and accept or decline each request.',
  },
  {
    icon: 'ChartLineData01Icon',
    title: 'Manage it from Control center',
    detail: 'The listing joins Your places, alongside the experiences your community runs.',
  },
  {
    icon: 'UserMultipleIcon',
    title: 'Own it as a community',
    detail: 'Ownership sits with a community you run, so your whole team can manage it.',
  },
];

export const PlaceClaimSection = ({
  placeId,
  placeName,
}: {
  placeId: string;
  placeName: string;
}) => (
  <div className="flex flex-col gap-[18px]">
    <div>
      <h3 className="text-19 font-bold text-gray-800">Claim {placeName}</h3>
      <p className="mt-1.5 text-sm leading-[1.45] text-ink-muted">
        Nobody has claimed this place yet. If you own or manage it, claiming connects it to your
        community on Tukai.
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

    {/* Said plainly here rather than discovered on the form */}
    <div className="flex items-start gap-2.5 rounded-xl bg-surface px-3.5 py-3">
      <IconComponent
        iconName="InformationCircleIcon"
        size={19}
        color="currentColor"
        className="mt-px flex-shrink-0 text-brand"
      />
      <p className="text-sm leading-[1.5] text-gray-800">
        You will need a published community you run, and documents showing you own or manage the
        business such as a licence, a certificate of incorporation, or similar. A claim is reviewed
        before it goes live.
      </p>
    </div>

    {/* Sized to itself and left-aligned: it is one way on from here, not the
        only thing the section is for */}
    <Button
      asChild
      variant="lime"
      className="h-11 w-fit rounded-full pl-4 pr-5 text-[15px] font-medium shadow-lime-glow"
    >
      <Link href={`/places/claim?placeId=${placeId}`}>
        <IconComponent iconName="StoreVerified01Icon" size={19} color="currentColor" />
        Start claim
      </Link>
    </Button>
  </div>
);
