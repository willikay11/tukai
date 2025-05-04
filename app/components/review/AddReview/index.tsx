'use client';

import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { StarIcon } from '@hugeicons/react-pro';
import ImageUpload from '@/components/ui/imageUpload';
import { useSession } from 'next-auth/react';
import Drawer from '@/components/ui/drawer';
import { Review } from '@/types/review';
import { Photo } from '@/types/photo';

type addReviewProps = {
  type: 'create' | 'update';
  id: string;
  isOpen: boolean;
  placeTitle: string;
  closeModal: () => void;
} & (
  | {
      type: 'create';
      review: undefined;
      createReview: (data: any) => void;
      updateReview: undefined;
      uploadReviewImages: (reviewId: string, data: any) => void;
      deleteReviewImage: (reviewId: string, imageId: string) => void;
      isSuccess: boolean;
      isUpdateSuccess: undefined;
      isSubmitting: boolean;
      isUploadSuccess: boolean;
      isUpdatePending: undefined;
    }
  | {
      type: 'update';
      review: Review;
      createReview: undefined;
      updateReview: (data: any) => void;
      uploadReviewImages: (reviewId: string, data: any) => void;
      deleteReviewImage: (reviewId: string, imageId: string) => void;
      isSuccess: undefined;
      isUpdateSuccess: boolean;
      isUploadSuccess: boolean;
      isUpdatePending: boolean;
      isSubmitting: undefined;
    }
);

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
  images: z.array(z.instanceof(File)).optional(),
});

export default function AddReview({
  type,
  isOpen,
  placeTitle,
  id,
  closeModal,
  review,
  createReview,
  updateReview,
  uploadReviewImages,
  deleteReviewImage,
  isSuccess,
  isUpdateSuccess,
  isUploadSuccess,
  isSubmitting,
  isUpdatePending,
}: addReviewProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: review?.title || '',
      description: review?.description || '',
      rating: review?.rating || 0,
      images: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (type === 'update') {
      updateReview({
        place_id: id,
        title: values.title,
        description: values.description,
        rating: values.rating,
        reviewer_id: session?.user?.id,
      });
    } else {
      createReview({
        place_id: id,
        title: values.title,
        description: values.description,
        rating: values.rating,
        reviewer_id: session?.user?.id,
      });
    }
  }

  const handleUploadImages = (reviewId: string) => {
    selectedFiles
      .filter((file) => !review?.photos?.some((photo) => photo.photo === file.name))
      .forEach((file, index) => {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('place', id);
        if (index === 0) {
          formData.append('is_cover', 'true');
        }
        uploadReviewImages(reviewId, formData);
      });
  };

  const handleDeleteImage = (image: Photo) => {
    deleteReviewImage(review?.id || '', image.id);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen]);

  useEffect(() => {
    if ((isSuccess || isUpdateSuccess) && selectedFiles.length > 0) {
      handleUploadImages(review?.id || '');
    } else if ((isSuccess || isUpdateSuccess) && selectedFiles.length === 0) {
      form.reset();
      closeModal();
    }
  }, [isSuccess, isUpdateSuccess]);

  useEffect(() => {
    if (isUploadSuccess) {
      form.reset();
      closeModal();
    }
  }, [isUploadSuccess]);

  return (
    <Drawer isOpen={isOpen} setIsOpen={closeModal}>
      <div className="flex flex-col p-12">
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
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal text-gray-700">
                    Have any amazing photos of {placeTitle}?
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      onImagesChange={setSelectedFiles}
                      currentImages={review?.photos}
                      onDeleteImage={handleDeleteImage}
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
              disabled={isSubmitting || isUpdatePending}
            >
              {isSubmitting || isUpdatePending ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </Form>
      </div>
    </Drawer>
  );
}
