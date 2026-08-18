'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { Experience } from '@/types/experience';
import { inferUIExperienceType } from '@/utils/date-utils';
import { safeText } from '@/utils/safe-text-utils';

import { ManageExperienceMetrics } from '../../utils/manage-metrics';
import { SalesProgressDonut } from '../SalesProgressDonut';

interface AboutTabProps {
  experience: Experience;
  metrics: ManageExperienceMetrics;
}

const EXPERIENCE_TYPE_LABEL: Record<string, string> = {
  'one-time': 'One-Time/Day Experience',
  'multi-day': 'Multi-Day Experience',
  itinerary: 'Itinerary Experience',
  recurring: 'Recurring Experience',
  standard: 'One-Time/Day Experience',
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 last:border-b-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-right text-sm font-medium text-gray-900">{value}</span>
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-bold text-gray-900">{value}</span>
  </div>
);

export const AboutTab = ({ experience, metrics }: AboutTabProps) => {
  const start = experience.startDate ? moment(experience.startDate) : null;
  const end = experience.endDate ? moment(experience.endDate) : null;

  const dateValue = start?.isValid()
    ? [
        start.format('ddd D MMM YYYY'),
        end?.isValid() ? `${start.format('h:mm A')} — ${end.format('h:mm A')}` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '—';

  const badgeType = experience.recurrenceRule
    ? 'recurring'
    : inferUIExperienceType(
        experience.experienceType || 'standard',
        experience.startDate ?? null,
        experience.endDate ?? null,
      );

  const categories = experience.categories ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left — description, details, categories */}
      <div className="space-y-8 lg:col-span-2">
        <div>
          <h2 className="text-base font-bold text-gray-900">About this experience</h2>
          <div
            className="mt-3 text-sm leading-relaxed text-gray-600"
            dangerouslySetInnerHTML={{ __html: safeText(experience.description || '') }}
          />
        </div>

        <div>
          <DetailRow label="Date of the Experience" value={dateValue} />
          <DetailRow
            label="Free or Paid"
            value={experience.isPaid ? 'Paid Experience' : 'Free Experience'}
          />
          <DetailRow
            label="Experience Visibility"
            value={experience.isPublic ? 'Public (Everyone)' : 'Private (Invite only)'}
          />
          <DetailRow
            label="Experience Type"
            value={EXPERIENCE_TYPE_LABEL[badgeType] ?? 'One-Time/Day Experience'}
          />
        </div>

        {categories.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-gray-900">Categories</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-gray-100 px-4 py-2"
                >
                  {category.icon && (
                    <IconComponent
                      iconName={category.icon}
                      size={16}
                      color="currentColor"
                      className="text-gray-700"
                    />
                  )}
                  <p className="text-sm text-gray-700">{category.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          {/* Stays disabled. The cancel endpoint is reserved for clearing an
              unfinished draft ("Clear draft and start fresh"), so it must not
              be wired here — cancelling a live experience needs its own
              endpoint and its own rules about sold tickets. */}
          <button
            type="button"
            disabled
            title="Cancelling an experience is not available yet"
            className="text-sm font-semibold text-destructive disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel Experience
          </button>
        </div>
      </div>

      {/* Right — sales progress */}
      <div className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">Sales progress</h3>

        <div className="mt-2">
          <SalesProgressDonut
            sold={metrics.ticketsSold}
            total={metrics.ticketsTotal}
            percent={metrics.fillRatePercent}
          />
        </div>

        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <SummaryRow
            label="Gross revenue"
            value={`${experience.currency ?? 'Ksh.'} ${metrics.revenue.toLocaleString()}`}
          />
          <SummaryRow
            label="Days to go"
            value={metrics.daysToGo === null ? '—' : `${metrics.daysToGo} days`}
          />
          <SummaryRow label="Avg. daily sales" value={`+${metrics.averageDailySales} / day`} />
        </div>
      </div>
    </div>
  );
};
