'use client';

import { IconComponent } from '@/app/components/iconComponent';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              <div className="inline-flex items-center justify-center">
                <div
                  className={cn(
                    'mr-2 flex h-7 w-7 items-center justify-center rounded-full p-1',
                    props.variant === 'success' ? 'bg-primary' : 'bg-destructive',
                  )}
                >
                  <IconComponent
                    iconName={props.variant === 'success' ? 'TickDouble01Icon' : 'Cancel01Icon'}
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
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
