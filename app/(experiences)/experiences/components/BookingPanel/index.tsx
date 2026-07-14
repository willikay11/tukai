'use client';

import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';

import { Mail02TwotoneRounded, UserTwotoneRounded } from '@hugeicons-pro/core-twotone-rounded';
import { HugeiconsIcon } from '@hugeicons/react';
import { z } from 'zod';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  useFetchExperienceOccurrences,
  usePurchaseExperienceTicketV2,
} from '@/app/shared/hooks/useExperiences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentSuccess } from '@/components/ui/paymentSuccess';
import { Paystack } from '@/components/ui/paystack';
import { PhoneNumber } from '@/components/ui/phoneNumber';
import { Quantity } from '@/components/ui/quantity';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TicketPurchasePayload } from '@/services/experience';
import { Experience, ExperienceOccurrence } from '@/types/experience';
import { parseApiError } from '@/utils/parseApiError';

import { RecurringDateSlotPicker } from './RecurringDateSlotPicker';

interface BookingPanelProps {
  experience: Experience;
}

const formatSlotLabel = (startTime: string, durationMinutes: number): string => {
  const [hour, min] = startTime.split(':').map(Number);
  const start = moment({ hour, minute: min });
  const end = start.clone().add(durationMinutes, 'minutes');
  return `${start.format('h:mm A')} - ${end.format('h:mm A')}`;
};

// Same rule PaymentForm's paymentFormSchema applies to mobile-money numbers
const PHONE_REGEX = /^\+\d{6,15}$/;

