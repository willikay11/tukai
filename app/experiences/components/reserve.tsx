'use client';

import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import moment from 'moment';
import Image from 'next/image';
import { Ticket } from '@/types/ticket';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Quantity from '@/components/ui/quantity';
import { Separator } from '@/components/ui/separator';
import { useRef, useState } from 'react';
import numeral from 'numeral';
import PaymentForm, { paymentFormSchema } from '@/components/ui/paymentForm';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { usePurchaseExperienceTicket } from '@/hooks/experiences';
import { useEffect } from 'react';

export default function Reserve({ experience }: { experience: Experience }) {
  const { mutate: purchaseExperienceTicket, isPending: isPurchasingExperienceTicket } =
    usePurchaseExperienceTicket();
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
  };

  const handleSubmit = (values: z.infer<typeof paymentFormSchema>, paymentOption: string) => {
    console.log('values: ', values, paymentOption);
    purchaseExperienceTicket({
      experienceId: experience.id,
      reservedTickets,
    });
  };

  useEffect(() => {
    console.log('formRef: ', formRef.current);
  }, [formRef]);

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
          layout="fill"
          objectFit="cover"
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
              <p className="text-sm text-gray-500">
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
        <p className="mb-2 text-sm font-bold text-gray-700">Payment Information</p>
        <PaymentForm ref={formRef} onSubmit={handleSubmit} />
      </div>

      <div className="mt-2.5">
        <Button
          size="lg"
          className="w-full"
          type="submit"
          onClick={() => formRef.current?.submit()}
          disabled={isPurchasingExperienceTicket}
        >
          {isPurchasingExperienceTicket ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}
