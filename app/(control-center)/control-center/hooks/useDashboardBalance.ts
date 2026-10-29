import { useMemo } from 'react';

import { useEarningsSummary } from '@/app/(experiences)/hooks/usePayment';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { Experience } from '@/types/experience';
import { HostEarningsSummary, payoutAmount } from '@/types/payment';
import { formatCurrencyAmount } from '@/utils/money';

import { isActive, isHostedBy, toAmount } from '../utils/control-center-metrics';

/**
 * The Dashboard card's balance rows. Available/Pending/Total are real
 * (`useEarningsSummary`). "Tickets on sale" has no backend field - the
 * handoff itself calls its sample value fixed and not part of the total -
 * so this approximates it from the host's own active, paid experiences'
 * remaining inventory x price. See the Dashboard backend-gaps note.
 */
export const useDashboardBalance = (userId: string | undefined) => {
  const { data: earningsResponse, isLoading: isLoadingEarnings } = useEarningsSummary();
  const summary: HostEarningsSummary | null = earningsResponse?.data ?? null;

  const { data: experiencesResponse, isLoading: isLoadingExperiences } = useExperiences(
    { page: 1, page_size: 100, hosted_by: userId },
    Boolean(userId),
  );
  const activeExperiences: Experience[] = useMemo(
    () =>
      (experiencesResponse?.data?.results ?? []).filter(
        (experience: Experience) => isHostedBy(experience, userId) && isActive(experience),
      ),
    [experiencesResponse, userId],
  );

  const ticketsOnSale = activeExperiences.reduce((sum, experience) => {
    if (experience.isPaid === false) return sum;
    const remaining = Number(experience.ticketsAvailable) || 0;
    return sum + remaining * toAmount(experience.priceStartsFrom);
  }, 0);

  return {
    isLoading: isLoadingEarnings || isLoadingExperiences,
    totalLabel: formatCurrencyAmount(summary?.currentBalance, 'KES'),
    balances: [
      { label: 'Available', value: formatCurrencyAmount(summary?.availableBalance, 'KES') },
      { label: 'Pending', value: formatCurrencyAmount(summary?.pendingBalance, 'KES') },
      { label: 'Tickets on sale', value: formatCurrencyAmount(ticketsOnSale, 'KES') },
    ],
    // Raw figures, for the Withdraw drawer
    availableBalance: summary?.availableBalance ?? '0',
    pendingBalance: payoutAmount(summary?.pendingBalance),
  };
};
