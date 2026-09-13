'use client';

import { Suspense, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { PaymentStatusBadge } from '@/app/(experiences)/experiences/components/PaymentStatusBadge';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Share } from '@/app/shared/components/Share';
import {
  useExperienceTicketPurchases,
  useFetchSingleExperience,
  usePurchase,
} from '@/app/shared/hooks/useExperiences';
import { Button } from '@/components/ui/button';
import { TicketPurchase } from '@/types/ticket-purchase';
import { formatBookingDateTime, formatPaidAt } from '@/utils/date-utils';
import { experiencePath } from '@/utils/detail-paths';

import { BookingConfirmation, purchasesFromSameCheckout, toConfirmation } from './confirmation';

// Google Calendar wants UTC basic-format stamps: 20260317T060000Z
const toCalendarStamp = (date: string, displayTime: string): string => {
  const [clock, period] = displayTime.trim().split(/\s+/);
  const [rawHours, rawMinutes] = clock.split(':').map(Number);

  let hours = rawHours % 12;
  if (period?.toUpperCase() === 'PM') hours += 12;

  const stamp = new Date(`${date}T00:00:00Z`);
  stamp.setUTCHours(hours, rawMinutes || 0, 0, 0);

  return stamp
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
};

const buildGoogleCalendarUrl = ({ experience }: BookingConfirmation): string => {
  const start = toCalendarStamp(experience.date, experience.startTime);
  const end = toCalendarStamp(experience.date, experience.endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: experience.title,
    dates: `${start}/${end}`,
    details: 'Booked on Tukai',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// PaymentStatusBadge's default map has no 'confirmed' key, which would fall
// back to a grey badge — this is the override hook it exposes for exactly that
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-right text-sm font-medium text-gray-900">{value}</span>
  </div>
);

const BookingSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  // ?purchaseId is what this page runs on: the purchase names its own ticket,
  // occurrence and experience, so nothing else has to be passed along.
  //
  // ?experienceId is still honoured for links already in the wild — and for
  // the booking panel, which cannot send an id it does not have: the purchase
  // POST returns an order and payment details, never a purchase.
  const reference = searchParams.get('ref');
  const purchaseId = searchParams.get('purchaseId') ?? undefined;
  const experienceIdParam = searchParams.get('experienceId') ?? undefined;

  // GET /v1/experiences/purchases/{purchase_id}/
  const { data: purchaseResponse, isLoading: isLoadingPurchase } = usePurchase(purchaseId);
  const purchase: TicketPurchase | undefined = purchaseResponse?.data;

  // A purchase carries the experience's uuid on its ticket, so the id in the
  // URL is only needed when there is no purchase to read it from
  const experienceId = purchase?.ticket?.experience ?? experienceIdParam;

  const { data: experienceResponse } = useFetchSingleExperience(experienceId ?? '', true);
  const experience = experienceResponse?.data;

  // The rest of the checkout, for the other line items — one purchase is one
  // ticket, so a three-ticket booking is three rows
  const { data: purchasesResponse, isLoading: isLoadingPurchases } = useExperienceTicketPurchases(
    experienceId,
    Boolean(experienceId),
  );
  const purchases: TicketPurchase[] = purchasesResponse?.data?.results ?? [];

  const checkout = purchasesFromSameCheckout(purchases, reference, purchase);

  // The detail call is authoritative for the row it describes; the rest of the
  // checkout fills in the other line items
  const confirmed = purchase
    ? [purchase, ...checkout.filter((entry) => entry.id !== purchase.id)]
    : checkout;

  const data = toConfirmation(confirmed, experience, reference);
  const isLoading = isLoadingPurchase || isLoadingPurchases;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-8">
        <div className="h-[600px] animate-pulse rounded-3xl bg-gray-100" />
      </main>
    );
  }

  // The purchase is the page — without it there is nothing truthful to render
  if (!data) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-gray-500">
          We could not find this booking. Check your tickets in your account.
        </p>
        <Button asChild className="mt-4 rounded-full">
          <Link href="/experiences?tab=reserved">View my tickets</Link>
        </Button>
      </main>
    );
  }

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(data.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked by permissions — leave the label unchanged
    }
  };

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="overflow-hidden rounded-3xl shadow-sm">
        {/* Header */}
        <div className="bg-primary px-6 py-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime">
            <IconComponent
              iconName="Tick02Icon"
              size={26}
              color="currentColor"
              className="text-primary"
            />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-white">Payment successful</h1>
          <p className="mt-2 text-sm text-white/70">
            Your spot is locked in. Your tickets are in your Tukai account.
          </p>

          <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2">
            <span className="text-xs font-medium text-white/50">REF</span>
            <span className="text-sm font-semibold text-white">{data.reference}</span>
            <button
              type="button"
              onClick={handleCopyReference}
              className="text-xs font-medium text-lime hover:text-lime/80"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-5 bg-white px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
              <PhotoImage
                src={data.experience.thumbnail}
                alt={data.experience.title}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-gray-900">{data.experience.title}</p>
              <p className="text-sm text-gray-500">
                {formatBookingDateTime(
                  data.experience.date,
                  data.experience.startTime,
                  data.experience.endTime,
                )}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {data.lineItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400">
                    {item.quantity} × {data.currency} {item.unitPrice.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-900">
                  {data.currency} {item.lineTotal.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm font-bold text-gray-900">Amount paid</span>
            <span className="text-lg font-bold text-gray-900">
              {data.currency}{' '}
              {data.amountPaid.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="space-y-3">
            <DetailRow label="Paid on" value={formatPaidAt(data.paidAt)} />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              {/* No config override: the badge's own map already covers the
                  statuses purchases come back with (completed, pending,
                  expired…), where the override only knew the mock's
                  'confirmed' */}
              <PaymentStatusBadge status={data.status} className="bg-green-200 shadow-none" />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-gray-50 px-4 py-3">
            <IconComponent
              iconName="WhatsappIcon"
              size={16}
              color="currentColor"
              className="mt-0.5 flex-shrink-0 text-primary"
            />
            <p className="text-xs leading-relaxed text-gray-600">
              Your tickets are in your Tukai account. Show the QR code at the meeting point.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => router.push('/experiences?category=reserved')}
            variant="gradient"
            className="w-full rounded-full"
          >
            View my tickets
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() =>
                window.open(buildGoogleCalendarUrl(data), '_blank', 'noopener,noreferrer')
              }
              className="rounded-full"
              variant="outline"
            >
              <IconComponent iconName="Calendar03Icon" size={16} color="currentColor" />
              Add to calendar
            </Button>

            {/* Share brings its own outlined trigger button */}
            <Share
              coverPhoto={data.experience.thumbnail}
              title={data.experience.title}
              link={
                experience
                  ? `${process.env.NEXT_PUBLIC_APP_URL}${experiencePath(experience)}`
                  : `${process.env.NEXT_PUBLIC_APP_URL}/experiences`
              }
              kind="experience"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 space-y-2 text-center">
        <div className="flex items-center justify-center gap-3 text-sm">
          <Link href="/experiences" className="font-medium text-primary">
            Back to Explore
          </Link>
          <span className="text-gray-300">·</span>
          <Link href="/help" className="text-gray-400 hover:text-gray-600">
            Need help with this payment?
          </Link>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-xs text-gray-300">
          <IconComponent iconName="SquareLock01Icon" size={12} color="currentColor" />
          Processed securely by Paystack
        </p>
      </div>
    </main>
  );
};

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <BookingSuccessContent />
    </Suspense>
  );
}
