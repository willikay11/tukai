'use client';

import { useMemo } from 'react';

import { useRouter } from 'next/navigation';

import { useMyTransactions } from '@/app/(profile)/hooks';
import { useMyCalendar } from '@/app/(profile)/hooks/useMyCalendar';
import { WrittenReview } from '@/app/(profile)/hooks/useMyReviews';
import { useExperienceDrawer } from '@/context/ExperienceDrawerContext';

import { AccountBalanceCard } from './AccountBalanceCard';
import { MyCalendar } from './MyCalendar';
import { MyInterests } from './MyInterests';
import { RecentTransactions } from './RecentTransactions';

export const OverviewTab = ({
  userId,
  calendar,
  written,
  interests,
  onEditInterests,
}: {
  userId?: string | null;
  calendar: ReturnType<typeof useMyCalendar>;
  written: WrittenReview[];
  interests: { id: string; name?: string; title?: string }[];
  onEditInterests: () => void;
}) => {
  const router = useRouter();
  const experienceDrawer = useExperienceDrawer();
  const { transactions, balances } = useMyTransactions(userId);

  const writtenByExperienceId = useMemo(
    () => new Map(written.map((review) => [review.experienceId, review])),
    [written],
  );

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-7">
      <div className="flex min-w-0 flex-col gap-7">
        <AccountBalanceCard balances={balances} />

        <MyCalendar
          days={calendar.days}
          offset={calendar.offset}
          onSelectOffset={calendar.onSelectOffset}
          items={calendar.items}
          label={calendar.label}
          emptyLine={calendar.emptyLine}
          showToday={calendar.showToday}
          onToday={calendar.onToday}
          atStart={calendar.atStart}
          atEnd={calendar.atEnd}
          onPrev={calendar.onPrev}
          onNext={calendar.onNext}
          writtenByExperienceId={writtenByExperienceId}
          onOpenExperience={(experienceId) => experienceDrawer?.openExperience(experienceId)}
          onFindExperiences={() => router.push('/')}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-7">
        <MyInterests interests={interests} onEdit={onEditInterests} />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
};
