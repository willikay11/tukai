'use client';

import { SuccessDialog } from './successDialog';

export const PaymentSuccess = ({
  isOpen,
  closeModal,
}: {
  isOpen: boolean;
  closeModal: (goToInviteGuests: boolean) => void;
}) => (
  <SuccessDialog
    open={isOpen}
    onOpenChange={() => closeModal(false)}
    iconName="PaymentSuccess01TwotoneRounded"
    title="Payment Made Successfully"
    description="Your payment was made successfully."
    actionLabel="Close"
    onAction={() => closeModal(true)}
  />
);
