'use client';

import { useEffect, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useGetInterestCategories, useUpdateMyProfile } from '@/app/shared/hooks/useAuth';
import { useToast } from '@/app/shared/hooks/useToast';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

const sameIds = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().every((id, index) => id === [...b].sort()[index]);

export const EditInterestsDrawer = ({
  interests,
  userId,
  isOpen,
  onClose,
}: {
  interests: { id: string; name?: string; title?: string }[];
  userId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const { data: categories, isLoading } = useGetInterestCategories();
  const { mutate: save, isPending } = useUpdateMyProfile(userId);

  const saved = interests.map((interest) => interest.id);
  const [selected, setSelected] = useState<string[]>(saved);

  // The drawer stays mounted between openings, so selection follows the profile
  useEffect(() => {
    if (isOpen) setSelected(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const changed = !sameIds(selected, saved);
  const ready = changed && selected.length > 0;

  const close = () => {
    setSelected(saved);
    onClose();
  };

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  const submit = () => {
    if (!ready) return;

    save(
      { interestIds: selected },
      {
        onSuccess: () => {
          toast({ title: 'Your interests are updated.', variant: 'success' });
          onClose();
        },
        onError: (failure: Error) =>
          toast({ title: 'Could not save', description: failure.message, variant: 'destructive' }),
      },
    );
  };

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && close()} ariaLabel="Interests">
      <div className="flex min-h-full flex-col">
        <div className="flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-[24px] font-bold tracking-[-0.4px] text-gray-900">
            Interests
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-danger transition-colors hover:bg-danger-surface"
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 px-6 pb-9 pt-5">
          <p className="text-[13.5px] leading-[1.4] text-ink-muted">
            Pick what you are into - it shapes what shows up for you.
          </p>

          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-11 w-24 animate-pulse rounded-full bg-gray-100" />
              ))}
            </div>
          ) : (
            <div role="group" aria-label="Interests" className="flex flex-wrap gap-2">
              {(categories ?? []).map((category: { id: string; name: string; icon?: string }) => {
                const on = selected.includes(category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(category.id)}
                    className={cn(
                      'inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[14.5px] font-medium transition-colors active:scale-[0.98]',
                      on ? 'bg-brand text-white' : 'bg-surface text-gray-900 hover:bg-surface-brand',
                    )}
                  >
                    {category.icon && (
                      <IconComponent iconName={category.icon} size={16} color="currentColor" />
                    )}
                    {category.name}
                  </button>
                );
              })}
            </div>
          )}

          {changed && selected.length === 0 && (
            <p role="alert" className="text-[13.5px] leading-[1.45] text-danger">
              Pick at least one interest.
            </p>
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
          <button
            type="button"
            onClick={close}
            className="h-12 px-1.5 text-[15px] font-medium text-danger hover:underline"
          >
            Cancel
          </button>

          <span aria-hidden="true" className="flex-1" />

          <button
            type="button"
            onClick={submit}
            disabled={!ready || isPending}
            aria-disabled={!ready}
            className="h-12 whitespace-nowrap rounded-full bg-lime px-6 text-[15px] font-semibold text-brand-ink enabled:hover:bg-lime-dark disabled:bg-[#E4F4B5] disabled:text-[#5E7A45]"
          >
            Save changes
          </button>
        </div>
      </div>
    </Drawer>
  );
};
