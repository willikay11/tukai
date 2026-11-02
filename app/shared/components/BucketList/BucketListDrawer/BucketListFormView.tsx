'use client';

import {
  useBucketList,
  useCreateBucketList,
  useUpdateBucketList,
} from '@/app/shared/hooks/useBucketLists';
import { useToast } from '@/app/shared/hooks/useToast';
import { BucketList, BucketListDetail, CreateBucketListPayload } from '@/types/bucket-list';

import { BucketListCreated, BucketListForm } from '../BucketListForm';
import { BucketListPanelFrame } from './BucketListPanelFrame';
import { useCopyBucketListLink } from './BucketListView';
import { BucketListNav, BucketListScreen } from './bucket-list-drawer';

/** Create bucket list, standing alone in the panel. */
export const BucketListCreateView = ({ nav }: { nav: BucketListNav }) => {
  const { toast } = useToast();
  const { mutate: createBucketList, isPending } = useCreateBucketList();

  const handleSubmit = (payload: CreateBucketListPayload) =>
    createBucketList(payload, {
      onSuccess: (response) => {
        const created = response?.data as BucketList | undefined;
        nav.replace({
          kind: 'created',
          id: created?.id ?? '',
          name: payload.name,
          visibility: payload.visibility,
        });
      },
      onError: (error: Error) =>
        toast({
          title: 'Could not create this list',
          description: error.message,
          variant: 'destructive',
        }),
    });

  return (
    <BucketListPanelFrame
      title="Create bucket list"
      onBack={nav.canGoBack ? nav.back : undefined}
      onClose={nav.close}
    >
      <BucketListForm isPending={isPending} onSubmit={handleSubmit} onCancel={nav.back} />
    </BucketListPanelFrame>
  );
};

/** Edit bucket list, on top of the list it edits. */
export const BucketListEditView = ({
  bucketListId,
  nav,
}: {
  bucketListId: string;
  nav: BucketListNav;
}) => {
  const { toast } = useToast();
  const { data: response } = useBucketList(bucketListId);
  const bucketList: BucketListDetail | undefined = response?.data;
  const { mutate: updateBucketList, isPending } = useUpdateBucketList(bucketListId);

  const handleSubmit = (payload: CreateBucketListPayload) =>
    updateBucketList(payload, {
      onSuccess: () => {
        toast({ title: 'Changes saved.', variant: 'success' });
        nav.back();
      },
      onError: (error: Error) =>
        toast({
          title: 'Could not save this list',
          description: error.message,
          variant: 'destructive',
        }),
    });

  return (
    <BucketListPanelFrame title="Edit bucket list" onBack={nav.back} onClose={nav.close}>
      {bucketList && (
        <BucketListForm
          initial={bucketList}
          isEditing
          isPending={isPending}
          onSubmit={handleSubmit}
          onCancel={nav.back}
        />
      )}
    </BucketListPanelFrame>
  );
};

/** "Your bucket list is ready", in place of the Create form. */
export const BucketListCreatedView = ({
  screen,
  nav,
}: {
  screen: Extract<BucketListScreen, { kind: 'created' }>;
  nav: BucketListNav;
}) => {
  const copyLink = useCopyBucketListLink();

  const handleSecond = () => {
    if (screen.visibility === 'private') {
      nav.replace({ kind: 'list', id: screen.id });
      nav.push({ kind: 'invite', id: screen.id });
      return;
    }

    copyLink(screen.id, `Link copied. Anyone with it can view and join ${screen.name}.`);
  };

  return (
    <BucketListPanelFrame title="" ariaTitle="Bucket list created" onClose={nav.close}>
      <BucketListCreated
        name={screen.name}
        visibility={screen.visibility}
        onView={() => nav.replace({ kind: 'list', id: screen.id })}
        onSecond={handleSecond}
      />
    </BucketListPanelFrame>
  );
};
