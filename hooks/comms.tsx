import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '@/services/comm';

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { content: string; recipientId: string }) => await sendMessage(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};
