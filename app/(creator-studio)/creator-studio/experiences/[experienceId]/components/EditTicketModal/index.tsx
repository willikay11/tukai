'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { IconComponent } from '@/app/shared/components/Icons';
import { useUpdateExperienceTicket } from '@/app/shared/hooks/useExperiences';
import { toast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Ticket } from '@/types/ticket';

import { EditTicketValues, editTicketSchema, ticketQuantity, ticketsSoldFor } from './schema';

interface EditTicketModalProps {
  experienceId: string;
  ticket: Ticket | null;
  currency: string;
  onClose: () => void;
}

const Field = ({
  label,
  icon,
  children,
  error,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
  error?: string;
}) => (
  <div>
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 focus-within:border-primary">
      <IconComponent iconName={icon} size={18} color="currentColor" className="text-gray-400" />
      {children}
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export const EditTicketModal = ({
  experienceId,
  ticket,
  currency,
  onClose,
}: EditTicketModalProps) => {
  const soldCount = ticket ? ticketsSoldFor(ticket) : 0;
  const { mutate: updateTicket, isPending } = useUpdateExperienceTicket(
    experienceId,
    ticket?.id ?? '',
  );

  const { register, handleSubmit, reset, formState } = useForm<EditTicketValues>({
    resolver: zodResolver(editTicketSchema(soldCount)),
    defaultValues: { price: 0, quantity: 0 },
  });

  // Prefill when a ticket is chosen. This has to be an explicit reset rather
  // than useForm's `values` prop: that takes a fresh object every render, which
  // RHF reads as new data and resets the form, wiping validation errors as fast
  // as they appear.
  useEffect(() => {
    reset(
      ticket
        ? { price: Number(ticket.price) || 0, quantity: ticketQuantity(ticket) }
        : { price: 0, quantity: 0 },
    );
  }, [ticket, reset]);

  if (!ticket) return null;

  const onSubmit = (values: EditTicketValues) =>
    updateTicket(
      {
        experience: experienceId,
        // Locked in the UI, but the write serializer requires it
        name: ticket.name,
        quantity: values.quantity,
        price: String(values.price),
      },
      {
        onSuccess: () => {
          toast({
            title: 'Ticket updated',
            description: `${ticket.name} has been saved.`,
            variant: 'success',
          });
          onClose();
        },
        onError: () =>
          toast({
            title: 'Could not save',
            description: 'Your changes were not saved. Please try again.',
            variant: 'destructive',
          }),
      },
    );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl p-0">
        {/* noValidate: min/step attributes would make the browser block submit
            outright, so the schema's messages would never render */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-green-50">
              <IconComponent iconName="Ticket01Icon" size={22} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">Edit ticket</DialogTitle>
              <p className="mt-1 text-sm text-gray-500">Changes apply to tickets not yet sold.</p>
            </div>
          </div>

          {soldCount > 0 && (
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4">
              <IconComponent
                iconName="Alert01Icon"
                size={18}
                color="currentColor"
                className="mt-0.5 flex-shrink-0 text-amber-600"
              />
              <p className="text-sm font-medium text-amber-800">
                {soldCount} {soldCount === 1 ? 'ticket' : 'tickets'} already sold. Only the amount
                and quantity can be changed. The ticket name is locked.
              </p>
            </div>
          )}

          <div className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-600">Ticket Name</label>
              <div className="mt-2 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                <IconComponent
                  iconName="SquareLock02Icon"
                  size={18}
                  color="currentColor"
                  className="text-gray-400"
                />
                <span className="truncate text-gray-500">{ticket.name}</span>
              </div>
            </div>

            <Field
              label="Amount per ticket"
              icon="Money01Icon"
              error={formState.errors.price?.message}
            >
              <span className="text-gray-500">{currency}</span>
              <input
                type="number"
                step="any"
                aria-label="Amount per ticket"
                className="w-full bg-transparent outline-none"
                {...register('price', { valueAsNumber: true })}
              />
            </Field>

            <Field
              label="Available quantity"
              icon="Ticket01Icon"
              error={formState.errors.quantity?.message}
            >
              <input
                type="number"
                aria-label="Available quantity"
                className="w-full bg-transparent outline-none"
                {...register('quantity', { valueAsNumber: true })}
              />
            </Field>
            {/* The writable field is the total for this ticket type, so say so
                rather than letting a host cut it below what buyers hold */}
            {soldCount > 0 && (
              <p className="-mt-3 text-xs text-gray-400">
                Total for this ticket type, including the {soldCount} already sold.
              </p>
            )}
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <Button type="submit" disabled={isPending} className="rounded-full px-7 py-5">
              {isPending ? 'Saving…' : 'Save Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
