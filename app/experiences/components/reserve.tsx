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
export default function Reserve({
  isOpen,
  closeModal,
  experience,
}: {
  isOpen: boolean;
  closeModal: () => void;
  experience: Experience;
}) {
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
    console.log(values, paymentOption);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="px-16">
        <div className="flex flex-col">
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
          <p className="mb-1 text-2xl font-black text-gray-700">{experience.title}</p>
          <p className="mb-3 text-base text-gray-700">
            {moment(experience.startDate)?.format('MMM D, YYYY')} -{' '}
            {moment(experience.endDate)?.format('MMM D, YYYY')}
          </p>

          <div className="flex flex-col rounded-[15px] border-[1px] border-gray-300 p-4">
            <p className="mb-2 text-base font-bold text-gray-700">Ticket Type</p>
            {experience.tickets.map((ticket: Ticket) => (
              <div key={ticket.id} className="flex w-full flex-row justify-between">
                <div className="flex flex-col items-start">
                  <p className="text-sm font-bold text-gray-700">{ticket.name}</p>
                  <p className="text-sm text-gray-700">
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

          <div className="mt-3 flex flex-col rounded-[15px] border-[1px] border-gray-300 p-4">
            <p className="mb-2 text-sm font-bold text-gray-700">Payment Information</p>
            <PaymentForm ref={formRef} onSubmit={handleSubmit} />
          </div>

          <div className="mt-2.5">
            <Button
              size="lg"
              className="w-full"
              type="submit"
              onClick={() => formRef.current?.submit()}
              disabled={formRef.current?.formState?.isSubmitting}
            >
              {formRef.current?.formState?.isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
