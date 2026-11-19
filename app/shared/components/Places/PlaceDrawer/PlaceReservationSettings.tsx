'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { isPaidReservation } from '@/app/shared/components/Places/ReservationSettings/schemas';
import { useReservationSettingsForm } from '@/app/shared/components/Places/ReservationSettings/useReservationSettingsForm';
import { usePlaceReservationProfile } from '@/app/shared/hooks/usePlaces';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Place } from '@/types/place';
import { PlaceAvailabilityRule, PlaceReservationProfile } from '@/types/placeReservation';

import { PAYMENT_TYPES, ReservationSettingsForm, hoursLabel } from './ReservationSettingsForm';
import { ReservationWallet, WalletLines } from './ReservationWallet';
import { activeDays, openingHours, slotInterval } from './reservation-summary';

const money = (amount: { amount: string; currency: string }) =>
  `${amount.currency} ${Number(amount.amount).toLocaleString('en-KE')}`;

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
  { id: 'type', label: 'Reservation type', icon: 'CalendarAdd01Icon' },
  { id: 'wallet', label: 'Wallet details', icon: 'Wallet02Icon' },
] as const;

type Step = (typeof STEPS)[number]['id'];

const STATUS_LINES: Record<string, (name: string) => string> = {
  active: (name) => `Live. Guests can send reservation requests to ${name}.`,
  paused: (name) => `Paused. Nobody can reserve ${name} at the moment.`,
  draft: (name) => `Not live yet. ${name} is set up but closed to guests.`,
};

