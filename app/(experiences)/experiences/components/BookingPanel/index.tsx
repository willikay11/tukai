'use client';

import { useEffect, useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Mail02TwotoneRounded, UserTwotoneRounded } from '@hugeicons-pro/core-twotone-rounded';
import { HugeiconsIcon } from '@hugeicons/react';
import moment from 'moment';
import { z } from 'zod';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  useFetchExperienceOccurrences,
  usePurchaseExperienceTicketV2,
} from '@/app/shared/hooks/useExperiences';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Paystack } from '@/components/ui/paystack';
import { PhoneNumber } from '@/components/ui/phoneNumber';
import { Quantity } from '@/components/ui/quantity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicketPurchasePayload } from '@/services/experience';
import { Experience, ExperienceOccurrence } from '@/types/experience';
import { parseApiError } from '@/utils/parseApiError';

import { RecurringDateSlotPicker } from './RecurringDateSlotPicker';

interface BookingPanelProps {
  experience: Experience;
  // 'preview' renders the identical panel — tabs, pickers, steppers, totals,
  // payment method, phone — but hard-disables the purchase call so a creator
  // previewing their own draft can never buy a ticket. Layout must NOT branch
  // on this; only the Pay action does.
  mode?: 'live' | 'preview';
}

const formatSlotLabel = (startTime: string, durationMinutes: number): string => {
  const [hour, min] = startTime.split(':').map(Number);
  const start = moment({ hour, minute: min });
  const end = start.clone().add(durationMinutes, 'minutes');
  return `${start.format('h:mm A')} - ${end.format('h:mm A')}`;
};

// Itinerary occurrences carry no slot template, so fall back to the times on
// the occurrence itself rather than reading through a null template
const occurrenceLabel = (occurrence: ExperienceOccurrence): string => {
  const { startTime, durationMinutes } = occurrence.slotTemplate ?? {};

  if (startTime && durationMinutes != null) {
    return formatSlotLabel(startTime, durationMinutes);
  }

  const start = moment(occurrence.startDate);
  const end = moment(occurrence.endDate);

  if (!start.isValid()) return '';
  if (!end.isValid()) return start.format('h:mm A');

  return `${start.format('h:mm A')} - ${end.format('h:mm A')}`;
};

// Same rule PaymentForm's paymentFormSchema applies to mobile-money numbers
const PHONE_REGEX = /^\+\d{6,15}$/;

