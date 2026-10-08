import Link from 'next/link';

import { Experience } from '@/types/experience';
import { isTicketPaused } from '@/types/ticket';
import { experiencePath } from '@/utils/detail-paths';
import { getTicketBuyerPrice } from '@/utils/ticket-utils';

/**
 * One pill per ticket type with its price (ED-06). The drawer stays a
 * summary - per the inventory's decision 2, tapping a pill sends the reader
 * to the experience page to actually book, the same place the footer's "View
 * experience" button goes, rather than a second ticket picker living in the
 * drawer too.
 */
export const ExperienceTicketsSection = ({ experience }: { experience: Experience }) => {
  const tickets = (experience.tickets ?? []).filter((ticket) => !isTicketPaused(ticket));
  if (tickets.length === 0) return null;

  return (
    <div className="space-y-4 border-t border-line pt-6">
      <h3 className="text-[22px] font-bold text-brand-ink">Ticket prices</h3>

      <div className="flex flex-wrap gap-2">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={experiencePath(experience)}
            className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-[14px] transition-colors hover:bg-surface-muted"
          >
            <span className="font-semibold text-brand-ink">
              {experience.currency} {getTicketBuyerPrice(ticket).toLocaleString()}
            </span>
            <span className="text-ink-muted">{ticket.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
