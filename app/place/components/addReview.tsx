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
import {
  useCreatePlaceReview,
  useUpdatePlaceReview,
  useUploadPlaceReviewImages,
} from '@/hooks/places';
import ImageUpload from '@/components/ui/imageUpload';
import { useSession } from 'next-auth/react';
import Drawer from '@/components/ui/drawer';
import { PlaceReview } from '@/types/place';
import { Photo } from '@/types/photo';
import { deletePlaceReviewImage } from '@/services/place';

type addReviewProps = {
  isOpen: boolean;
  placeTitle: string;
  placeId: string;
  closeModal: () => void;
  review?: PlaceReview;
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
  images: z.array(z.instanceof(File)).optional(),
});

export default function AddReview({
  isOpen,
  placeTitle,
  placeId,
  closeModal,
  review,
}: addReviewProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { data: session } = useSession();
  const {
    mutate: createPlaceReview,
    isSuccess,
    data: reviewData,
    isPending,
  } = useCreatePlaceReview(placeId);

  const {
    mutate: updatePlaceReview,
    isSuccess: isUpdateSuccess,
    isPending: isUpdatePending,
  } = useUpdatePlaceReview(placeId, review?.id || '');

  const { mutate: uploadPlaceReviewImages, isSuccess: isUploadSuccess } =
    useUploadPlaceReviewImages(placeId, review?.id || reviewData?.data?.id);

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
    if (review) {
      updatePlaceReview({
        place_id: placeId,
        title: values.title,
        description: values.description,
        rating: values.rating,
        reviewer_id: session?.user?.id,
      });
    } else {
      createPlaceReview({
        place_id: placeId,
        title: values.title,
        description: values.description,
        rating: values.rating,
        reviewer_id: session?.user?.id,
      });
    }
  }

  const handleUploadImages = () => {
    selectedFiles.filter((file) => !review?.photos?.some((photo) => photo.photo === file.name)).forEach((file, index) => {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('place', placeId);
      if (index === 0) {
        formData.append('is_cover', 'true');
      }
      uploadPlaceReviewImages(formData);
    });
  };

  const handleDeleteImage = (image: Photo) => {
    deletePlaceReviewImage(placeId, review?.id || reviewData?.data?.id, image.id);
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
      handleUploadImages();
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
              disabled={isPending || isUpdatePending}
            >
              {isPending || isUpdatePending ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </Form>
      </div>
    </Drawer>
  );
}
