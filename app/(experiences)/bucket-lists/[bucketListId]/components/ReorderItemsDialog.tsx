'use client';

import { useEffect, useState } from 'react';

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useReorderBucketListItems } from '@/app/shared/hooks/useBucketLists';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { BucketListItem, bucketListItemName, bucketListItemPhoto } from '@/types/bucket-list';

/**
 * Sets the order things appear in the list.
 *
 * Dragging is the point of it on a pointer device, but it is not the only way
 * in: the arrows do the same job for a keyboard, for touch, and for anyone who
 * would rather nudge a row than aim at one. dnd-kit's keyboard sensor also
 * makes the drag itself reachable without a mouse.
 *
 * The order is saved on request rather than on every drop — a drag is a rough
 * gesture and often takes two or three tries to land, which would otherwise be
 * two or three requests.
 */
export const ReorderItemsDialog = ({
  isOpen,
  setIsOpen,
  bucketListId,
  items,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  bucketListId: string;
  items: BucketListItem[];
}) => {
  const { toast } = useToast();
  const [ordered, setOrdered] = useState(items);

  const { mutate: saveOrder, isPending } = useReorderBucketListItems(bucketListId);

  // Opening again starts from the order as it stands, not the one left behind
  // by a run that was cancelled
  useEffect(() => {
    if (isOpen) setOrdered(items);
  }, [isOpen, items]);

  const sensors = useSensors(
    // A few pixels of travel first, so a press that was meant as a tap is not
    // read as a drag
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= ordered.length) return;
    setOrdered((current) => arrayMove(current, from, to));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const from = ordered.findIndex((item) => item.id === active.id);
    const to = ordered.findIndex((item) => item.id === over.id);
    if (from !== -1 && to !== -1) move(from, to);
  };

  const hasMoved = ordered.some((item, index) => items[index]?.id !== item.id);

  const handleSave = () =>
    saveOrder(
      ordered.map((item) => item.id),
      {
        onSuccess: () => {
          setIsOpen(false);
          toast({ title: 'Order saved', variant: 'success' });
        },
        onError: (error: Error) =>
          toast({
            title: 'Could not save this order',
            description: error.message,
            variant: 'destructive',
          }),
      },
    );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] max-w-[520px] gap-0 overflow-y-auto rounded-2xl p-5 md:max-w-[520px]">
        <DialogTitle className="text-base font-semibold text-gray-900">Reorder items</DialogTitle>
        <DialogDescription className="mt-1 text-xs text-gray-500">
          Drag a row, or use the arrows, to set the order items appear in this bucket list.
        </DialogDescription>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={ordered.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="mt-4 divide-y divide-gray-100">
              {ordered.map((item, index) => (
                <ReorderRow
                  key={item.id}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === ordered.length - 1}
                  onUp={() => move(index, index - 1)}
                  onDown={() => move(index, index + 1)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs font-medium text-destructive hover:text-destructive/80"
          >
            Cancel
          </button>
          <Button
            variant="lime"
            isLoading={isPending}
            // Nothing moved, so there is nothing to send
            disabled={!hasMoved}
            onClick={handleSave}
            className="rounded-full"
          >
            Save order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ReorderRow = ({
  item,
  isFirst,
  isLast,
  onUp,
  onDown,
}: {
  item: BucketListItem;
  isFirst: boolean;
  isLast: boolean;
  onUp: () => void;
  onDown: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const name = bucketListItemName(item);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-3 bg-white py-3', isDragging && 'opacity-50 shadow-lg')}
    >
      {/* The row itself is the drag handle; the arrows below stay pressable */}
      <div
        {...attributes}
        {...listeners}
        className="flex min-w-0 flex-1 cursor-grab items-center gap-3 active:cursor-grabbing"
      >
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <PhotoImage
            src={bucketListItemPhoto(item)}
            alt={name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{name}</p>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <ArrowButton
          label={`Move ${name} up`}
          disabled={isFirst}
          onClick={onUp}
          icon="ArrowUp01Icon"
        />
        <ArrowButton
          label={`Move ${name} down`}
          disabled={isLast}
          onClick={onDown}
          icon="ArrowDown01Icon"
        />
      </div>
    </li>
  );
};

const ArrowButton = ({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: string;
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200 disabled:opacity-40"
  >
    <IconComponent iconName={icon} color="currentColor" size={18} />
  </button>
);
