import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { Experience } from '@/types/experience';
import { isTicketPaused, Ticket } from '@/types/ticket';
import { experiencePath } from '@/utils/detail-paths';
import { getTicketBuyerPrice } from '@/utils/ticket-utils';

import { EXPERIENCE_SECTIONS } from './tabs';

/**
 * The quiet note line under a ticket's price (ED-06) - "With a paying
 * adult", "Rest due a week before". `Ticket` carries no note, minimum-age or
 * deposit field today, so there is nothing to show one for; this stays
 * `undefined` for every ticket until the API carries that data, rather than
 * inventing a line from fields that do not mean that.
 */
const ticketNote = (_ticket: Ticket): string | undefined => undefined;

/**
 * One card per ticket type (ED-06): label, price, an optional note, and a
 * corner icon. The drawer stays a summary - per the inventory's decision 2,
 * tapping a card sends the reader to the experience page to actually book,
 * the same place the footer's "View experience" button goes, rather than a
 * second ticket picker living in the drawer too.
 */
export const ExperienceTicketsSection = ({ experience }: { experience: Experience }) => {
  const tickets = (experience.tickets ?? []).filter((ticket) => !isTicketPaused(ticket));
  if (tickets.length === 0) return null;

  return (
    <div
      id={EXPERIENCE_SECTIONS.tickets}
      className="scroll-mt-[156px] space-y-4 border-t border-line pt-6"
    >
      <h3 className="text-[22px] font-bold text-brand-ink">Ticket prices</h3>

      <div className="-mx-6 flex gap-2.5 overflow-x-auto px-6 scrollbar-hide">
        {tickets.map((ticket) => {
          const note = ticketNote(ticket);

          return (
            <Link
              key={ticket.id}
              href={experiencePath(experience)}
              className="flex min-w-[176px] flex-none items-start justify-between gap-4 rounded-xl bg-surface px-4 py-3.5 text-left transition-colors hover:bg-surface-brand"
            >
              <span className="flex flex-col gap-1">
                <span className="whitespace-nowrap text-[15px] font-semibold text-brand-ink">
                  {ticket.name}
                </span>
                <span className="whitespace-nowrap text-[14.5px] text-brand-ink">
                  {experience.currency} {getTicketBuyerPrice(ticket).toLocaleString()}
                </span>
                {note && (
                  <span className="whitespace-nowrap text-xs text-ink-muted">{note}</span>
                )}
              </span>

              <IconComponent
                iconName="ArrowUpRight01Icon"
                size={18}
                color="currentColor"
                className="flex-shrink-0 text-brand"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
