'use client';

import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useQueryClient } from '@tanstack/react-query';

import { toast } from '@/app/shared/hooks/useToast';
import { addBucketListItem, createBucketList } from '@/services/bucket-list';
import { patchTukaiMessage } from '@/slices/tukaiSlice';
import type { TukaiMessage } from '@/types/tukai';
import { plural } from '@/utils/tukai';

/**
 * Saves a plan as a private bucket list named after it, holding its places
 * and experiences in order. Nothing is booked.
 */
export const useSaveTukaiPlan = (chatId: string) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(
    async (message: TukaiMessage) => {
      const plan = message.plan;
      if (!plan || isSaving) return;
      const items = message.items ?? {};
      const ids = Array.from(new Set(plan.days.flatMap((d) => d.stops.map((s) => s.id)))).filter(
        (id) => items[id] && items[id].kind !== 'community',
      );
      const title = plan.title.slice(0, 60);

      setIsSaving(true);
      try {
        const created = await createBucketList({
          name: title,
          description: `Planned with TukAI. ${plural(plan.days.length, 'day')}, ${plural(ids.length, 'stop')}.`,
          visibility: 'private',
        });
        const listId: string | undefined = created.data?.id;
        if (!listId) throw new Error('No list id');
        // One at a time, so the list keeps the plan's order
        for (const id of ids) {
          await addBucketListItem(
            listId,
            items[id].kind === 'place' ? { placeId: id } : { experienceId: id },
          );
        }
        dispatch(
          patchTukaiMessage({ chatId, messageId: message.id, patch: { savedListId: listId } }),
        );
        queryClient.invalidateQueries({ queryKey: ['bucket-lists'] });
        toast({ description: `Saved to a private bucket list, ${title}. Nothing was booked.` });
      } catch {
        toast({ description: 'Could not save this plan. Try again.' });
      } finally {
        setIsSaving(false);
      }
    },
    [chatId, dispatch, isSaving, queryClient],
  );

  return { save, isSaving };
};
