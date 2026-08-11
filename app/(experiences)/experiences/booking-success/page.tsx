'use client';

import { Suspense, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { PaymentStatusBadge } from '@/app/(experiences)/experiences/components/PaymentStatusBadge';
import { IconComponent } from '@/app/shared/components/Icons';
import { Share } from '@/app/shared/components/Share';
import { Button } from '@/components/ui/button';
import { formatBookingDateTime, formatPaidAt } from '@/utils/date-utils';

interface BookingConfirmation {
  reference: string;
  confirmationPhone: string;
  experience: {
    title: string;
    thumbnail: string;
    // ISO date; times are display strings as the confirmation presents them
    date: string;
    startTime: string;
    endTime: string;
  };
  lineItems: Array<{
    label: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  sentVia: string;
  paidAt: string;
  // Keyed to PaymentStatusBadge's status map
  status: string;
}

// TODO: replace with real confirmation data when the API exists. Everything on
// the page reads from this one object, so the swap is a single fetch.
const HARDCODED_CONFIRMATION: BookingConfirmation = {
  reference: 'TKI-750OLG4A',
  confirmationPhone: '+254 716 909 826',
  experience: {
    title: 'Ngong Hills Ridge',
    thumbnail: '/images/hikers-walking.webp',
    date: '2026-03-17',
    startTime: '6:00 AM',
    endTime: '12:00 PM',
  },
  lineItems: [
    { label: 'Locals', quantity: 2, unitPrice: 10000, lineTotal: 20000 },
    { label: 'Children', quantity: 1, unitPrice: 5000, lineTotal: 5000 },
  ],
  // Reconciled against lineItems (20,000 + 5,000)
  amountPaid: 25000,
  currency: 'Ksh.',
  paymentMethod: 'M-Pesa · Paystack',
  sentVia: 'WhatsApp · +254 716 909 826',
  paidAt: '2026-08-11T09:07:00',
  status: 'confirmed',
};

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
const CONFIRMATION_STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', dot: 'bg-primary', text: 'text-primary' },
};

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

  // The real Paystack reference arrives as ?ref= — prefer it over the
  // placeholder so the page already shows truthful data before the API exists
  const reference = searchParams.get('ref');
  const data: BookingConfirmation = {
    ...HARDCODED_CONFIRMATION,
    reference: reference || HARDCODED_CONFIRMATION.reference,
  };

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
            Your spot is locked in. We have sent a confirmation to {data.confirmationPhone}.
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
              <Image
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
            <DetailRow label="Payment method" value={data.paymentMethod} />
            <DetailRow label="Sent via" value={data.sentVia} />
            <DetailRow label="Paid on" value={formatPaidAt(data.paidAt)} />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <PaymentStatusBadge status={data.status} config={CONFIRMATION_STATUS_CONFIG} />
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
              Your tickets are in your Tukai account and on their way to {data.confirmationPhone} on
              WhatsApp. Show the QR code at the meeting point.
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
              onClick={() => window.open(buildGoogleCalendarUrl(data), '_blank', 'noopener,noreferrer')}
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
              link={`${process.env.NEXT_PUBLIC_APP_URL}/experiences/${
                searchParams.get('experienceId') ?? ''
              }`}
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
