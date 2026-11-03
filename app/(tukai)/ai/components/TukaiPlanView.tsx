/* eslint-disable @next/next/no-img-element */
'use client';

import { Fragment } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { toast } from '@/app/shared/hooks/useToast';
import { useBucketListDrawer } from '@/context/BucketListDrawerContext';
import type { TukaiItem, TukaiMessage } from '@/types/tukai';
import { stopRange } from '@/utils/tukai';
import { buildTukaiPlanPdf, tukaiPlanPdfName } from '@/utils/tukaiPlanPdf';

import { useSaveTukaiPlan } from '../hooks';

const downloadPdf = (message: TukaiMessage) => {
  if (!message.plan) return;
  const name = tukaiPlanPdfName(message.plan);
  try {
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${btoa(buildTukaiPlanPdf(message.plan, message.items ?? {}))}`;
    link.download = name;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => link.remove(), 1500);
    toast({ description: `Downloaded ${name}.` });
  } catch {
    toast({ description: 'Could not download the PDF. Try again.' });
  }
};

const ToolbarButton = ({
  label,
  icon,
  onClick,
  isDone,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  isDone?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full p-0 hover:bg-surface hover:text-brand ${
      isDone ? 'text-brand' : 'text-gray-800'
    }`}
  >
    <IconComponent iconName={icon} size={20} color="currentColor" />
  </button>
);

/**
 * A day-by-day plan: each day's stops with photo, number, name, note and
 * times, the tip, then the itinerary actions.
 *
 * ⚠️ Not built yet from the handoff (section 6): Edit itinerary, Share
 * itinerary (it needs a share link from the API), and the "Host this as an
 * experience" card, which needs Create experience to accept a prefilled
 * itinerary.
 */
export const TukaiPlanView = ({
  chatId,
  message,
  numbers,
  onOpenItem,
}: {
  chatId: string;
  message: TukaiMessage;
  numbers: Record<string, number>;
  onOpenItem: (item: TukaiItem | undefined) => void;
}) => {
  const plan = message.plan!;
  const items = message.items ?? {};
  const { save, isSaving } = useSaveTukaiPlan(chatId);
  const bucketLists = useBucketListDrawer();

  const actions = [
    { label: 'Download as PDF', icon: 'Download04Icon', onClick: () => downloadPdf(message) },
    message.savedListId
      ? {
          label: 'Saved. Open the list',
          icon: 'ShoppingBasketDone02Icon',
          onClick: () => bucketLists?.openBucketList(message.savedListId!),
          isDone: true,
        }
      : {
          label: 'Save as a private bucket list',
          icon: 'ShoppingBasketAdd02Icon',
          onClick: () => !isSaving && save(message),
        },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h3 className="m-0 text-pretty text-[19px] font-bold tracking-[-0.2px] text-gray-800">
        {plan.title}
      </h3>

      <div className="flex flex-col gap-8">
        {plan.days.map((day, di) => (
          <div key={di} className="flex flex-col gap-3.5">
            <h4 className="m-0 text-pretty text-lg font-semibold leading-[1.4] tracking-[-0.1px] text-gray-800">
              Day {di + 1}
              {day.title ? ` - ${day.title}` : ''}
            </h4>
            <div className="flex flex-col">
              <div aria-hidden="true" className="pb-2.5 text-[14.5px] font-semibold text-gray-800">
                Place &amp; time
              </div>
              {day.stops.map((stop, si) => {
                const item = items[stop.id];
                const number = numbers[stop.id];
                return (
                  <div key={`${stop.id}-${si}`} className="border-t border-line-shell py-1">
                    <button
                      type="button"
                      data-ai-card={stop.id}
                      onClick={() => onOpenItem(item)}
                      className="-mx-3 flex w-[calc(100%+24px)] items-start gap-3.5 rounded-xl p-3 text-left text-gray-800 hover:bg-shell"
                    >
                      <span className="relative h-16 w-16 flex-shrink-0">
                        {item?.photos[0] ? (
                          <img
                            src={item.photos[0]}
                            alt=""
                            loading="lazy"
                            className="block h-16 w-16 rounded-xl bg-surface-brand object-cover"
                          />
                        ) : (
                          <span className="block h-16 w-16 rounded-xl bg-surface-brand" />
                        )}
                        {number ? (
                          <span
                            aria-hidden="true"
                            className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-ink px-[5px] text-[11.5px] font-bold text-white"
                          >
                            {number}
                          </span>
                        ) : null}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-pretty text-[15px] leading-[1.6] text-ink-note">
                          <strong className="font-bold text-gray-800">
                            {item?.title ?? 'Stop'}
                          </strong>
                          {stop.note ? `: ${stop.note}` : ''}
                        </span>
                        <span className="text-sm font-medium tabular-nums leading-normal text-gray-800">
                          {stopRange(day.stops, si)}
                        </span>
                        {!stop.note && item?.sub && (
                          <span className="text-[13.5px] leading-[1.45] text-ink-muted">
                            {item.sub}
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {plan.tip && (
        <p className="m-0 text-pretty text-[15.5px] leading-[1.6] text-gray-800">{plan.tip}</p>
      )}

      <div
        role="toolbar"
        aria-label="Itinerary actions"
        className="-ml-2.5 -mt-3 flex flex-wrap items-center gap-0.5"
      >
        {actions.map((action, i) => (
          <Fragment key={action.label}>
            {i > 0 && (
              <span
                aria-hidden="true"
                className="h-1 w-1 flex-shrink-0 rounded-full bg-dot-profile"
              />
            )}
            <ToolbarButton {...action} />
          </Fragment>
        ))}
      </div>
    </div>
  );
};
