'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import moment from 'moment';
import numeral from 'numeral';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import PaymentForm, { paymentFormSchema } from '@/components/ui/paymentForm';
import PaymentSuccess from '@/components/ui/paymentSuccess';
import Paystack from '@/components/ui/paystack';
import Quantity from '@/components/ui/quantity';
import { Separator } from '@/components/ui/separator';
import { usePurchaseExperienceTicket } from '@/hooks/experiences';
import { toast } from '@/hooks/use-toast';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import { PurchaserDetails } from '@/types/purchaser';
import { Ticket } from '@/types/ticket';

export default function Reserve({ experience }: { experience: Experience }) {
  const [isPaystackOpen, setIsPaystackOpen] = useState<boolean>(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState<boolean>(false);
  const [showInviteGuests, setShowInviteGuests] = useState<boolean>(false);
  const [ticketError, setTicketError] = useState<string>('');
  const {
    mutate: purchaseExperienceTicket,
    isPending: isPurchasingExperienceTicket,
    data: purchaseData,
    isSuccess: isPurchaseSuccess,
    isError: isPurchaseError,
    error: purchaseError,
  } = usePurchaseExperienceTicket();
  const formRef = useRef<any>();
  const [reservedTickets, setReservedTickets] = useState<
    { ticketId: string; quantity: number; price: number }[]
  >([]);

  const handleReservedTicketsChange = (ticketId: string, quantity: number, price: number) => {
    const ticket = reservedTickets.find((t) => t.ticketId === ticketId);

    if (!ticket) {
      setReservedTickets((prev) => [...prev, { ticketId, quantity, price }]);
    } else {
      const newTicket = { ticketId, quantity, price };
      setReservedTickets((prev) => [...prev.filter((t) => t.ticketId !== ticketId), newTicket]);
    }

    // Clear error when user selects tickets
    if (ticketError) {
      setTicketError('');
    }
  };

  const handleFormSubmit = () => {
    const totalTickets = reservedTickets.reduce((acc, ticket) => acc + ticket.quantity, 0);

    if (totalTickets === 0) {
      setTicketError('Please select at least one ticket');
      return;
    }

    formRef.current?.submit();
  };

  const handleSubmit = (values: z.infer<typeof paymentFormSchema>) => {
    const purchaserDetails: PurchaserDetails = {
      first_name: values.firstName,
      last_name: values.lastName,
      confirmation_email: values.email,
      ticket_purchases: reservedTickets.map((ticket) => ({
        ticket_id: ticket.ticketId,
        quantity: ticket.quantity,
      })),
      billing_details: {
        billing_address: {
          country: values.country,
        },
        payment_method: {
          payment_option: values.paymentOption || 'card',
          mobile_money_phone: values.phoneNumber,
        },
      },
    };

    purchaseExperienceTicket(purchaserDetails, {
      onSuccess: (data) => {
        setIsPaystackOpen(true);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: (error as any)?.message,
          variant: 'destructive',
        });
      },
    });
  };

  // Or use useEffect to react to state changes
  useEffect(() => {
    if (isPurchaseSuccess && purchaseData) {
      console.log('Purchase data:', purchaseData);
      // Handle the successful purchase data
    }

    if (isPurchaseError) {
      console.error('Purchase error:', purchaseError);
      // Handle the error
    }
  }, [isPurchaseSuccess, isPurchaseError, purchaseData, purchaseError]);

  return (
    <div className="mb-4 flex flex-col">
      <p className="mb-2.5 text-2xl font-black text-gray-700">Make Reservation</p>
      <div className="relative mb-2.5 aspect-square h-[10.625rem] w-full">
        <Image
          src={
            experience.photos.find((photo: Photo) => photo.isCover)?.photo ||
            experience.photos[0].photo
          }
          alt=""
          quality={100}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-2xl"
        />
      </div>
      <p className="text-1xl mb-1 font-black text-gray-700">{experience.title}</p>
      <p className="mb-3 mb-4 inline-flex items-center text-base text-gray-500">
        {moment(experience.startDate).format('MMM DD')}
        <Separator
          style={{
            height: '10px',
            width: '10px',
            borderRadius: '50%',
            marginRight: 10,
            marginLeft: 10,
          }}
        />
        {moment(experience.startDate)?.format('HH:mm A')} -{' '}
        {moment(experience.endDate)?.format('HH:mm A')}
      </p>

      <Separator
        style={{ height: '7px', width: '100%', borderRadius: '20px', backgroundColor: '#F3F4F6' }}
      />

      <div className="mb-4 mt-4 flex flex-col">
        <p className="mb-2 text-base font-bold text-gray-700">Ticket Type</p>
        {experience.tickets.map((ticket: Ticket) => (
          <div key={ticket.id} className="mb-2.5 flex w-full flex-row justify-between">
            <div className="flex flex-col items-start">
              <p className="text-sm font-bold text-gray-700">{ticket.name}</p>
              <p className="mt-1 text-sm text-gray-500">
                {experience.currency} {numeral(ticket.price).format('0,0.00')}/person
              </p>
            </div>
            <div className="flex flex-col items-end">
              <Quantity
                initialValue={0}
                min={0}
                max={ticket.availableQuantity}
                onChange={(value, type) =>
                  handleReservedTicketsChange(ticket.id, value, ticket.price)
                }
              />
            </div>
          </div>
        ))}

        {ticketError && <p className="mt-2 text-sm text-red-600">{ticketError}</p>}

        <Separator className="my-4 h-[1px]" />

        <div className="flex flex-row justify-between">
          <p className="mb-2 text-base font-bold text-gray-700">Total</p>
          <p className="text-sm font-bold text-gray-700">
            {experience.currency}{' '}
            {numeral(
              reservedTickets.reduce((acc, ticket) => acc + ticket.price * ticket.quantity, 0),
            ).format('0,0.00')}
          </p>
        </div>
      </div>

      <Separator
        style={{ height: '7px', width: '100%', borderRadius: '20px', backgroundColor: '#F3F4F6' }}
      />

      <div className="mt-3 mt-4 flex flex-col">
        <PaymentForm ref={formRef} onSubmit={handleSubmit} paid={experience.isPaid} />
      </div>

      <Paystack
        isOpen={isPaystackOpen}
        closeModal={(paymentSuccess) => {
          setIsPaystackOpen(false);
          if (paymentSuccess) {
            setIsPaymentSuccessOpen(true);
            formRef.current?.reset();
            setReservedTickets([]);
          }
        }}
        url={purchaseData?.data?.paymentDetails?.authorizationUrl || ''}
      />

      <PaymentSuccess
        isOpen={isPaymentSuccessOpen}
        closeModal={(goToInviteGuests) => {
          setIsPaymentSuccessOpen(false);
          if (goToInviteGuests) {
            setShowInviteGuests(true);
          }
        }}
      />

      <div className="mt-4">
        <Button
          size="lg"
          className="w-full"
          type="submit"
          onClick={handleFormSubmit}
          disabled={isPurchasingExperienceTicket}
        >
          {isPurchasingExperienceTicket ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}
