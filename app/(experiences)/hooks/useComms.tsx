import { useMutation } from '@tanstack/react-query';

import { unsubscribe } from '@/services/comm';

/**
 * Sending a message moved to `useSendMessageTo` in shared hooks: the inbox's
 * composer and the dialog on a host's page both send through it, and two hooks
 * doing the same thing is how they drift apart.
 */
export const useUnsubscribe = () => {
  return useMutation({
    mutationFn: async (data: { token: string }) => await unsubscribe(data),
  });
};
