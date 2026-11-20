import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useMessageCommunityMembers } from '@/app/shared/hooks/useCommunities';
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

/**
 * Message host: one message to one person. Given a `community` instead, it is
 * the owner's Message members - one message to everyone in it, each landing in
 * their own inbox (DEV-379).
 */
export const SendMessage = ({
  open,
  setOpen,
  recipientId,
  community,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  recipientId?: string;
  community?: { id: string; title: string };
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
  const { mutate: messageMembers, isPending: isMessagingMembers } = useMessageCommunityMembers();

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (community) {
      messageMembers(
        { communityId: community.id, content: values.content },
        {
          onSuccess: ({ sent }) => {
            setOpen(false);
            form.reset();
            toast({
              variant: 'success',
              description:
                sent === 0
                  ? `There is nobody in ${community.title} to message yet.`
                  : `Sent to ${sent} ${sent === 1 ? 'member' : 'members'} of ${community.title}.`,
            });
          },
          onError: (error: Error) =>
            toast({
              title: 'Could not send',
              description: error.message,
              variant: 'destructive',
            }),
        },
      );
      return;
    }

    if (!recipientId) return;
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
          <DialogTitle className="pr-8 text-lg font-bold text-gray-900">
            {community ? 'Message members' : 'Message host'}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-gray-500">
            {community
              ? `Write one message to everyone in ${community.title}. It arrives in their Tukai inbox.`
              : 'They will see this alongside your name, and can reply to you directly. The conversation carries on in your inbox.'}
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
                      <Textarea
                        rows={5}
                        placeholder={
                          community
                            ? 'What would you like to tell them?'
                            : 'What would you like to ask?'
                        }
                        maxLength={2000}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                variant="gradient"
                className="mt-4 w-full rounded-full"
                type="submit"
                isLoading={isPending || isMessagingMembers}
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
