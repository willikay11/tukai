import { IconComponent } from '@/app/shared/components/Icons';
import { Experience } from '@/types/experience';

/**
 * Cancellation policy and report (ED-10). Ports the full experience page's
 * own closing-duration copy (`ViewExperiencePageContent`) rather than
 * inventing new wording - there is no API field for a "free cancellation
 * until / transferable after" policy, only how long before the experience
 * ticket sales close.
 *
 * "Report this experience" mirrors the full page's own button: no backend
 * endpoint exists yet to report an experience, so this stays a static row
 * rather than a dialog with nothing to submit to.
 */
export const ExperienceCancellationSection = ({ experience }: { experience: Experience }) => {
  const closingDuration = experience.ticketSalesClosingDuration;
  const closingUnitRaw = experience.ticketSalesClosingUnit ?? '';
  const closingUnit =
    closingDuration === 1 && closingUnitRaw.endsWith('s')
      ? closingUnitRaw.slice(0, -1)
      : closingUnitRaw;
  const closingConditionText =
    experience.ticketSalesClosingCondition === 'before_start'
      ? 'before the experience starts.'
      : 'before the experience ends.';

  return (
    <div className="space-y-6">
      {closingDuration && closingUnitRaw && (
        <div className="space-y-2 border-t border-line pt-6">
          <h3 className="text-[22px] font-bold text-brand-ink">Cancellation policy</h3>
          <p className="text-[15px] leading-relaxed text-brand-ink">
            Ticket sales close {closingDuration} {closingUnit} {closingConditionText}
          </p>
        </div>
      )}

      <div className="border-t border-line pt-4">
        <button
          type="button"
          className="inline-flex items-center gap-2.5 text-[14.5px] font-medium text-brand-ink hover:underline"
        >
          <IconComponent
            iconName="Flag02Icon"
            size={20}
            color="currentColor"
            className="text-danger"
          />
          Report this experience
        </button>
      </div>
    </div>
  );
};
