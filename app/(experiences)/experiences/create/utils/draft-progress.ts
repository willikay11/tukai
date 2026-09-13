import { Status } from '@/enums/status';
import { Experience } from '@/types/experience';
import { inferUIExperienceType } from '@/utils/date-utils';

export type DraftStepState = 'done' | 'current' | 'pending';

export interface DraftStep {
  id: string;
  label: string;
  state: DraftStepState;
}

/**
 * Step ids and labels mirror the wizard's STEPS_* arrays so the resume
 * checklist names the same steps the creator is about to see.
 *
 * `wallet` is deliberately absent: wallet completion is a property of the USER
 * (they have a saved wallet), not of the draft, so it cannot be derived from a
 * fetched experience without claiming every draft has it done.
 */
const BASE_STEPS: Array<{ id: string; label: string }> = [
  { id: 'dates-type', label: 'Dates & Type' },
  { id: 'about', label: 'About' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'guests', label: 'Invite Guests' },
  { id: 'preview', label: 'Preview' },
];

const ITINERARY_STEP = { id: 'itinerary-days', label: 'Itinerary' };

// The wizard's own predicates read live form state, which does not exist on the
// resume screen. These are the same rules expressed against a saved draft.
const isStepComplete = (step: string, experience: Experience): boolean => {
  switch (step) {
    // A saved draft always belongs to a community — it could not have been
    // created otherwise
    case 'dates-type':
      return true;
    case 'about':
      return Boolean(
        experience.title?.trim() &&
        experience.description?.trim() &&
        experience.location &&
        (experience.photos?.length ?? 0) > 0,
      );
    case 'itinerary-days':
      return Boolean(experience.startDate && experience.endDate);
    case 'tickets':
      return (experience.tickets?.length ?? 0) > 0;
    case 'guests':
      return (experience.guests?.length ?? 0) > 0;
    // Preview is a read-only view — reachable as soon as there is a title
    case 'preview':
      return Boolean(experience.title?.trim());
    default:
      return false;
  }
};

export const buildDraftSteps = (experience: Experience): DraftStep[] => {
  const isItinerary =
    experience.experienceType === 'itinerary' ||
    inferUIExperienceType(
      experience.experienceType || 'standard',
      experience.startDate ?? null,
      experience.endDate ?? null,
    ) === 'itinerary';

  // Itinerary experiences carry an extra step, so the checklist length varies
  const steps = isItinerary
    ? [BASE_STEPS[0], BASE_STEPS[1], ITINERARY_STEP, ...BASE_STEPS.slice(2)]
    : BASE_STEPS;

  const completion = steps.map((step) => isStepComplete(step.id, experience));
  const currentIndex = completion.indexOf(false);

  // Progress reads sequentially: everything up to the first gap is done, that
  // gap is where the creator resumes, and the rest is pending. A later step
  // that happens to be filled (Preview needs only a title) must not show as
  // done ahead of the gap — the checklist would read out of order.
  return steps.map((step, index) => ({
    ...step,
    state:
      currentIndex === -1 || index < currentIndex
        ? 'done'
        : index === currentIndex
          ? 'current'
          : 'pending',
  }));
};

// `date_updated` is not on every response; fall back so sorting and the
// "last saved" label always have something to read
export const getLastSavedAt = (experience: Experience): string =>
  experience.dateUpdated || experience.dateCreated;

/**
 * Drafts are selected client-side rather than with a `status` query param.
 * The list endpoint's status filter is unverified — nothing else in the app
 * uses it — whereas `hosted_by` alone is the proven call the Hosting tab makes.
 * The API returns statuses lowercase while the enum is uppercase, so this
 * normalizes before comparing (same rule as HostingCard).
 */
export const selectDrafts = (experiences: Experience[]): Experience[] =>
  experiences.filter((experience) => String(experience.status).toUpperCase() === Status.Draft);

export const pickLatestDraft = (drafts: Experience[]): Experience | null => {
  if (drafts.length === 0) return null;

  return [...drafts].sort(
    (a, b) => new Date(getLastSavedAt(b)).getTime() - new Date(getLastSavedAt(a)).getTime(),
  )[0];
};
