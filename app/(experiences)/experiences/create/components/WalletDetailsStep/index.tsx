'use client';

import { useToast } from '@/app/shared/hooks/useToast';
import { BankAccountFormValues } from '@/components/ui/bank-account-details-form';
import { Wallet } from '@/types/payment';

import type { FormData } from '../../hooks/useCreateExperienceFlow';
import { CreateExperienceWallet } from '../wallet';

interface WalletDetailsStepProps {
  formData: FormData['wallet'];
  onChange: (data: Partial<FormData['wallet']>) => void;
  errors: Record<string, string>;
  wallets: Wallet[];
  isWalletsLoading: boolean;
  walletMutations: {
    createBankWallet: (data: any, callbacks: any) => void;
    isCreatingBankWallet: boolean;
    createPhoneWallet: (data: any, callbacks: any) => void;
    isCreatingPhoneWallet: boolean;
    patchBankWallet: (data: any, callbacks: any) => void;
    isPatchingBankWallet: boolean;
    patchPhoneWallet: (data: any, callbacks: any) => void;
    isPatchingPhoneWallet: boolean;
  };
  onPreviewAndPublish: () => void;
  onSaveAndExit?: () => void;
}

export const WalletDetailsStep = ({
  formData,
  onChange,
  errors,
  wallets,
  isWalletsLoading,
  walletMutations,
  onPreviewAndPublish,
  onSaveAndExit,
}: WalletDetailsStepProps) => {
  const { toast } = useToast();

  const handleCreatePhoneWallet = (phone: string) => {
    walletMutations.createPhoneWallet(
      { phone },
      {
        onSuccess: () => {
          toast({
            title: 'Wallet saved',
            description: 'Your M-Pesa wallet has been set up successfully.',
            variant: 'success',
          });
          onChange({ phoneNumber: '' });
        },
        onError: (error: Error) => {
          toast({
            title: 'Unable to save wallet',
            description: error.message || 'Please try again.',
            variant: 'destructive',
          });
        },
      },
    );
  };

  const handlePatchPhoneWallet = (walletId: string, phone: string) => {
    walletMutations.patchPhoneWallet(
      { walletId, phone },
      {
        onSuccess: () => {
          toast({
            title: 'Wallet updated',
            description: 'Your M-Pesa wallet has been updated successfully.',
            variant: 'success',
          });
          onChange({ phoneNumber: '' });
        },
        onError: (error: Error) => {
          toast({
            title: 'Unable to update wallet',
            description: error.message || 'Please try again.',
            variant: 'destructive',
          });
        },
      },
    );
  };

  const handleCreateBankWallet = (
    values: BankAccountFormValues,
    options?: { onSuccess?: () => void },
  ) => {
    walletMutations.createBankWallet(
      {
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        accountHolderName: values.accountHolderName,
        bankBranch: values.bankBranch,
        branchCode: values.branchCode,
        country: values.country,
        swiftCode: values.swiftCode,
        address: values.address,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Wallet saved',
            description: 'Your bank wallet has been set up successfully.',
            variant: 'success',
          });
          options?.onSuccess?.();
        },
        onError: (error: Error) => {
          toast({
            title: 'Unable to save wallet',
            description: error.message || 'Please try again.',
            variant: 'destructive',
          });
        },
      },
    );
  };

  const handlePatchBankWallet = (
    walletId: string,
    values: BankAccountFormValues,
    options?: { onSuccess?: () => void },
  ) => {
    walletMutations.patchBankWallet(
      {
        walletId,
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        accountHolderName: values.accountHolderName,
        bankBranch: values.bankBranch,
        branchCode: values.branchCode,
        country: values.country,
        swiftCode: values.swiftCode,
        address: values.address,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Wallet updated',
            description: 'Your bank wallet has been updated successfully.',
            variant: 'success',
          });
          options?.onSuccess?.();
        },
        onError: (error: Error) => {
          toast({
            title: 'Unable to update wallet',
            description: error.message || 'Please try again.',
            variant: 'destructive',
          });
        },
      },
    );
  };

  return (
    <CreateExperienceWallet
      wallets={wallets}
      isWalletsLoading={isWalletsLoading}
      selectedWallet={formData.selectedWallet}
      onSelectedWalletChange={(selectedWallet: Wallet) => onChange({ selectedWallet })}
      paymentMethod={formData.paymentMethod}
      onPaymentMethodChange={(method) => onChange({ paymentMethod: method })}
      phoneNumber={formData.phoneNumber}
      onPhoneNumberChange={(phone: string) => onChange({ phoneNumber: phone })}
      onCreatePhoneWallet={handleCreatePhoneWallet}
      isCreatingPhoneWallet={walletMutations.isCreatingPhoneWallet}
      onPatchPhoneWallet={handlePatchPhoneWallet}
      isPatchingPhoneWallet={walletMutations.isPatchingPhoneWallet}
      onCreateBankWallet={handleCreateBankWallet}
      isCreatingBankWallet={walletMutations.isCreatingBankWallet}
      onPatchBankWallet={handlePatchBankWallet}
      isPatchingBankWallet={walletMutations.isPatchingBankWallet}
      onPreviewAndPublish={onPreviewAndPublish}
      onSaveAndExit={onSaveAndExit}
    />
  );
};
