'use client';

import Drawer from '@/components/ui/drawer';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import moment from 'moment';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket } from '@/types/ticket';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});

export default function Reserve({
  isOpen,
  closeModal,
  experience,
}: {
  isOpen: boolean;
  closeModal: () => void;
  experience: Experience;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });


  console.log(experience);

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
        <p className="text-base text-gray-700 mb-3">
          {moment(experience.startDate)?.format('MMM D, YYYY')} -{' '}
          {moment(experience.endDate)?.format('MMM D, YYYY')}
        </p>

        <Form {...form}>
          <div className="flex flex-col rounded-[15px] border-[1px] border-gray-300 p-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-black text-gray-700">Ticket Type</FormLabel>
                  <FormControl>
                    <Select>
                      <SelectTrigger className="h-[55px]">
                        <SelectValue placeholder="Ticket Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {experience.tickets.map((ticket: Ticket) => (
                          <SelectItem key={ticket.id} value={ticket.id}>
                            <div className='flex flex-row'>
                              <div className='flex flex-col'>
                                <p className='text-base font-bold text-gray-700'>{ticket.name}</p>
                                <p className='text-sm text-gray-700'>{experience.currency} {ticket.price}/person</p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem> 
              )}
            />
            
          </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
