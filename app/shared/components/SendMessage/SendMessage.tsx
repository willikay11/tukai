import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useSendMessage } from '@/app/(experiences)/hooks/useComms';
import { toast } from '@/app/shared/hooks/useToast';

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

  const { mutate: sendMessage, isPending, isSuccess, isError } = useSendMessage();

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
      <DialogContent className="min-w-[300px] px-4 md:min-w-[400px] md:px-6">
        <div className="flex flex-col gap-4">
          <p className="text-2xl font-black text-gray-700">Message Organizer</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-normal text-gray-700">
                      Please enter your message below
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Enter Message..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button size="lg" className="mt-2.5 w-full" type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
