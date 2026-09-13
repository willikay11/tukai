'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Button } from '@/components/ui/button';

const SummaryRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <IconComponent
      iconName={icon}
      size={18}
      color="currentColor"
      className="mt-0.5 flex-shrink-0 text-gray-400"
    />
    <div className="min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

export const ReservationSummary = ({
  placeName,
  placeMeta,
  coverPhoto,
  selectedDate,
  selectedTime,
  partySize,
  isSubmitting,
  onSubmit,
}: {
  placeName: string;
  placeMeta: string;
  coverPhoto?: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  partySize: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}) => {
  const whenValue = selectedDate
    ? `${moment(selectedDate).format('ddd D MMM')} · ${selectedTime ?? 'pick a time'}`
    : 'Pick a date';

  return (
    <div className="space-y-5 rounded-3xl bg-gray-50 p-5">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-200">
          <PhotoImage src={coverPhoto} alt={placeName} fill sizes="48px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold text-gray-900">{placeName}</p>
          {placeMeta && <p className="truncate text-sm text-gray-500">{placeMeta}</p>}
        </div>
      </div>

      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        Free to request
      </span>

      <div className="h-px bg-gray-200" />

      <div className="space-y-4">
        <SummaryRow icon="SparklesIcon" label="Reservation" value="Table reservation" />
        <SummaryRow icon="Calendar03Icon" label="When" value={whenValue} />
        <SummaryRow
          icon="UserGroupIcon"
          label="Guests"
          value={`${partySize} ${partySize === 1 ? 'guest' : 'guests'}`}
        />
      </div>

      <div className="h-px bg-gray-200" />

      {/* Live even when the form is incomplete: pressing it is how the reader
          finds out what is still missing, marked on the section that asks for
          it rather than hidden behind a disabled button */}
      <Button
        variant="gradient"
        onClick={onSubmit}
        className="w-full rounded-full"
        isLoading={isSubmitting}
      >
        Request Reservation
      </Button>

      {/* ⚠️ The design shows a deposit taken up front. The API cannot support
          that: no deposit amount exists on a place or its reservation profile,
          and its own pay endpoint is documented as "Pay for an ACCEPTED booking
          request" — so payment can only follow the venue's acceptance. */}
      <p className="flex items-start gap-2 text-xs text-gray-400">
        <IconComponent
          iconName="InformationCircleIcon"
          size={14}
          color="currentColor"
          className="mt-0.5 flex-shrink-0"
        />
        {placeName} confirms your table first. Nothing is charged to request it.
      </p>
    </div>
  );
};
