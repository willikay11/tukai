import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useSendMessageTo } from '@/app/shared/hooks/useMessages';
import { toast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  content: z.string().min(2, {
    message: 'Please enter a message.',
  }),
});

export const SendMessage = ({
  open,
  setOpen,
  recipientId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  recipientId: string;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  // The same hook the inbox's conversation composer sends through, so the two
  // cannot drift apart - and a message sent here shows up in that conversation
  const { mutate: sendMessage, isPending, isSuccess, isError } = useSendMessageTo();

  function onSubmit(values: z.infer<typeof formSchema>) {
    sendMessage({
      content: values.content,
      recipientId: recipientId,
    });
  }

  useEffect(() => {
    if (isSuccess) {
      setOpen(false);
      form.reset();
      toast({
        title: 'Success',
        variant: 'success',
        description: 'Message sent successfully',
      });
    }

    if (isError) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  }, [isSuccess, isError]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* The shared dialog is 720px from md - a page width for one field. Both
          caps are set because the base declares only the md one. */}
      <DialogContent className="max-w-[420px] gap-0 rounded-2xl p-5 md:max-w-[420px]">
        <div className="flex min-w-0 flex-col">
          <DialogTitle className="pr-8 text-lg font-bold text-gray-900">Message host</DialogTitle>
          <DialogDescription className="mt-1 text-xs text-gray-500">
            They will see this alongside your name, and can reply to you directly. The conversation
            carries on in your inbox.
          </DialogDescription>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-800">
                      Your message
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="What would you like to ask?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                variant="gradient"
                className="mt-4 w-full rounded-full"
                type="submit"
                isLoading={isPending}
              >
                Send message
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
