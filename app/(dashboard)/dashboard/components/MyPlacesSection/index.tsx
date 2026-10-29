'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';

import { useDashboardPlaces } from '../../hooks/useDashboardPlaces';
import { ClaimsBlock } from './ClaimsBlock';
import { PlaceCard } from './PlaceCard';

export const MyPlacesSection = ({ userId }: { userId: string | undefined }) => {
  const { places, claims, isLoading, onConnectPlace, onOpenClaim } = useDashboardPlaces(userId);
  const hasPlaces = places.length > 0;

  return (
    <section aria-label="My places" className="flex min-w-0 flex-col gap-3">
      <div>
        <h2 className="text-[17px] font-bold tracking-[-0.2px] text-brand-ink">My places</h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">
          {hasPlaces
            ? 'These are the places you own'
            : 'Earn and manage reservations by adding your place or business.'}
        </p>
      </div>

      {isLoading ? (
        <div className="h-[140px] w-full animate-pulse rounded-14 bg-gray-100" />
      ) : (
        hasPlaces && (
          <div className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(min(100%,360px),1fr))] items-start gap-x-3 gap-y-2">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )
      )}

      <ClaimsBlock claims={claims} onOpenClaim={onOpenClaim} />

      <Button
        type="button"
        variant="gradient"
        onClick={onConnectPlace}
        className="h-[52px] w-fit flex-shrink-0 gap-2 rounded-full pl-[22px] pr-7 text-[15.5px] font-semibold hover:brightness-[1.06]"
      >
        <IconComponent iconName="StoreVerified01Icon" size={20} color="currentColor" />
        Connect a place
      </Button>
    </section>
  );
};
