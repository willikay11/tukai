'use client';

import moment from 'moment';
import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Experience } from '@/types/experience';
import { TicketQuantityRow } from '../TicketQuantityRow';
import { PaymentMethodTabs } from '../PaymentMethodTabs';
import { PhoneNumberInput } from '../PhoneNumberInput';

interface BookingPanelProps {
  experience: Experience;
  onPay?: (data: { quantities: Record<string, number>; paymentMethod: 'mpesa' | 'card'; phone?: string }) => void;
}

export const BookingPanel = ({ experience, onPay }: BookingPanelProps) => {
  const [tab, setTab] = useState<'reservation' | 'moments'>('reservation');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [phone, setPhone] = useState('');

  const updateQuantity = (ticketId: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [ticketId]: qty }));
  };

  const total = experience.tickets.reduce((sum, ticket) => {
    const qty = quantities[ticket.id] ?? 0;
    const price = typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price;
    return sum + qty * price;
  }, 0);

  const handlePay = () => {
    if (onPay) {
      onPay({
        quantities,
        paymentMethod,
        phone: paymentMethod === 'mpesa' ? phone : undefined,
      });
    }
  };

  const dateRange = `${moment(experience.startDate).format('MMM D')} - ${moment(experience.endDate).format('MMM D, YYYY')}`;

  return (
    <div className="border border-gray-200 rounded-2xl p-4 space-y-4 bg-white">
      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('reservation')}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${
              tab === 'reservation'
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          Make Reservation
        </button>
        <button
          onClick={() => setTab('moments')}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${
              tab === 'moments'
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          Moments
        </button>
      </div>

      {tab === 'reservation' && (
        <>
          {/* Date pill */}
          <div className="flex items-start justify-between gap-3 border border-gray-100 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <IconComponent iconName="Calendar03Icon" size={16} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">{dateRange}</p>
                <p className="text-xs text-gray-500">
                  From {experience.currency} {experience.priceStartsFrom.amount}/Guest
                </p>
              </div>
            </div>
            <button className="text-sm text-primary font-medium hover:underline">Change</button>
          </div>

          {/* Ticket selector */}
          {experience.tickets.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">Select your preferred ticket</p>
              {experience.tickets.map((ticket) => (
                <TicketQuantityRow
                  key={ticket.id}
                  ticket={ticket}
                  quantity={quantities[ticket.id] ?? 0}
                  onChange={(q) => updateQuantity(ticket.id, q)}
                />
              ))}
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">
              {experience.currency} {total.toFixed(2)}
            </span>
          </div>

          {/* Payment method */}
          <PaymentMethodTabs value={paymentMethod} onChange={setPaymentMethod} />

          {/* Phone input (only for M-Pesa) */}
          {paymentMethod === 'mpesa' && (
            <PhoneNumberInput value={phone} onChange={setPhone} />
          )}

          {/* Pay button */}
          <button
            type="button"
            onClick={handlePay}
            disabled={total === 0}
            className="w-full bg-primary text-white rounded-full py-3 text-sm font-semibold
                       hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            Pay {' | '} {experience.currency} {total.toFixed(2)}
          </button>
        </>
      )}

      {tab === 'moments' && (
        <p className="text-sm text-gray-500 text-center py-8">Moments coming soon</p>
      )}
    </div>
  );
};
