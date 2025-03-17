'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { StarIcon } from '@hugeicons/react-pro';
import { useCreatePlaceReview } from '@/hooks/places';
type addReviewProps = {
  isOpen: boolean;
  placeTitle: string;
  placeId: string;
  closeModal: () => void;
};

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Please enter a title.',
  }),
  description: z.string().min(2, {
    message: 'Please describe your experience of the place.',
  }),
  rating: z.number().min(1, {
    message: 'Please rate the place.',
  }),
});

export default function AddReview({ isOpen, placeTitle, placeId, closeModal }: addReviewProps) {
  const { mutate: createPlaceReview, isSuccess } = useCreatePlaceReview(placeId);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      rating: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createPlaceReview({
      place_id: placeId,
      title: values.title,
      description: values.description,
      rating: values.rating,
      reviewer_id: '058b7853-c5f4-4e43-b356-da1e8ce05f6e',
    });
  }

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen]);

  useEffect(() => {
    if (isSuccess) {
      form.reset();
      closeModal();
    }
  }, [isSuccess]);

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 bg-black/50">
        {/* Clickable backdrop */}
        <div className="absolute inset-0" onClick={() => closeModal?.()}></div>

        <div className="grid grid-cols-12">
          <div className="relative col-span-12 h-screen md:col-span-6 md:col-start-4 2xl:col-span-4 2xl:col-start-5">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0rem', opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              className="absolute bottom-0 h-fit min-h-48 w-full rounded-t-2xl bg-white px-16 pb-4 pt-8 shadow-xl"
            >
              <div className="flex flex-col">
                <p className="mb-4 text-xl font-semibold text-gray-700">Rate Your Experience</p>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-normal text-gray-700">
                            What should others know about {placeTitle}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="e.g, Evening hike at Mt. Kenya with fri..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-normal text-gray-700">
                            Describe your experience
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder="e.g, Evening hike at Mt. Kenya with fri..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-normal text-gray-700">
                            Out of 5, how would you rate the experience you had at {placeTitle}?
                          </FormLabel>
                          <FormControl>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                  type="button"
                                  key={value}
                                  onClick={() => field.onChange(value)}
                                  className={`text-2xl ${
                                    field.value >= value ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  <StarIcon size={20} variant="solid" />
                                </button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      size="lg"
                      className="w-full"
                      type="submit"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </form>
                </Form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  );
}