export const BookingPanel = ({ experience, mode = 'live' }: BookingPanelProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const isPreview = mode === 'preview';

  const [tab, setTab] = useState<'reservation' | 'moments'>('reservation');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  // Kept as state, not a constant, so restoring the commented-out payment
  // method picker below needs no other change. M-Pesa is the only method today.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // Bumped by resetPanel to remount the uncontrolled inputs (PhoneNumber, Quantity)
  const [formResetKey, setFormResetKey] = useState(0);
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);

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
      label: occurrenceLabel(occurrence),
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

  // Tickets are linked to a slot template — list only the selected slot's
  // tickets. Tickets without a slot template (one-time experiences) always
  // show. Total and payload are scoped the same way, so quantities picked on
  // another slot stay inert.
  const selectedTemplateId = useMemo(
    () => occurrences.find((occurrence) => occurrence.id === selectedSlotId)?.slotTemplate?.id,
    [occurrences, selectedSlotId],
  );

  const visibleTickets = useMemo(
    () =>
      (experience.tickets ?? []).filter(
        (ticket) => !ticket.slotTemplate || ticket.slotTemplate === selectedTemplateId,
      ),
    [experience.tickets, selectedTemplateId],
  );

  const updateQuantity = (ticketId: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [ticketId]: qty }));
  };

  const total = visibleTickets.reduce((sum, ticket) => {
    const qty = quantities[ticket.id] ?? 0;
    const price = typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price;
    return sum + qty * price;
  }, 0);

  // Counted rather than derived from `total`, which is 0 for a free experience
  // even when tickets have been picked
  const selectedTicketCount = visibleTickets.reduce(
    (sum, ticket) => sum + (quantities[ticket.id] ?? 0),
    0,
  );

  // Mirrors the reserve page's paymentFormSchema rules and messages
  const validatePurchase = (): Record<string, string> => {
    const validationErrors: Record<string, string> = {};

    if (selectedTicketCount === 0) {
      validationErrors.tickets = 'Please select at least one ticket.';
    }

    if (!selectedSlotId) {
      validationErrors.slot = 'Please select a date and time.';
    }

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

    if (
      deliveryMethod === 'email' &&
      !z.string().email().safeParse(deliveryContact.trim()).success
    ) {
      validationErrors.deliveryContact = 'Please enter a valid email address.';
    }

    return validationErrors;
  };

  // Clears everything the purchaser typed once the payment lands, so the panel
  // is not left holding their details. PhoneNumber and Quantity are both
  // uncontrolled — they seed from their props once and ignore later changes —
  // so clearing the state alone leaves the old values on screen. Bumping the
  // key remounts them.
  const resetPanel = () => {
    setQuantities({});
    setErrors({});
    setPhone('');
    setDeliveryContact('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setFormResetKey((key) => key + 1);
  };

  // Both success paths land on the confirmation page. The reference and
  // experience id travel as query params so the page can fetch the real
  // confirmation once that API exists, with no further wiring here.
  const goToBookingSuccess = (reference?: string) => {
    resetPanel();

    const params = new URLSearchParams({ experienceId: experience.id });
    if (reference) params.set('ref', reference);

    router.push(`/experiences/booking-success?${params.toString()}`);
  };

  const handlePay = () => {
    // Second guard behind the disabled button — the purchase API must be
    // unreachable from preview even if the button is somehow activated
    if (isPreview) return;

    const validationErrors = validatePurchase();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload: TicketPurchasePayload = {
      ticket_purchases: visibleTickets
        .filter((ticket) => (quantities[ticket.id] ?? 0) > 0)
        .map((ticket) => ({ ticket_id: ticket.id, quantity: quantities[ticket.id] })),
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
          // Nothing to charge — the purchase is already complete
          goToBookingSuccess(response.data?.paymentDetails?.reference);
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
    <div className="space-y-4 rounded-3xl bg-gray-50 p-5">
      {/* Tabs */}
      <Tabs value={tab} onValueChange={(val) => setTab(val as 'reservation' | 'moments')}>
        <TabsList className="h-auto gap-0 rounded-full bg-white p-0.5">
          <TabsTrigger
            value="reservation"
            className="flex-1 rounded-full border-0 bg-white px-4 py-2 text-xs text-gray-700 data-[state=active]:border-b-0 data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Make Reservation
          </TabsTrigger>
          <TabsTrigger
            value="moments"
            className="flex-1 rounded-full border-0 bg-white px-4 py-2 text-xs text-gray-700 data-[state=active]:border-b-0 data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Moments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservation" className="mt-4 space-y-4">
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
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
              <div className="flex items-start gap-3">
                <IconComponent
                  iconName="Calendar03Icon"
                  size={20}
                  className="mt-0.5 flex-shrink-0 text-primary"
                />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">{dateRange}</p>
                  {experience.priceStartsFrom?.amount != null && (
                    <p className="text-xs text-gray-500">
                      From {currency} {experience.priceStartsFrom.amount.toLocaleString()}/Guest
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {errors.slot && <p className="text-xs text-red-500">{errors.slot}</p>}

          {/* Ticket selector */}
          {(experience.tickets?.length ?? 0) > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-900">Select your preferred ticket</p>

              {visibleTickets.length === 0 ? (
                <p className="text-xs text-gray-500">No tickets available for this time slot.</p>
              ) : (
                <div className="space-y-3">
                  {visibleTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          {currency} {parseFloat(ticket.price as any).toLocaleString()}/person
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">{ticket.name}</p>
                      </div>
                      <Quantity
                        // Uncontrolled like PhoneNumber — it seeds from
                        // initialValue once, so a reset needs a remount
                        key={`${ticket.id}-${formResetKey}`}
                        initialValue={quantities[ticket.id] ?? 0}
                        min={0}
                        max={ticket.quantity}
                        onChange={(qty) => updateQuantity(ticket.id, qty)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {errors.tickets && <p className="text-xs text-red-500">{errors.tickets}</p>}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-sm font-bold text-gray-900">
              {currency}{' '}
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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
                      <HugeiconsIcon
                        icon={UserTwotoneRounded}
                        size={20}
                        className="text-gray-600"
                      />
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
                      <HugeiconsIcon
                        icon={UserTwotoneRounded}
                        size={20}
                        className="text-gray-600"
                      />
                    }
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={
                    <HugeiconsIcon
                      icon={Mail02TwotoneRounded}
                      size={20}
                      className="text-gray-600"
                    />
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
                className={`rounded-full px-4 py-3 text-xs font-medium transition-colors ${
                  deliveryMethod === 'email'
                    ? 'bg-gradient-to-b from-[#047857] to-[#064E3B] text-white shadow-md'
                    : 'bg-white text-gray-500'
                } `}
              >
                Via Email
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deliveryMethod !== 'whatsapp') setDeliveryContact('');
                  setDeliveryMethod('whatsapp');
                }}
                className={`rounded-full px-4 py-3 text-xs font-medium transition-colors ${
                  deliveryMethod === 'whatsapp'
                    ? 'bg-gradient-to-b from-[#047857] to-[#064E3B] text-white shadow-md'
                    : 'bg-white text-gray-500'
                } `}
              >
                Via Whatsapp
              </button>
            </div>

            {deliveryMethod === 'whatsapp' ? (
              <div>
                <PhoneNumber
                  key={`delivery-${formResetKey}`}
                  onChange={(value) => setDeliveryContact(value)}
                  placeholder="Enter Whatsapp number"
                />
                {errors.deliveryContact && (
                  <p className="mt-1 text-xs text-red-500">{errors.deliveryContact}</p>
                )}
              </div>
            ) : (
              <div>
                {/* Mirrors PhoneNumber's shell so the two delivery inputs are
                    identical when toggling between Whatsapp and Email */}
                <div className="flex h-14 w-full items-center rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm focus-within:border-transparent focus-within:ring-[1px] focus-within:ring-primary md:text-sm">
                  <div className="px-2">
                    <IconComponent
                      iconName="Mail01Icon"
                      size={16}
                      className="flex-shrink-0 text-gray-700"
                    />
                  </div>
                  <input
                    type="email"
                    value={deliveryContact}
                    onChange={(e) => setDeliveryContact(e.target.value)}
                    placeholder="Enter email address"
                    className="h-14 w-full min-w-0 flex-1 border-none bg-transparent py-1 text-sm placeholder:text-gray-400 focus:outline-none md:text-sm"
                  />
                </div>
                {errors.deliveryContact && (
                  <p className="mt-1 text-xs text-red-500">{errors.deliveryContact}</p>
                )}
              </div>
            )}
          </div>

          {/* Payment method picker — hidden for now; `paymentMethod` stays on
              its 'mpesa' default, so the phone input and its validation below
              behave exactly as they did with M-Pesa selected. Restore this
              block to offer card payments again. */}
          {/*
          <p className="text-sm font-bold text-gray-900">Payment method</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('mpesa')}
              className={`flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-medium transition-colors ${
                paymentMethod === 'mpesa'
                  ? 'border-2 border-primary text-primary'
                  : 'border-2 border-transparent text-gray-500'
              } `}
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
              className={`flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-medium transition-colors ${
                paymentMethod === 'card'
                  ? 'border-2 border-primary text-primary'
                  : 'border-2 border-transparent text-gray-500'
              } `}
            >
              <IconComponent
                iconName="CreditCardIcon"
                size={16}
                className={paymentMethod === 'card' ? 'text-primary' : 'text-gray-500'}
              />
              Credit Card
            </button>
          </div>
          */}

          {/* Phone input (only for M-Pesa). Labelled explicitly because the
              payment method picker above is commented out — without it the
              field has nothing but a placeholder to explain itself. The wording
              still reads correctly if that picker is restored. */}
          {paymentMethod === 'mpesa' && (
            <div>
              <p className="text-sm font-bold text-gray-900">Pay with M-Pesa</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Enter the M-Pesa number you want to pay from.
              </p>
              <div className="mt-3">
                <PhoneNumber
                  key={`mpesa-${formResetKey}`}
                  onChange={(value) => setPhone(value)}
                  placeholder="Enter M-Pesa number"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>
          )}

          {/* API error */}
          {errors.api && <p className="text-center text-xs text-red-500">{errors.api}</p>}

          {/* Pay button — the creator sees the real label and total, greyed out,
              so the preview still shows what a customer would see */}
          <Button
            variant="gradient"
            onClick={handlePay}
            // Stays enabled when the form is incomplete — pressing it surfaces
            // an error on each offending input instead of silently doing nothing
            disabled={isPreview || isPaying}
            className={`h-12 w-full rounded-full py-3 ${
              isPreview ? 'bg-gray-200 bg-none text-gray-500 disabled:opacity-100' : ''
            }`}
          >
            <span className="flex items-center justify-center gap-3 text-sm">
              <span>{isPaying ? 'Processing…' : 'Pay'}</span>
              <span className={isPreview ? 'text-gray-400' : 'text-white/60'}>|</span>
              <span>
                {currency}{' '}
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </span>
          </Button>

          {isPreview ? (
            <div className="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
              <IconComponent
                iconName="SquareLock01Icon"
                size={16}
                color="currentColor"
                className="mt-0.5 flex-shrink-0 text-orange-500"
              />
              <p className="text-xs leading-relaxed text-orange-700">
                Booking is disabled in preview. Guests can reserve once you publish this experience.
              </p>
            </div>
          ) : (
            <p className="text-center text-xs italic text-gray-500">
              *Payments are handled externally via Paystack
            </p>
          )}
        </TabsContent>

        <TabsContent value="moments" className="py-8 text-center">
          <p className="text-sm text-gray-500">Moments coming soon</p>
        </TabsContent>
      </Tabs>

      {/* Same post-purchase flow as the reserve page. The checkout is an
          overlay so it covers the panel instead of appending an iframe below
          it — Radix also unmounts it while closed, so the iframe never mounts
          against an empty url. */}
      <Dialog
        open={isPaystackOpen}
        onOpenChange={(open) => {
          if (!open) setIsPaystackOpen(false);
        }}
      >
        <DialogContent className="max-w-2xl gap-0 p-0">
          <DialogTitle className="px-6 pb-4 pt-6 text-base font-bold text-gray-900">
            Complete your payment
          </DialogTitle>
          <div className="h-[70vh] w-full overflow-hidden px-6 pb-6">
            <Paystack
              onPaymentSuccess={(paymentSuccess) => {
                setIsPaystackOpen(false);
                if (paymentSuccess) {
                  goToBookingSuccess(purchaseData?.data?.paymentDetails?.reference);
                }
              }}
              url={purchaseData?.data?.paymentDetails?.authorizationUrl || ''}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
