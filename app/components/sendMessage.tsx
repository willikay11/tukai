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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useSendMessage } from '@/hooks/comms';

const formSchema = z.object({
  content: z.string().min(2, {
    message: 'Please enter a title.',
  }),
});

export default function SendMessage({
  open,
  setOpen,
  recipientId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  recipientId: string;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  const { mutate: sendMessage, isPending } = useSendMessage();

  function onSubmit(values: z.infer<typeof formSchema>) {
    sendMessage({
      content: values.content,
      recipientId: recipientId,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="px-12">
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
              <Button size="lg" className="w-full mt-2.5" type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
