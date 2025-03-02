'use client';

import { usePlaceReviewComments, useCreatePlaceReviewComment } from '@/hooks/places';
import ViewComment from './viewComment';
import { Comment } from '@/types/comment';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';

const formSchema = z.object({
  comment: z.string().min(2, {
    message: 'Please enter a comment.',
  }),
});

export default function Comments({ placeId, reviewId }: { placeId: string; reviewId: string }) {
  const { data: comments } = usePlaceReviewComments(placeId, reviewId, true);
  const { mutate: createComment, isSuccess } = useCreatePlaceReviewComment(placeId, reviewId);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createComment({
      post_id: placeId,
      commenter_id: '058b7853-c5f4-4e43-b356-da1e8ce05f6e',
      content: values.comment,
    });
  }

  useEffect(() => {
    if (isSuccess) {
      form.reset();
    }
  }, [isSuccess]);

  return (
    <div>
      <div className="px-16">
        <div className="mb-4 inline-flex items-center">
          <p className="text-xl font-semibold text-gray-700">
            {comments?.data?.results?.reduce(
              (acc: number, comment: Comment) => acc + comment.totalLikes,
              0,
            )}
            &nbsp; Likes
          </p>
          <div className="mx-2 h-[8px] w-[8px] rounded-full bg-gray-300" />
          <p className="text-xl font-semibold text-gray-700">{comments?.data?.count} Comments</p>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {comments?.data?.results?.map((comment: Comment) => (
            <ViewComment key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
      <div className="mt-2 px-16 pt-4 shadow-top-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea rows={5} placeholder="Add comment..." {...field} />
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
    </div>
  );
}
