'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';

/**
 * What claiming a place actually means, before the form asks for anything.
 *
 * "Claim" on its own reads as claiming a reward, so this names the audience,
 * what it unlocks and what it takes. Everything listed here is something the
 * product does today — reservations, the listing in Control Center, ownership
 * sitting with a community rather than a person.
 */
const WHAT_YOU_GET: { icon: string; title: string; detail: string }[] = [
  {
    icon: 'Calendar03Icon',
    title: 'Take reservations',
    detail: 'Open your tables to everyone browsing Tukai, and accept or decline each request.',
  },
  {
    icon: 'ChartLineData01Icon',
    title: 'Manage it from Control Center',
    detail: 'The listing joins Your Places, alongside the experiences your community runs.',
  },
  {
    icon: 'UserMultipleIcon',
    title: 'Own it as a community',
    detail: 'Ownership sits with a community you run, so your whole team can manage it.',
  },
];

export const ClaimPlacePrompt = ({
  placeId,
  placeName,
}: {
  placeId: string;
  placeName: string;
}) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-bold text-gray-900">Claim {placeName}</h2>
      <p className="mt-1 text-sm text-gray-500">
        Nobody has claimed this place yet. If you own or manage it, claiming connects it to your
        community on Tukai.
      </p>
    </div>

    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {WHAT_YOU_GET.map((item) => (
        <li key={item.title} className="col-span-1">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
              <IconComponent
                iconName={item.icon}
                size={18}
                color="currentColor"
                className="text-primary"
              />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-500">{item.detail}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>

    {/* Said plainly here rather than discovered on the form */}
    <div className="flex items-start gap-3 rounded-2xl bg-surface p-5">
      <IconComponent
        iconName="InformationCircleIcon"
        size={22}
        color="currentColor"
        className="mt-0.5 flex-shrink-0 text-brand"
      />
      <p className="text-[15px] leading-relaxed text-ink">
        You will need a published community you run, and documents showing you own or manage the
        business such as a licence, a certificate of incorporation, or similar. A claim is reviewed
        before it goes live.
      </p>
    </div>

    {/* Sized to itself and left-aligned: it is one way on from here, not the
        only thing the section is for */}
    <Button asChild variant="lime" className="h-12 w-fit rounded-full px-6 text-[15px] font-bold">
      <Link href={`/places/claim?placeId=${placeId}`}>
        <IconComponent iconName="StoreVerified01Icon" size={20} color="currentColor" />
        Start claim
      </Link>
    </Button>
  </div>
);
