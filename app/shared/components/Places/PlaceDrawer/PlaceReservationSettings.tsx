'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useReservationSettingsForm } from '@/app/shared/components/Places/ReservationSettings/useReservationSettingsForm';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Place } from '@/types/place';
import { PlaceAvailabilityRule, PlaceReservationProfile } from '@/types/placeReservation';
import { formatTimeTo12Hour } from '@/utils/date-utils';

import { ReservationSettingsForm } from './ReservationSettingsForm';
import { activeDays, openingHours, slotInterval } from './reservation-summary';

const hoursLabel = (hours: string): string => `${hours} ${hours === '1' ? 'hour' : 'hours'}`;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-2 border-t border-surface-muted py-[18px]">{children}</div>
);

const GridRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4 border-t border-surface-muted py-[18px]">
    {children}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[13px] font-semibold text-ink-muted">{children}</span>
);

const Value = ({ children }: { children: React.ReactNode }) => (
  <span className="text-base font-semibold text-brand-ink">{children}</span>
);

const Fact = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <Label>{label}</Label>
    <Value>{children}</Value>
  </div>
);

const STEPS = [
  { id: 'type', label: 'Reservation type', icon: 'CalendarAdd01Icon', isDisabled: false },
  { id: 'wallet', label: 'Wallet details', icon: 'Wallet02Icon', isDisabled: true },
] as const;

const STATUS_LINES: Record<string, (name: string) => string> = {
  active: (name) => `Live. Guests can send reservation requests to ${name}.`,
  paused: (name) => `Paused. Nobody can reserve ${name} at the moment.`,
  draft: (name) => `Not live yet. ${name} is set up but closed to guests.`,
};

