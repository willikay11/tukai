'use client';

import { useSession } from 'next-auth/react';

import { ChoosePlanView } from '@/app/shared/components/Hosting/HostingPlanDrawer/ChoosePlanView';
import { PageContainer } from '@/app/shared/components/Layout';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { useHostingPlan } from '@/context/HostingPlanContext';
import { HostingPlanId } from '@/types/hostingPlan';

/**
 * Plan cards only - the spec's "Pricing page" is a creator-plan buttons
 * page, not a full marketing page (hero/FAQ/comparison), so this reuses
 * ChoosePlanView rather than building a page of its own.
 */
export const PricingPageContent = () => {
  const { data: session } = useSession();
  const hostingPlan = useHostingPlan();
  const { openSignInWithCallback } = useAuthDialog();

  if (!hostingPlan) return null;

  const { plans, currentPlan, hasActivePlan, openHostingPlanFlow } = hostingPlan;

  const handleChoose = (planId: HostingPlanId) => {
    const open = () => openHostingPlanFlow({ view: 'choose', planId });

    if (session?.user?.id) {
      open();
      return;
    }

    openSignInWithCallback(open);
  };

  return (
    <PageContainer className="space-y-8 py-10" variant="detail">
      <ChoosePlanView
        plans={plans}
        currentPlanId={currentPlan.planId}
        isChangeMode={hasActivePlan}
        onChoose={handleChoose}
      />
    </PageContainer>
  );
};
