import Image from 'next/image';

import numeral from 'numeral';

import { PaymentStatusBadge } from '@/app/(experiences)/experiences/components/PaymentStatusBadge';

export interface StudioReservation {
  id: string;
  guestName: string;
  guestPicture: string | null;
  experienceTitle: string;
  tickets: number;
  amount: number;
  currency: string;
  method: string;
  status: string;
}

const Cell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <td className={`py-4 pr-4 align-middle ${className}`}>{children}</td>
);

export const RecentReservations = ({ reservations }: { reservations: StudioReservation[] }) => (
  <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-lg font-bold text-gray-900">Recent reservations</h2>
      <span className="flex-shrink-0 text-sm font-medium text-primary">View all</span>
    </div>

    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
            <th className="pb-3 pr-4 font-medium">Guest</th>
            <th className="pb-3 pr-4 font-medium">Experience</th>
            <th className="pb-3 pr-4 font-medium">Tickets</th>
            <th className="pb-3 pr-4 font-medium">Amount</th>
            <th className="pb-3 pr-4 font-medium">Method</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <Cell>
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                    {reservation.guestPicture && (
                      <Image
                        src={reservation.guestPicture}
                        alt={reservation.guestName}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{reservation.guestName}</span>
                </div>
              </Cell>
              <Cell className="text-sm text-gray-600">{reservation.experienceTitle}</Cell>
              <Cell className="text-sm text-gray-600">{reservation.tickets}</Cell>
              <Cell className="text-sm font-medium text-gray-900">
                {reservation.currency} {numeral(reservation.amount).format('0,0.00')}
              </Cell>
              <Cell className="text-sm text-gray-600">{reservation.method}</Cell>
              <Cell>
                <PaymentStatusBadge status={reservation.status} />
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