// Deposit and entry fees - and so the wallet step they would need - have no
// backing fields on the API yet; see the reservation_settings_backend_gaps
// memory. Max party size and the answer-by window are built, but kept
// local-only for the same reason (no field to save them to).
export const PlaceReservationSettings = ({
  place,
  profile,
  rules,
  onClose,
}: {
  place: Place;
  profile?: PlaceReservationProfile;
  rules: PlaceAvailabilityRule[];
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'view' | 'edit'>(profile ? 'view' : 'edit');
  const { values, errors, errorSummary, localOnly, set, reset, submit, isSaving } =
    useReservationSettingsForm({
      placeId: place.id,
      profile,
      rules,
      placePhotos: place.photos,
    });

  const days = activeDays(rules);
  const hours = openingHours(rules);
  const interval = slotInterval(rules);
  const closeTime12 = rules[0]?.closeTime ? formatTimeTo12Hour(rules[0].closeTime.slice(0, 5)) : null;
  const status = profile?.status ?? 'draft';
  const locality = place.location?.city ?? place.location?.name;

  const cancel = () => {
    if (!profile) {
      onClose();
      return;
    }
    reset();
    setMode('view');
  };

  const save = () =>
    submit(() => {
      toast({
        title: 'Settings saved',
        description: `${place.title} takes reservation requests on the days and hours you set.`,
        variant: 'success',
      });
      reset();
      setMode('view');
    });

  return (
    <>
      <div className="flex-1 space-y-6 px-6 py-6">
        <p className="flex items-center gap-2 text-[13.5px] text-ink-muted">
          <IconComponent
            iconName="StoreVerified01Icon"
            size={17}
            color="currentColor"
            className="flex-shrink-0 text-brand"
          />
          {[place.title, locality].filter(Boolean).join(', ')}
        </p>

        {mode === 'edit' ? (
          <>
            <div
              role="tablist"
              aria-label="Steps"
              className="-mt-2 flex gap-2 overflow-x-auto [scrollbar-width:none]"
            >
              {STEPS.map((step) => {
                const isOn = step.id === 'type';

                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={isOn}
                    aria-disabled={step.isDisabled}
                    aria-describedby={step.isDisabled ? 'rs-wallet-tab-note' : undefined}
                    className={cn(
                      'inline-flex h-12 flex-none items-center gap-2 whitespace-nowrap rounded-full pl-4 pr-5 text-[14.5px] font-semibold',
                      isOn && 'bg-surface-brand text-brand',
                      !isOn && !step.isDisabled && 'bg-surface text-gray-800',
                      step.isDisabled && 'cursor-not-allowed bg-surface text-ink-subtle',
                    )}
                  >
                    <IconComponent iconName={step.icon} size={19} color="currentColor" />
                    {step.label}
                  </button>
                );
              })}
              <p id="rs-wallet-tab-note" className="sr-only">
                A wallet is only needed for a deposit or entry fees, which free reservations do not
                use.
              </p>
            </div>

            <ReservationSettingsForm
              values={values}
              errors={errors}
              errorSummary={errorSummary}
              set={set}
            />
          </>
        ) : (
          <div className="-mt-1.5 flex flex-col">
            {profile ? (
              <p
                className={cn(
                  'mb-[18px] flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm font-semibold leading-[1.45]',
                  status === 'active' ? 'bg-surface-brand text-brand' : 'bg-warn-surface text-warn',
                )}
              >
                <IconComponent
                  iconName={status === 'active' ? 'Tick02Icon' : 'InformationCircleIcon'}
                  size={17}
                  color="currentColor"
                  className="mt-0.5 flex-shrink-0"
                />
                {(STATUS_LINES[status] ?? STATUS_LINES.draft)(place.title)}
              </p>
            ) : (
              <p className="rounded-xl bg-surface px-3.5 py-3 text-sm leading-[1.45] text-gray-800">
                {place.title} is not open to reservations yet.
              </p>
            )}

            {profile && (
              <>
                <Row>
                  <Label>Reservation type and fees</Label>
                  <Value>Free reservation</Value>
                  <span className="text-sm text-ink-muted">Guests pay nothing to book</span>
                </Row>

                {(profile.seatingCapacity !== undefined || localOnly.partySize) && (
                  <GridRow>
                    {profile.seatingCapacity !== undefined && (
                      <Fact label="Total seating capacity">{profile.seatingCapacity} guests</Fact>
                    )}
                    {localOnly.partySize && (
                      <Fact label="Max party size per booking">{localOnly.partySize} guests</Fact>
                    )}
                  </GridRow>
                )}

                <Row>
                  <Label>Active days</Label>
                  {days.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {days.map((day) => (
                        <span
                          key={day}
                          className="inline-flex h-10 items-center rounded-full bg-surface px-4 text-sm text-gray-800"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-ink-muted">
                      No days are open for booking yet.
                    </span>
                  )}
                </Row>

                <GridRow>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Label>Opening hours</Label>
                    {hours ? (
                      <span className="flex items-center gap-2 text-base font-semibold text-brand-ink">
                        <IconComponent
                          iconName="Clock01Icon"
                          size={18}
                          color="currentColor"
                          className="flex-shrink-0 text-brand"
                        />
                        {hours}
                      </span>
                    ) : (
                      <span className="text-sm text-ink-muted">
                        {days.length > 0
                          ? 'They vary by day. Editing the settings sets one set of hours for every day.'
                          : 'Not set yet.'}
                      </span>
                    )}
                  </div>
                  <Fact label="Buffer between bookings">
                    {interval !== null ? `${interval} minutes` : 'No buffer'}
                  </Fact>
                  <Fact label="Requests expire">
                    {hoursLabel(localOnly.expiryHours)} before the booking time
                  </Fact>
                  {closeTime12 && <Fact label="No-shows">At closing time, {closeTime12}</Fact>}
                </GridRow>

                <Row>
                  <Label>Wallet details</Label>
                  <span className="text-sm leading-normal text-ink-muted">
                    Not needed for free reservations. You add one if you switch to a deposit or
                    entry fees.
                  </span>
                </Row>
              </>
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-30 flex items-center gap-2.5 border-t border-surface-muted bg-white px-6 pb-[calc(12px_+_env(safe-area-inset-bottom))] pt-3">
        {mode === 'edit' ? (
          <>
            <button
              type="button"
              onClick={cancel}
              className="h-12 px-1.5 text-[15px] font-medium text-danger hover:underline"
            >
              Cancel
            </button>
            <span className="flex-1" aria-hidden="true" />
            <Button
              type="button"
              variant="lime"
              isLoading={isSaving}
              onClick={save}
              className="h-12 rounded-full px-6 text-[15px] font-semibold"
            >
              Save changes
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="lime"
            onClick={() => setMode('edit')}
            className="ml-auto h-12 rounded-full px-6 text-[15px] font-semibold"
          >
            <IconComponent iconName="PencilEdit02Icon" size={20} color="currentColor" />
            Edit settings
          </Button>
        )}
      </div>
    </>
  );
};
