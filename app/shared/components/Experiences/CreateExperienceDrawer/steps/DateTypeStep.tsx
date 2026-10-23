'use client';

import { useMemo } from 'react';

import { addDays, format, isValid, parseISO } from 'date-fns';

import type { useCreateExperienceFlow } from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
import { DateField, TimeField } from '@/app/shared/components/Forms';
import { IconComponent } from '@/app/shared/components/Icons';
import { useCreateCommunityDrawer } from '@/context/CreateCommunityDrawerContext';

type Flow = ReturnType<typeof useCreateExperienceFlow>;

interface DateTypeStepProps {
  flow: Flow;
  hasOwnedCommunity: boolean;
}

const DAYS: { value: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'; label: string }[] = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
];

const TypePill = ({
  active,
  onClick,
  children,
  note,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  note?: React.ReactNode;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={active}
    onClick={onClick}
    className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-[22px] text-left text-15 font-medium active:scale-[0.98] ${
      active
        ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
        : 'bg-surface text-gray-800'
    }`}
  >
    {children}
    {note && <span className={active ? 'text-[#D5ECE1]' : 'text-ink-muted'}>{note}</span>}
  </button>
);

/**
 * Step 1: Date & type (tk-step__sec / tk-step__dates in create-experience.css).
 * Host community, paid/free, visibility, experience type and - depending on
 * that type - the recurring switch or multi-day ticket mode, then the
 * date/time fields themselves.
 *
 * Visibility and ticket mode live in the About and Tickets form slices
 * respectively (not Date & type) in `useCreateExperienceFlow` - only the
 * handoff's *screen* groups them here, so this reads/writes those slices
 * directly rather than moving the data.
 *
 * Itinerary's "flexible dates" (day-count + booking-period, no fixed
 * calendar dates) has no field in `FormData['dateType']` yet - only specific
 * dates are modeled - so this step only offers specific dates for itinerary
 * experiences. See the create-experience-drawer-backend-gaps memory file.
 */
export const DateTypeStep = ({ flow, hasOwnedCommunity }: DateTypeStepProps) => {
  const createCommunityDrawer = useCreateCommunityDrawer();
  const { dateType: formData, about, tickets } = flow.formData;
  const errors = flow.dateTypeErrors;
  const update = flow.updateFormData;

  const today = useMemo(() => new Date(), []);

  const recurrenceFirstDate = useMemo(() => {
    if (!formData.recurrenceStartDate || formData.recurringDays.length === 0) return null;
    const start = parseISO(formData.recurrenceStartDate);
    if (!isValid(start)) return null;
    const dayIndexMap: Record<string, number> = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };
    const wanted = new Set(formData.recurringDays.map((d) => dayIndexMap[d]));
    for (let i = 0; i < 14; i += 1) {
      const candidate = addDays(start, i);
      if (wanted.has(candidate.getDay())) {
        const end = formData.recurrenceEndDate ? parseISO(formData.recurrenceEndDate) : null;
        if (end && isValid(end) && candidate > end) return null;
        return candidate;
      }
    }
    return null;
  }, [formData.recurrenceStartDate, formData.recurrenceEndDate, formData.recurringDays]);

  const itineraryOrMultiDayStart =
    formData.experienceType === 'multi-day' ? formData.multiDayStartDate : formData.itineraryStartDate;
  const itineraryOrMultiDayEnd =
    formData.experienceType === 'multi-day' ? formData.multiDayEndDate : formData.itineraryEndDate;
  const endMinDate =
    itineraryOrMultiDayStart && isValid(parseISO(itineraryOrMultiDayStart))
      ? addDays(parseISO(itineraryOrMultiDayStart), 1)
      : today;

  return (
    <div className="flex flex-col gap-7">
      <h2 className="text-22 font-bold leading-tight tracking-[-0.3px] text-gray-800">
        Add the date and type of the experience
      </h2>

      <section className="-mt-2.5 flex flex-col gap-3">
        <span className="text-15 font-semibold text-gray-800">Select host community</span>

        {hasOwnedCommunity ? (
          <>
            <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Host community">
              {flow.communitiesForSelector.map((community) => (
                <button
                  key={community.id}
                  type="button"
                  role="radio"
                  aria-checked={formData.community?.id === community.id}
                  onClick={() =>
                    update({
                      community: { id: community.id, name: community.name, imageUrl: community.imageUrl },
                    })
                  }
                  className={`inline-flex max-w-full items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-5 text-15 font-medium active:scale-[0.98] ${
                    formData.community?.id === community.id
                      ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                      : 'bg-surface text-gray-800'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={community.imageUrl}
                    alt=""
                    className="h-10 w-10 flex-shrink-0 rounded-full bg-surface-brand object-cover"
                  />
                  <span className="min-w-0 truncate">{community.name}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => createCommunityDrawer?.openCreateCommunity()}
              className="inline-flex min-h-11 items-center gap-2 self-start text-15 font-semibold text-brand hover:underline"
            >
              <IconComponent iconName="UserGroupIcon" size={20} color="#066349" />
              Create a community
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2.5 px-1 pb-2 pt-7 text-center">
            <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-800">
              No communities... yet!
            </h3>
            <p className="max-w-[40ch] text-[15.5px] leading-relaxed text-gray-800">
              You don&rsquo;t have a community yet. To create an experience, start by creating one.
            </p>
            <button
              type="button"
              onClick={() => createCommunityDrawer?.openCreateCommunity()}
              className="mt-1.5 h-14 rounded-full bg-lime px-9 text-base font-semibold text-brand-ink hover:bg-lime-dark"
            >
              Create community
            </button>
          </div>
        )}
      </section>

      <div className="-mx-6 h-px bg-gray-200" aria-hidden="true" />

      <div
        aria-disabled={!hasOwnedCommunity}
        className={
          hasOwnedCommunity
            ? 'flex flex-col gap-[26px]'
            : 'pointer-events-none flex flex-col gap-[26px] opacity-45'
        }
      >
        <div className="flex flex-col gap-3">
          <span className="text-15 font-semibold text-gray-800">
            Is this a free or paid experience?
          </span>
          <div className="flex flex-wrap gap-2.5" role="radiogroup">
            <TypePill
              active={formData.experiencePricing === 'paid'}
              onClick={() => update({ experiencePricing: 'paid' })}
            >
              Paid experience
            </TypePill>
            <TypePill
              active={formData.experiencePricing === 'free'}
              onClick={() => update({ experiencePricing: 'free' })}
            >
              Free experience
            </TypePill>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-15 font-semibold text-gray-800">
            Experience visibility{' '}
            <span className="font-normal text-ink-muted">(who can see and book it)</span>
          </span>
          <div className="flex flex-wrap gap-2.5" role="radiogroup">
            <TypePill
              active={about.visibility !== 'private'}
              onClick={() => flow.updateAboutFormData({ visibility: 'public' })}
              note="(Everyone)"
            >
              Public
            </TypePill>
            <TypePill
              active={about.visibility === 'private'}
              onClick={() => flow.updateAboutFormData({ visibility: 'private' })}
              note="(Only invited people)"
            >
              Private
            </TypePill>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-15 font-semibold text-gray-800">Experience type</span>
          <div className="flex flex-wrap gap-2.5" role="radiogroup">
            <TypePill
              active={formData.experienceType === 'one-time'}
              onClick={() => update({ experienceType: 'one-time' })}
            >
              One-time, single day
            </TypePill>
            <TypePill
              active={formData.experienceType === 'itinerary'}
              onClick={() => update({ experienceType: 'itinerary' })}
            >
              Itinerary
            </TypePill>
            <TypePill
              active={formData.experienceType === 'multi-day'}
              onClick={() => update({ experienceType: 'multi-day' })}
              note="(e.g. 2 days straight)"
            >
              Multi-day
            </TypePill>
          </div>

          {formData.experienceType === 'one-time' && (
            <button
              type="button"
              role="switch"
              aria-checked={formData.isRecurring}
              onClick={() => update({ isRecurring: !formData.isRecurring })}
              className="inline-flex min-h-11 items-center gap-3.5 self-start text-15 text-gray-800"
            >
              <span
                className={`relative h-8 w-14 flex-shrink-0 rounded-full transition-colors ${
                  formData.isRecurring ? 'bg-brand' : 'bg-line'
                }`}
              >
                <span
                  className={`absolute top-[3px] h-[26px] w-[26px] rounded-full bg-white shadow-[0_1px_3px_rgba(1,51,52,.3)] transition-all ${
                    formData.isRecurring ? 'left-[27px]' : 'left-[3px]'
                  }`}
                />
              </span>
              Make this a recurring experience
            </button>
          )}

          {formData.experienceType === 'one-time' && formData.isRecurring && (
            <div className="mt-1.5 flex flex-col gap-2.5">
              <span className="flex flex-col gap-0.5">
                <span className="text-15 font-semibold text-gray-800">
                  Select the days the experience will recur
                </span>
                <span className="text-sm text-ink-muted">You can select more than one.</span>
              </span>
              <div className="flex flex-wrap gap-2.5" role="group">
                {DAYS.map((day) => {
                  const isSelected = formData.recurringDays.includes(day.value);
                  return (
                    <TypePill
                      key={day.value}
                      active={isSelected}
                      onClick={() =>
                        update({
                          recurringDays: isSelected
                            ? formData.recurringDays.filter((d) => d !== day.value)
                            : [...formData.recurringDays, day.value],
                        })
                      }
                    >
                      {day.label}
                    </TypePill>
                  );
                })}
              </div>
            </div>
          )}

          {formData.experienceType === 'itinerary' && (
            <p className="rounded-xl bg-surface-brand px-4 py-3 text-[14.5px] leading-relaxed text-brand-ink">
              An itinerary visits several places over one or more days. You plan each day and its
              places in the Itinerary step.
            </p>
          )}

          {formData.experienceType === 'multi-day' && (
            <div className="mt-1 flex flex-col gap-2.5">
              <span className="text-sm text-ink-muted">How are tickets sold?</span>
              <div className="flex flex-wrap gap-2.5" role="radiogroup">
                <TypePill
                  active={tickets.ticketMode !== 'each-day'}
                  onClick={() => flow.updateTicketsFormData({ ticketMode: 'entire-period' })}
                >
                  One ticket for all days
                </TypePill>
                <TypePill
                  active={tickets.ticketMode === 'each-day'}
                  onClick={() => flow.updateTicketsFormData({ ticketMode: 'each-day' })}
                >
                  A ticket for each day
                </TypePill>
              </div>
            </div>
          )}
        </div>

        <div className="-mx-6 h-px bg-gray-200" aria-hidden="true" />

        <div className="flex flex-col gap-3.5">
          {formData.experienceType === 'one-time' && !formData.isRecurring && (
            <>
              <span className="text-15 font-semibold text-gray-800">
                Add the experience date and time
              </span>
              <DateField
                label="Date"
                value={formData.date}
                onChange={(value) => update({ date: value })}
                minDate={today}
                error={errors.date}
              />
              <div className="grid grid-cols-2 gap-3">
                <TimeField
                  label="Start time"
                  value={formData.startTime}
                  onChange={(value) => update({ startTime: value })}
                  error={errors.startTime}
                />
                <TimeField
                  label="End time"
                  value={formData.endTime}
                  onChange={(value) => update({ endTime: value })}
                  afterTime={formData.startTime}
                  error={errors.endTime}
                />
              </div>
            </>
          )}

          {(formData.experienceType === 'multi-day' || formData.experienceType === 'itinerary') && (
            <>
              <span className="text-15 font-semibold text-gray-800">Add the experience dates</span>
              <div className="grid grid-cols-2 gap-3">
                <DateField
                  label="Start date"
                  value={itineraryOrMultiDayStart}
                  onChange={(value) =>
                    update(
                      formData.experienceType === 'multi-day'
                        ? { multiDayStartDate: value }
                        : { itineraryStartDate: value },
                    )
                  }
                  minDate={today}
                  error={errors.multiDayStartDate ?? errors.itineraryStartDate}
                />
                {formData.experienceType === 'multi-day' && (
                  <TimeField
                    label="Start time"
                    value={formData.multiDayStartTime}
                    onChange={(value) => update({ multiDayStartTime: value })}
                  />
                )}
                <DateField
                  label="End date"
                  value={itineraryOrMultiDayEnd}
                  onChange={(value) =>
                    update(
                      formData.experienceType === 'multi-day'
                        ? { multiDayEndDate: value }
                        : { itineraryEndDate: value },
                    )
                  }
                  minDate={endMinDate}
                  error={errors.multiDayEndDate ?? errors.itineraryEndDate}
                />
                {formData.experienceType === 'multi-day' && (
                  <TimeField
                    label="End time"
                    value={formData.multiDayEndTime}
                    onChange={(value) => update({ multiDayEndTime: value })}
                  />
                )}
              </div>
            </>
          )}

          {formData.experienceType === 'one-time' && formData.isRecurring && (
            <>
              <span className="text-15 font-semibold text-gray-800">
                Add the recurrence start and end date{' '}
                <span className="font-normal text-ink-muted">(active period)</span>
              </span>
              <div className="grid grid-cols-2 gap-3">
                <DateField
                  label="Start date"
                  value={formData.recurrenceStartDate}
                  onChange={(value) => update({ recurrenceStartDate: value })}
                  minDate={today}
                />
                <DateField
                  label="End date"
                  value={formData.recurrenceEndDate}
                  onChange={(value) => update({ recurrenceEndDate: value })}
                  minDate={today}
                />
              </div>
              <div className="rounded-xl border-[1.5px] border-dashed border-line bg-[#F7F8F7] px-4 py-3 text-[14.5px] leading-relaxed text-gray-800">
                {formData.recurringDays.length === 0 ? (
                  'Select the days above to see when it starts.'
                ) : recurrenceFirstDate ? (
                  <>
                    Your first experience will be on{' '}
                    <strong className="font-semibold">
                      {format(recurrenceFirstDate, 'EEEE d MMMM')}
                    </strong>
                    .
                  </>
                ) : (
                  'None of the selected days fall between these dates.'
                )}
              </div>

              <span className="mt-1.5 text-15 font-semibold text-gray-800">
                Recurrence time slots
              </span>
              {formData.timeSlots.map((slot, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="grid flex-1 grid-cols-2 gap-3">
                    <TimeField
                      label="Start time"
                      value={slot.startTime}
                      onChange={(value) => {
                        const next = [...formData.timeSlots];
                        next[index] = { ...slot, startTime: value };
                        update({ timeSlots: next });
                      }}
                    />
                    <TimeField
                      label="End time"
                      value={slot.endTime}
                      onChange={(value) => {
                        const next = [...formData.timeSlots];
                        next[index] = { ...slot, endTime: value };
                        update({ timeSlots: next });
                      }}
                      afterTime={slot.startTime}
                    />
                  </div>
                  {formData.timeSlots.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remove time slot ${index + 1}`}
                      onClick={() =>
                        update({ timeSlots: formData.timeSlots.filter((_, i) => i !== index) })
                      }
                      className="flex h-14 w-11 flex-shrink-0 items-center justify-center rounded-xl text-danger hover:bg-[#FDE8E8]"
                    >
                      <IconComponent iconName="Delete02Icon" size={22} color="currentColor" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  update({ timeSlots: [...formData.timeSlots, { startTime: null, endTime: null }] })
                }
                className="inline-flex min-h-11 items-center gap-2 self-start text-15 font-semibold text-brand hover:underline"
              >
                <IconComponent iconName="Clock02Icon" size={20} color="#066349" />
                Add another time slot
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
