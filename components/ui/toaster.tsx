'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { cn } from '@/lib/utils';

/**
 * The canvas's toast: one dark pill, centred along the bottom edge. On a phone
 * it clears the bottom tab bar - 69px plus the home-indicator inset, and a
 * 15px gap - and from 720px it sits 26px up. The same spot and look as
 * `LocationToast`. Each variant keeps its icon, on the one pill.
 */
const TOAST_PILL =
  'w-max max-w-full justify-center rounded-full bg-brand-ink py-3.5 pl-[22px] pr-9 text-center text-sm leading-snug text-white shadow-[0_14px_34px_rgba(1,51,52,.3)]';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className={cn(TOAST_PILL, props.className)}>
            <div className="grid gap-1">
              <div className="inline-flex items-center justify-center">
                <div
                  className={cn(
                    'mr-2 flex h-7 w-7 items-center justify-center rounded-full p-1',
                    props.variant === 'success'
                      ? 'bg-primary'
                      : props.variant === 'destructive'
                        ? 'bg-red-500'
                        : 'bg-blue-500',
                  )}
                >
                  <IconComponent
                    iconName={
                      props.variant === 'success'
                        ? 'TickDouble01Icon'
                        : props.variant === 'destructive'
                          ? 'Cancel01Icon'
                          : 'AlertCircleIcon'
                    }
                    size={20}
                    color="white"
                  />
                </div>
                <div className="flex flex-col">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && <ToastDescription>{description}</ToastDescription>}
                </div>
              </div>
            </div>
            {action}
            <ToastClose className="right-2.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white group-[.destructive]:text-white/60 group-[.destructive]:hover:text-white" />
          </Toast>
        );
      })}
      <ToastViewport className="bottom-[calc(84px+env(safe-area-inset-bottom))] left-1/2 top-auto w-max max-w-[min(560px,calc(100vw-32px))] -translate-x-1/2 items-center gap-2 p-0 sm:right-auto sm:top-auto sm:flex-col min-[720px]:bottom-[26px] md:min-w-0 md:max-w-[min(560px,calc(100vw-32px))]" />
    </ToastProvider>
  );
}
