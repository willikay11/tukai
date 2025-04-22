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
    <Drawer isOpen={isOpen} setIsOpen={closeModal}>
      <div className="flex flex-col p-12">
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
        <p className="text-base text-gray-700">
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
                    <Select className="h-[55px]">
                      <SelectTrigger>
                        <SelectValue placeholder="Ticket Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {experience.tickets.map((ticket: Ticket) => (
                          <SelectItem key={ticket.id} value={ticket.id}>
                            {ticket.name}
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
    </Drawer>
  );
}