const NO_WALLET_LINE = 'Not live yet. Add your wallet details so guests can pay.';

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
  const [step, setStep] = useState<Step>('type');
  const { values, errors, errorSummary, currency, set, reset, validate, submit, isSaving } =
    useReservationSettingsForm({
      placeId: place.id,
      profile,
      rules,
      placePhotos: place.photos,
    });

  // Where the money goes is only on the single read (DEV-450)
  const {
    data: detail,
    isLoading: isWalletLoading,
    refetch: refetchWallet,
  } = usePlaceReservationProfile(place.id, profile?.id);
  const payoutAccount = detail?.payoutAccount;
  const hasWallet = (payoutAccount?.wallets.length ?? 0) > 0;

  const isPaidDraft = isPaidReservation(values.paymentType);
  const savedPaymentType = profile?.paymentType ?? 'free';
  const isPaidSaved = isPaidReservation(savedPaymentType);

  const days = activeDays(rules);
  const hours = openingHours(rules);
  const interval = slotInterval(rules);
  const status = profile?.status ?? 'draft';
  const locality = place.location?.city ?? place.location?.name;

  const cancel = () => {
    if (!profile) {
      onClose();
      return;
    }
    reset();
    setStep('type');
    setMode('view');
  };

  const save = (next: 'view' | 'wallet') =>
    submit(() => {
      toast({
        title: 'Settings saved',
        description: `${place.title} takes reservation requests on the days and hours you set.`,
        variant: 'success',
      });
      reset();
      if (next === 'wallet') {
        setStep('wallet');
        return;
      }
      setStep('type');
      setMode('view');
    });

  // The wallet step is only for paid types, and only once the type step is
  // complete - trying it early shows what is missing, as the save would
  const openStep = (target: Step) => {
    if (target === step) return;
    if (target === 'wallet' && (!isPaidDraft || !validate())) return;
    setStep(target);
  };

  const statusLine =
    isPaidSaved && !isWalletLoading && !hasWallet
      ? NO_WALLET_LINE
      : (STATUS_LINES[status] ?? STATUS_LINES.draft)(place.title);
  const isLive = status === 'active' && statusLine !== NO_WALLET_LINE;
  const savedType =
    PAYMENT_TYPES.find((type) => type.value === savedPaymentType) ?? PAYMENT_TYPES[0];

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
              {STEPS.map((entry) => {
                const isOn = entry.id === step;
                const isDisabled = entry.id === 'wallet' && !isPaidDraft;

                return (
                  <button
                    key={entry.id}
                    type="button"
                    role="tab"
                    aria-selected={isOn}
                    aria-disabled={isDisabled}
                    aria-describedby={isDisabled ? 'rs-wallet-tab-note' : undefined}
                    onClick={() => !isDisabled && openStep(entry.id)}
                    className={cn(
                      'inline-flex h-12 flex-none items-center gap-2 whitespace-nowrap rounded-full pl-4 pr-5 text-[14.5px] font-semibold',
                      isOn && 'bg-surface-brand text-brand',
                      !isOn && !isDisabled && 'bg-surface text-gray-800',
                      isDisabled && 'cursor-not-allowed bg-surface text-ink-subtle',
                    )}
                  >
                    <IconComponent iconName={entry.icon} size={19} color="currentColor" />
                    {entry.label}
                  </button>
                );
              })}
              <p id="rs-wallet-tab-note" className="sr-only">
                A wallet is only needed for a deposit or entry fees, which free reservations do not
                use.
              </p>
            </div>

            {step === 'wallet' ? (
              <ReservationWallet
                placeTitle={place.title}
                payoutAccount={payoutAccount}
                isLoading={Boolean(profile) && isWalletLoading}
                onChanged={() => refetchWallet()}
              />
            ) : (
              <ReservationSettingsForm
                values={values}
                errors={errors}
                errorSummary={errorSummary}
                currency={currency}
                set={set}
              />
            )}
          </>
        ) : (
          <div className="-mt-1.5 flex flex-col">
            {profile ? (
              <p
                className={cn(
                  'mb-[18px] flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm font-semibold leading-[1.45]',
                  isLive ? 'bg-surface-brand text-brand' : 'bg-warn-surface text-warn',
                )}
              >
                <IconComponent
                  iconName={isLive ? 'Tick02Icon' : 'InformationCircleIcon'}
                  size={17}
                  color="currentColor"
                  className="mt-0.5 flex-shrink-0"
                />
                {statusLine}
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
                  <Value>{savedType.label}</Value>
                  <span className="text-sm text-ink-muted">
                    {savedPaymentType === 'deposit' && profile.depositAmount
                      ? `${money(profile.depositAmount)} per guest, paid once you accept and taken off the final bill`
                      : savedPaymentType === 'entry_fee'
                        ? 'Per person by guest type, paid once you accept'
                        : 'Guests pay nothing to book'}
                  </span>
                  {savedPaymentType === 'entry_fee' && (profile.entryFees?.length ?? 0) > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {profile.entryFees!.map((fee) => (
                        <span
                          key={fee.id ?? fee.guestType}
                          className="inline-flex flex-col gap-px rounded-xl bg-surface px-4 py-2.5 text-sm text-gray-800"
                        >
                          <span className="font-semibold">{fee.guestType}</span>
                          <span className="text-[13px] text-ink-muted">{money(fee.price)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </Row>

                {(profile.seatingCapacity || profile.maxPartySize) && (
                  <GridRow>
                    {profile.seatingCapacity ? (
                      <Fact label="Total seating capacity">{profile.seatingCapacity} guests</Fact>
                    ) : null}
                    {profile.maxPartySize ? (
                      <Fact label="Max party size per booking">{profile.maxPartySize} guests</Fact>
                    ) : null}
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
                    {hoursLabel(values.respondWithinHours)} after they come in
                  </Fact>
                  {isPaidSaved && (
                    <Fact label="Time to pay">
                      {hoursLabel(values.payWithinHours)} after you accept
                    </Fact>
                  )}
                  <Fact label="No-shows">Marked by you, once a booking&apos;s time has passed</Fact>
                </GridRow>

                <Row>
                  <Label>Wallet details</Label>
                  {!isPaidSaved ? (
                    <span className="text-sm leading-normal text-ink-muted">
                      Not needed for free reservations. You add one if you switch to a deposit or
                      entry fees.
                    </span>
                  ) : hasWallet ? (
                    <WalletLines wallets={payoutAccount!.wallets} />
                  ) : (
                    <span className="text-sm leading-normal text-ink-muted">
                      {isWalletLoading ? 'Loading…' : 'No payout method yet.'}
                    </span>
                  )}
                </Row>
              </>
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-30 flex items-center gap-2.5 border-t border-surface-muted bg-white px-6 pb-[calc(12px_+_var(--drawer-inset-bottom,env(safe-area-inset-bottom)))] pt-3">
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
            {step === 'type' && isPaidDraft ? (
              <Button
                type="button"
                variant="lime"
                isLoading={isSaving}
                onClick={() => save('wallet')}
                className="h-12 rounded-full px-6 text-[15px] font-semibold"
              >
                Save &amp; continue
              </Button>
            ) : (
              <Button
                type="button"
                variant="lime"
                isLoading={isSaving}
                onClick={() => save('view')}
                className="h-12 rounded-full px-6 text-[15px] font-semibold"
              >
                Save changes
              </Button>
            )}
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