export const BookingPanel = ({ experience }: BookingPanelProps) => {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);

  const [tab, setTab] = useState<'reservation' | 'moments'>('reservation');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'whatsapp'>('whatsapp');
  const [deliveryContact, setDeliveryContact] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);

  const isRecurring = Boolean(experience.recurrenceRule);

  const { data: occurrencesResponse } = useFetchExperienceOccurrences(experience.id);
  const occurrences: ExperienceOccurrence[] = useMemo(
    () => occurrencesResponse?.data ?? [],
    [occurrencesResponse],
  );

  const {
    mutate: purchaseTicket,
    isPending: isPaying,
    data: purchaseData,
  } = usePurchaseExperienceTicketV2();

  // Slot options are occurrences: id is the OCCURRENCE uuid the v2 API requires.
  // Recurring experiences narrow to the picker's selected date; non-recurring
  // experiences have a single occurrence.
  const timeSlots: { id: string; label: string }[] = useMemo(() => {
    const source = isRecurring
      ? occurrences.filter(
          (occurrence) => moment(occurrence.startDate).format('YYYY-MM-DD') === selectedDate,
        )
      : occurrences;

    return source.map((occurrence) => ({
      id: occurrence.id,
      label: formatSlotLabel(
        occurrence.slotTemplate.startTime,
        occurrence.slotTemplate.durationMinutes,
      ),
    }));
  }, [occurrences, isRecurring, selectedDate]);

  // Keep an occurrence selected: default to the first slot, and re-default
  // when the selected date changes and the previous occurrence no longer applies
  useEffect(() => {
    const stillValid = selectedSlotId && timeSlots.some((slot) => slot.id === selectedSlotId);
    if (!stillValid) {
      setSelectedSlotId(timeSlots[0]?.id ?? null);
    }
  }, [timeSlots, selectedSlotId]);

  const updateQuantity = (ticketId: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [ticketId]: qty }));
  };

  const total = experience.tickets.reduce((sum, ticket) => {
    const qty = quantities[ticket.id] ?? 0;
    const price = typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price;
    return sum + qty * price;
  }, 0);

  // Mirrors the reserve page's paymentFormSchema rules and messages
  const validatePurchase = (): Record<string, string> => {
    const validationErrors: Record<string, string> = {};

    if (!isLoggedIn) {
      if (firstName.trim().length < 2) {
        validationErrors.firstName = 'Please enter your first name.';
      }
      if (lastName.trim().length < 2) {
        validationErrors.lastName = 'Please enter your last name.';
      }
      if (!z.string().email().safeParse(email.trim()).success) {
        validationErrors.email = 'Please enter a valid email address.';
      }
    }

    if (experience.isPaid && paymentMethod === 'mpesa' && !PHONE_REGEX.test(phone)) {
      validationErrors.phone = 'Please enter a valid phone number.';
    }

    if (deliveryMethod === 'whatsapp' && !PHONE_REGEX.test(deliveryContact)) {
      validationErrors.deliveryContact = 'Please enter a valid phone number.';
    }

    return validationErrors;
  };

  const resetPanel = () => {
    setQuantities({});
    setErrors({});
  };

  const handlePay = () => {
    const validationErrors = validatePurchase();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload: TicketPurchasePayload = {
      ticket_purchases: Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([ticketId, qty]) => ({ ticket_id: ticketId, quantity: qty })),
      occurrence: selectedSlotId!,
      ...(isLoggedIn
        ? {}
        : {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            confirmation_email: email.trim(),
          }),
      ...(deliveryMethod === 'whatsapp' && PHONE_REGEX.test(deliveryContact)
        ? { whatsapp_phone: deliveryContact }
        : {}),
    };

    purchaseTicket(payload, {
      onSuccess: (response) => {
        const authorizationUrl = response.data?.paymentDetails?.authorizationUrl;
        if (authorizationUrl) {
          setIsPaystackOpen(true);
        } else {
          setIsPaymentSuccessOpen(true);
          resetPanel();
        }
      },
      onError: (error: any) => {
        const status = error?.status ?? error?.response?.status;
        // Prefer the API's own detail — a 400 can also mean the occurrence
        // belongs to a different experience, not just sold-out tickets
        const apiDetail = error?.data?.errors?.[0]?.detail;
        if (status === 400) {
          setErrors({ api: apiDetail || 'Not enough tickets available.' });
        } else if (status === 404) {
          setErrors({ api: 'Ticket not found.' });
        } else if (status === 503) {
          setErrors({ api: 'Payment service unavailable. Please try again.' });
        } else {
          setErrors({ api: parseApiError(error, 'Failed to complete your purchase.') });
        }
      },
    });
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
            className="flex-1 rounded-full px-4 py-2 text-xs border-0 bg-white text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-b-0"
          >
            Make Reservation
          </TabsTrigger>
          <TabsTrigger
            value="moments"
            className="flex-1 rounded-full px-4 py-2 text-xs border-0 bg-white text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-b-0"
          >
            Moments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservation" className="space-y-4 mt-4">
          {isRecurring ? (
            /* Date & slot picker (recurring experiences) */
            <RecurringDateSlotPicker
              recurrenceRule={experience.recurrenceRule!}
              timeSlots={timeSlots}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedSlotId={selectedSlotId}
              onSlotChange={setSelectedSlotId}
            />
          ) : (
            /* Date pill (single / multi-day experiences) */
            <div className="flex items-center justify-between gap-3 bg-white rounded-2xl px-4 py-3">
              <div className="flex items-start gap-3">
                <IconComponent
                  iconName="Calendar03Icon"
                  size={20}
                  className="text-primary flex-shrink-0 mt-0.5"
                />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">{dateRange}</p>
                  <p className="text-xs text-gray-500">
                    From {currency} {experience.priceStartsFrom.amount.toLocaleString()}/Guest
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ticket selector */}
          {experience.tickets.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-900">Select your preferred ticket</p>

              <div className="space-y-3">
                {experience.tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">
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
            <span className="text-sm font-bold text-gray-900">
              {currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Contact details (anonymous purchasers only) */}
          {!isLoggedIn && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-900">Contact Details</p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    placeholder="First Name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    icon={
                      <HugeiconsIcon icon={UserTwotoneRounded} size={20} className="text-gray-600" />
                    }
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Input
                    placeholder="Last Name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    icon={
                      <HugeiconsIcon icon={UserTwotoneRounded} size={20} className="text-gray-600" />
                    }
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <Input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={
                    <HugeiconsIcon icon={Mail02TwotoneRounded} size={20} className="text-gray-600" />
                  }
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>
          )}

          {/* Ticket delivery */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-900">
              How would you like to receive your tickets?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (deliveryMethod !== 'email') setDeliveryContact('');
                  setDeliveryMethod('email');
                }}
                className={`
                  rounded-full py-3 px-4 text-xs font-medium
                  transition-colors
                  ${
                    deliveryMethod === 'email'
                      ? 'bg-gradient-to-b from-[#047857] to-[#064E3B] text-white shadow-md'
                      : 'bg-white text-gray-500'
                  }
                `}
              >
                Via Email
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deliveryMethod !== 'whatsapp') setDeliveryContact('');
                  setDeliveryMethod('whatsapp');
                }}
                className={`
                  rounded-full py-3 px-4 text-xs font-medium
                  transition-colors
                  ${
                    deliveryMethod === 'whatsapp'
                      ? 'bg-gradient-to-b from-[#047857] to-[#064E3B] text-white shadow-md'
                      : 'bg-white text-gray-500'
                  }
                `}
              >
                Via Whatsapp
              </button>
            </div>

            {deliveryMethod === 'whatsapp' ? (
              <div>
                <PhoneNumber
                  onChange={(value) => setDeliveryContact(value)}
                  placeholder="Enter Whatsapp number"
                />
                {errors.deliveryContact && (
                  <p className="mt-1 text-xs text-red-500">{errors.deliveryContact}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center bg-white rounded-2xl px-4 py-3 gap-3">
                <IconComponent
                  iconName="Mail01Icon"
                  size={16}
                  className="text-gray-700 flex-shrink-0"
                />
                <input
                  type="email"
                  value={deliveryContact}
                  onChange={(e) => setDeliveryContact(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 min-w-0 outline-none bg-transparent text-sm placeholder:text-gray-400"
                />
              </div>
            )}
          </div>

          {/* Payment method */}
          <p className="text-sm font-bold text-gray-900">Payment method</p>
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
            <div>
              <PhoneNumber onChange={(value) => setPhone(value)} placeholder="Enter M-Pesa number" />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
          )}

          {/* API error */}
          {errors.api && <p className="text-xs text-red-500 text-center">{errors.api}</p>}

          {/* Pay button */}
          <Button
            variant="gradient"
            onClick={handlePay}
            disabled={total === 0 || !selectedSlotId || isPaying}
            className="w-full h-12 rounded-full py-3"
          >
            <span className="flex items-center text-sm gap-3 justify-center">
              <span>{isPaying ? 'Processing…' : 'Pay'}</span>
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

      {/* Same post-purchase flow as the reserve page */}
      <Paystack
        isOpen={isPaystackOpen}
        closeModal={(paymentSuccess) => {
          setIsPaystackOpen(false);
          if (paymentSuccess) {
            setIsPaymentSuccessOpen(true);
            resetPanel();
          }
        }}
        url={purchaseData?.data?.paymentDetails?.authorizationUrl || ''}
      />

      <PaymentSuccess
        isOpen={isPaymentSuccessOpen}
        closeModal={() => {
          setIsPaymentSuccessOpen(false);
        }}
      />
    </div>
  );
};
