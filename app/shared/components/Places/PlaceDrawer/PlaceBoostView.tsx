'use client';

import { useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { IconComponent } from '@/app/shared/components/Icons';
import { useBoostPackages, usePlaceBoosts } from '@/app/shared/hooks/usePlaces';
import { toast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Paystack } from '@/components/ui/paystack';
import { cn } from '@/lib/utils';
import { buyPlaceBoost, fetchPlaceBoosts } from '@/services/place';
import { Place } from '@/types/place';
import { BoostPackage, boostDay, boostStateOf } from '@/types/placeBoost';
import { formatCurrencyAmount } from '@/utils/money';

const CONFIRM_TRIES = 6;
const CONFIRM_EVERY_MS = 2000;

const PackageCard = ({
  pkg,
  isOn,
  onPick,
}: {
  pkg: BoostPackage;
  isOn: boolean;
  onPick: () => void;
}) => (
  <label
    className={cn(
      'flex min-h-[72px] cursor-pointer items-center gap-3.5 rounded-xl px-4 py-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand',
      isOn ? 'bg-surface-brand' : 'bg-surface',
    )}
  >
    <input type="radio" name="boost-package" checked={isOn} onChange={onPick} className="sr-only" />
    <span
      aria-hidden="true"
      className={cn(
        'flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border-2',
        isOn ? 'border-brand' : 'border-ink-subtle',
      )}
    >
      <span className={cn('h-2.5 w-2.5 rounded-full', isOn && 'bg-brand')} />
    </span>
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-15 font-semibold text-gray-800">{pkg.name}</span>
      <span className="text-[13.5px] text-ink-muted">
        {pkg.durationDays} {pkg.durationDays === 1 ? 'day' : 'days'}
        {pkg.description ? ` · ${pkg.description}` : ''}
      </span>
    </span>
    <span className="flex-none text-15 font-bold text-brand-ink">
      {formatCurrencyAmount(pkg.price)}
    </span>
  </label>
);

/**
 * Boosting a place (DEV-392): the place ranks first in place listings and
 * search for the package's days. A manager picks a package and pays on
 * Paystack's checkout, here in the drawer; one bought while a boost runs
 * starts when it ends.
 */
export const PlaceBoostView = ({ place, onDone }: { place: Place; onDone: () => void }) => {
  const queryClient = useQueryClient();
  const { data: packages = [], isLoading: isLoadingPackages } = useBoostPackages();
  const { data: boosts = [] } = usePlaceBoosts(place.id);
  const state = boostStateOf(boosts);

  const [pickedId, setPickedId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  // One key per boost attempt, so a double press doesn't buy two
  const attemptKey = useRef<string | null>(null);
  const boughtId = useRef<string | null>(null);

  const picked = packages.find((pkg) => pkg.id === pickedId) ?? packages[0];
  const isPublished = String(place.status ?? '').toLowerCase() === 'published';

  const start = async () => {
    if (!picked || isStarting) return;
    setIsStarting(true);
    attemptKey.current ??= `boost-${place.id}-${Date.now().toString(36)}`;
    try {
      const { boost, checkoutUrl: url } = await buyPlaceBoost(
        place.id,
        picked.id,
        attemptKey.current,
      );
      if (!url) throw new Error('Paystack did not start the payment. Try again.');
      boughtId.current = boost?.id ?? null;
      setCheckoutUrl(url);
    } catch (error) {
      attemptKey.current = null;
      toast({
        title: 'The boost could not be started',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsStarting(false);
    }
  };

  // Paystack says it's paid; the boost turns paid once Tukai hears from
  // Paystack too, so it's read back a few times
  const confirm = async () => {
    setIsConfirming(true);
    for (let attempt = 0; attempt < CONFIRM_TRIES; attempt += 1) {
      const latest = await fetchPlaceBoosts(place.id).catch(() => []);
      const bought = latest.find((boost) => boost.id === boughtId.current);
      if (bought?.status === 'paid') {
        queryClient.setQueryData(['placeBoosts', place.id], latest);
        toast({
          title: `${place.title} is boosted`,
          description:
            bought.startsAt && bought.endsAt
              ? `It shows first from ${boostDay(bought.startsAt)} to ${boostDay(bought.endsAt)}.`
              : 'It shows first in listings and search.',
          variant: 'success',
        });
        onDone();
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, CONFIRM_EVERY_MS));
    }
    void queryClient.invalidateQueries({ queryKey: ['placeBoosts', place.id] });
    setIsConfirming(false);
    setCheckoutUrl(null);
    attemptKey.current = null;
    toast({
      description: 'Payment received. The boost starts as soon as Paystack confirms it.',
    });
    onDone();
  };

  const onPaymentResult = (paid: boolean) => {
    if (paid) void confirm();
    else {
      setCheckoutUrl(null);
      attemptKey.current = null;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-6">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[19px] font-bold tracking-[-0.2px] text-gray-800">
          Boost {place.title}
        </h3>
        <p className="text-sm leading-snug text-ink-muted">
          It shows first in place listings and search for as long as the boost runs. You pay once;
          nothing renews.
        </p>
      </div>

      {state.live && state.boostedUntil && (
        <p className="flex items-start gap-2 rounded-xl bg-surface-brand px-3.5 py-3 text-sm font-semibold text-brand">
          <IconComponent
            iconName="Tick02Icon"
            size={17}
            color="currentColor"
            className="mt-0.5 flex-shrink-0"
          />
          <span>
            Boosted until {boostDay(state.boostedUntil)}.
            {state.queued.length > 0 ? ' Another boost is lined up after this one.' : ''}{' '}
            <span className="font-normal">A new one starts when this one ends.</span>
          </span>
        </p>
      )}

      {!isPublished ? (
        <p className="rounded-xl bg-warn-surface px-3.5 py-3 text-sm leading-[1.45] text-warn">
          Publish {place.title} before boosting it.
        </p>
      ) : isConfirming ? (
        <p className="rounded-xl bg-surface px-3.5 py-3 text-sm text-gray-800">
          Confirming your payment with Paystack. This takes a few seconds.
        </p>
      ) : checkoutUrl ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-muted">
            Pay {picked ? formatCurrencyAmount(picked.price) : ''} with M-Pesa or card on
            Paystack&rsquo;s secure checkout below.
          </p>
          <div
            aria-label="Paystack checkout"
            className="overflow-hidden rounded-xl border border-line"
          >
            <Paystack url={checkoutUrl} onPaymentSuccess={onPaymentResult} />
          </div>
          <button
            type="button"
            onClick={() => onPaymentResult(false)}
            className="self-start text-sm font-semibold text-ink-muted hover:text-gray-800"
          >
            Choose another boost
          </button>
        </div>
      ) : isLoadingPackages ? (
        <div aria-label="Loading boosts" className="h-36 animate-pulse rounded-xl bg-surface" />
      ) : packages.length === 0 ? (
        <p className="text-sm text-ink-muted">No boosts are on offer right now.</p>
      ) : (
        <>
          <div role="radiogroup" aria-label="Boost" className="flex flex-col gap-2">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                isOn={picked?.id === pkg.id}
                onPick={() => setPickedId(pkg.id)}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="lime"
            isLoading={isStarting}
            onClick={() => void start()}
            className="h-12 rounded-full px-6 text-[15px] font-semibold"
          >
            Pay {picked ? formatCurrencyAmount(picked.price) : ''}
          </Button>
        </>
      )}
    </div>
  );
};
