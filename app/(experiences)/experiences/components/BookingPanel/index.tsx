'use client';

import moment from 'moment';
import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Quantity } from '@/components/ui/quantity';
import { Experience } from '@/types/experience';

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

  const dateRange = `${moment(experience.startDate).format('ddd D MMM')} · ${moment(experience.startDate).format('h:mm A')} — ${moment(experience.endDate).format('h:mm A')}`;
  const currency = experience.currency ?? 'Ksh.';

  return (
    <div className="bg-gray-50 rounded-3xl p-5 space-y-4">
      {/* Tabs */}
      <Tabs value={tab} onValueChange={(val) => setTab(val as 'reservation' | 'moments')}>
        <TabsList className="bg-white rounded-full h-auto p-0.5 gap-0">
          <TabsTrigger
            value="reservation"
            className="flex-1 rounded-full px-6 py-3 text-xs border-0 bg-white text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-b-0"
          >
            Make Reservation
          </TabsTrigger>
          <TabsTrigger
            value="moments"
            className="flex-1 rounded-full px-6 py-3 text-xs border-0 bg-white text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-b-0"
          >
            Moments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservation" className="space-y-4 mt-4">
          {/* Date pill */}
          <div className="flex items-center justify-between gap-3 bg-white rounded-2xl px-4 py-3">
            <div className="flex items-start gap-3">
              <IconComponent
                iconName="Calendar03Icon"
                size={20}
                className="text-primary flex-shrink-0 mt-0.5"
              />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-900">{dateRange}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  From {currency} {experience.priceStartsFrom.amount.toLocaleString()}/Guest
                </p>
              </div>
            </div>
            <button type="button" className="text-sm font-medium text-primary hover:underline flex-shrink-0">
              Change
            </button>
          </div>

          {/* Ticket selector */}
          {experience.tickets.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">Select your preferred ticket</p>

              <div className="space-y-3">
                {experience.tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {currency} {parseFloat(ticket.price as any).toLocaleString()}/person
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{ticket.name}</p>
                    </div>
                    <Quantity
                      initialValue={quantities[ticket.id] ?? 0}
                      min={0}
                      max={ticket.quantity}
                      onChange={(qty) => updateQuantity(ticket.id, qty)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-lg font-bold text-gray-900">
              {currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Payment method */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('mpesa')}
              className={`
                flex items-center justify-center gap-2
                bg-white rounded-xl py-3 text-xs font-medium
                transition-colors
                ${
                  paymentMethod === 'mpesa'
                    ? 'border-2 border-primary text-primary'
                    : 'border-2 border-transparent text-gray-500'
                }
              `}
            >
              <IconComponent
                iconName="Smartphone01Icon"
                size={16}
                className={paymentMethod === 'mpesa' ? 'text-primary' : 'text-gray-500'}
              />
              M-Pesa
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`
                flex items-center justify-center gap-2
                bg-white rounded-xl py-3 text-xs font-medium
                transition-colors
                ${
                  paymentMethod === 'card'
                    ? 'border-2 border-primary text-primary'
                    : 'border-2 border-transparent text-gray-500'
                }
              `}
            >
              <IconComponent
                iconName="CreditCardIcon"
                size={16}
                className={paymentMethod === 'card' ? 'text-primary' : 'text-gray-500'}
              />
              Credit Card
            </button>
          </div>

          {/* Phone input (only for M-Pesa) */}
          {paymentMethod === 'mpesa' && (
            <div className="flex items-center bg-white rounded-xl px-4 py-3 gap-3 h-[50px]">
              <span className="text-xs font-medium text-gray-700 flex-shrink-0">+254</span>
              <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter M-Pesa number"
                className="flex-1 outline-none bg-transparent text-xs placeholder:text-gray-400"
              />
            </div>
          )}

          {/* Pay button */}
          <Button variant="gradient" onClick={handlePay} disabled={total === 0} className="w-full h-12 rounded-full py-3">
            <span className="flex items-center gap-3 justify-center">
              <span>Pay</span>
              <span className="text-white/60">|</span>
              <span>
                {currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </span>
          </Button>
        </TabsContent>

        <TabsContent value="moments" className="text-center py-8">
          <p className="text-sm text-gray-500">Moments coming soon</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
