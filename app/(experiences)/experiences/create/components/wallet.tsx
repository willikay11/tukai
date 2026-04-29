'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { WalletListSkeleton } from '@/app/shared/components/Cards';
import {
  BankAccountDetailsForm,
  BankAccountFormValues,
} from '@/components/ui/bank-account-details-form';
import { Button } from '@/components/ui/button';
import { MpesaDetailsForm } from '@/components/ui/mpesa-details-form';
import {
  useCreateBankWallet,
  useCreatePhoneWallet,
  useGetWallets,
  usePatchBankWallet,
  usePatchPhoneWallet,
} from '@/app/(experiences)/hooks/usePayment';
import { useToast } from '@/app/shared/hooks/useToast';
import { Wallet } from '@/types/payment';

type PaymentMethod = 'mpesa' | 'bank_account';

interface CreateExperienceWalletProps {
  cancelActionLabel?: string;
  saveAndExitActionLabel?: string;
  previewAndPublishActionLabel?: string;
  hideSaveAndExit?: boolean;
}

export const CreateExperienceWallet = ({
  cancelActionLabel = 'Cancel',
  saveAndExitActionLabel = 'Save & Exit',
  previewAndPublishActionLabel = 'Preview & Publish',
  hideSaveAndExit = false,
}: CreateExperienceWalletProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const experienceId = searchParams.get('experienceId');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [showForm, setShowForm] = useState(false);
  const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState('');
  const { toast } = useToast();

  const { data: walletsResponse, isLoading: isWalletsLoading } = useGetWallets();
  const { mutate: createBankWallet, isPending: isCreatingBankWallet } = useCreateBankWallet();
  const { mutate: createPhoneWallet, isPending: isCreatingPhoneWallet } = useCreatePhoneWallet();
  const { mutate: patchBankWallet, isPending: isPatchingBankWallet } = usePatchBankWallet();
  const { mutate: patchPhoneWallet, isPending: isPatchingPhoneWallet } = usePatchPhoneWallet();

  const wallets: Wallet[] = walletsResponse?.data?.results ?? [];
  const hasSavedWallets = wallets.length > 0;
  const existingPhoneWallet = wallets.find((wallet) => wallet.walletType === 'phone');
  const defaultWalletId = wallets.find((wallet) => wallet.isActive)?.id ?? null;
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(defaultWalletId);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setShowForm(true);
    if (wallet.walletType === 'phone') {
      setPaymentMethod('mpesa');
      setMpesaPhoneNumber(wallet.phone ?? '');
    } else {
      setPaymentMethod('bank_account');
    }
  };

  const maskPhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return phone;
    const visible = digits.slice(-4);
    const masked = '*'.repeat(digits.length - 4);
    const maskedStr = masked + visible;
    return maskedStr.replace(/(\*{4}|\d{4})/g, '$1 ').trim();
  };

  const formatKenyanPhoneNumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '');

    if (!numbersOnly) {
      return '';
    }

    if (numbersOnly.startsWith('254')) {
      return `+${numbersOnly}`;
    }

    if (numbersOnly.startsWith('0')) {
      return `+254${numbersOnly.slice(1)}`;
    }

    return `+254${numbersOnly}`;
  };

  const handleSavePhoneWallet = () => {
    const formattedPhoneNumber = formatKenyanPhoneNumber(mpesaPhoneNumber);

    if (!formattedPhoneNumber) {
      toast({
        title: 'Phone number required',
        description: 'Enter your M-Pesa phone number before saving.',
        variant: 'destructive',
      });
      return;
    }

    const onSuccess = () => {
      setMpesaPhoneNumber('');
      toast({
        title: 'Wallet saved',
        description: 'Your M-Pesa wallet has been set up successfully.',
        variant: 'success',
      });
    };

    const onError = (error: Error) => {
      toast({
        title: 'Unable to save wallet',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    };

    if (existingPhoneWallet?.id) {
      patchPhoneWallet(
        { walletId: existingPhoneWallet.id, phone: formattedPhoneNumber },
        { onSuccess, onError },
      );
      return;
    }

    createPhoneWallet({ phone: formattedPhoneNumber }, { onSuccess, onError });
  };

  const handleSaveBankWallet = (values: BankAccountFormValues) => {
    if (!values.country || !values.bankName || !values.accountNumber || !values.accountHolderName) {
      toast({
        title: 'Missing bank details',
        description: 'Please fill in country, bank name, account number and account name.',
        variant: 'destructive',
      });
      return;
    }

    const onSuccess = () => {
      toast({
        title: 'Wallet saved',
        description: 'Your bank wallet has been set up successfully.',
        variant: 'success',
      });
    };

    const onError = (error: Error) => {
      toast({
        title: 'Unable to save wallet',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    };

    if (editingWallet?.walletType === 'bank' && editingWallet.id) {
      patchBankWallet(
        {
          walletId: editingWallet.id,
          bankName: values.bankName,
          accountNumber: values.accountNumber,
          accountHolderName: values.accountHolderName,
          bankBranch: values.bankBranch,
          branchCode: values.branchCode,
          country: values.country,
          swiftCode: values.swiftCode,
          address: values.address,
        },
        { onSuccess, onError },
      );
      return;
    }

    createBankWallet(
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
      { onSuccess, onError },
    );
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingWallet(null);
  };

  const handlePreviewAndPublish = () => {
    if (!experienceId) {
      toast({
        title: 'Experience missing',
        description: 'Save your experience details before previewing.',
        variant: 'destructive',
      });
      return;
    }

    router.push(`/experiences/review/${experienceId}`);
  };

  return (
    <div className="w-full bg-white">
      <h1 className="text-base font-semibold leading-tight text-gray-900">
        Set-up your account/wallet
      </h1>

      <p className="mt-4 text-xs text-gray-800">
        Add your preferred payment/account details. The money from the ticket sales will be sent to
        this account.
      </p>

      <p className="mt-4 text-xs text-gray-800">Select your preferred method of payment</p>

      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-800">Set up wallets</p>
        {isWalletsLoading ? (
          <WalletListSkeleton />
        ) : wallets.length > 0 ? (
          <div className="mt-2 grid grid-cols-2">
            <div className="space-y-2">
              {wallets.map((w) => (
                <div key={w.id} className="flex items-start gap-3 py-2">
                  <button
                    type="button"
                    onClick={() => setSelectedWalletId(w.id)}
                    className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      selectedWalletId === w.id ? 'border-emerald-700' : 'border-gray-400'
                    }`}
                  >
                    {selectedWalletId === w.id && (
                      <span className="h-2 w-2 rounded-full bg-emerald-700" />
                    )}
                  </button>

                  <div className="flex-1 text-xs text-gray-800">
                    {w.walletType === 'phone' ? (
                      <>
                        <p className="font-normal">M-Pesa</p>
                        <p className="mt-0.5 text-gray-600">{maskPhoneNumber(w.phone ?? '')}</p>
                        {w.country ? <p className="mt-0.5 text-gray-600">{w.country}</p> : null}
                      </>
                    ) : (
                      <>
                        {w.accountHolderName ? (
                          <p className="font-normal">{w.accountHolderName}</p>
                        ) : null}
                        {w.bankName ? (
                          <p className="mt-0.5 text-gray-600">
                            {w.bankName}
                            {w.bankBranch ? `, ${w.bankBranch}` : ''}
                          </p>
                        ) : null}
                        {w.accountNumber ? (
                          <p className="mt-0.5 text-gray-600">
                            {'**** **** **** ' + w.accountNumber.slice(-4)}
                          </p>
                        ) : null}
                        {w.country ? <p className="mt-0.5 text-gray-600">{w.country}</p> : null}
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEditWallet(w)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IconComponent iconName="Edit02Icon" size={16} className="text-primary" />
                  </button>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => {
                  setEditingWallet(null);
                  setShowForm(true);
                }}
                className="rounded-full border-primary px-6 text-xs font-semibold text-primary"
              >
                <IconComponent iconName="AddCircleIcon" size={16} color="currentColor" />
                Add New Account
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-gray-600">No wallet set up yet.</p>
        )}
      </div>

      {!isWalletsLoading && (wallets.length === 0 || showForm) && (
        <>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('mpesa')}
              className={`inline-flex items-center gap-3 rounded-xl px-4 py-3 text-xs transition-colors ${
                paymentMethod === 'mpesa'
                  ? 'bg-emerald-100 text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  paymentMethod === 'mpesa' ? 'border-emerald-700' : 'border-gray-500'
                }`}
              >
                {paymentMethod === 'mpesa' ? (
                  <span className="h-2 w-2 rounded-full bg-emerald-700" />
                ) : null}
              </span>
              <img src="/images/mpesa.png" alt="M-Pesa" className="h-5 w-auto" />
              <span>M-Pesa</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bank_account')}
              className={`inline-flex items-center gap-3 rounded-xl px-4 py-3 text-xs transition-colors ${
                paymentMethod === 'bank_account'
                  ? 'bg-emerald-100 text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  paymentMethod === 'bank_account' ? 'border-emerald-700' : 'border-gray-500'
                }`}
              >
                {paymentMethod === 'bank_account' ? (
                  <span className="h-2 w-2 rounded-full bg-emerald-700" />
                ) : null}
              </span>
              <IconComponent iconName="Money03Icon" size={18} color="#1F2937" />
              <span>Bank Account</span>
            </button>
          </div>

          {paymentMethod === 'mpesa' ? (
            <MpesaDetailsForm
              phone={mpesaPhoneNumber}
              onPhoneChange={setMpesaPhoneNumber}
              onSaveDetails={handleSavePhoneWallet}
              isSaving={isCreatingPhoneWallet || isPatchingPhoneWallet}
              onCancel={handleCancelForm}
              showCancel={hasSavedWallets}
            />
          ) : null}
          {paymentMethod === 'bank_account' ? (
            <BankAccountDetailsForm
              defaultValues={
                editingWallet?.walletType === 'bank'
                  ? {
                      country: editingWallet.country,
                      bankName: editingWallet.bankName,
                      bankBranch: editingWallet.bankBranch,
                      branchCode: editingWallet.branchCode,
                      accountHolderName: editingWallet.accountHolderName,
                      accountNumber: editingWallet.accountNumber,
                      swiftCode: editingWallet.swiftCode,
                    }
                  : undefined
              }
              onSaveDetails={handleSaveBankWallet}
              isSaving={isCreatingBankWallet || isPatchingBankWallet}
              onCancel={handleCancelForm}
              showCancel={hasSavedWallets}
            />
          ) : null}
        </>
      )}

      {!isWalletsLoading && wallets.length > 0 && !showForm ? (
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="destructive"
            type="button"
            className="bg-white p-0 text-sm text-red-500 hover:bg-white hover:text-red-600"
          >
            {cancelActionLabel}
          </Button>

          <div className="flex gap-3">
            {!hideSaveAndExit && (
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-primary px-6 text-xs font-semibold text-primary"
              >
                {saveAndExitActionLabel}
              </Button>
            )}
            <Button
              type="button"
              variant="gradient"
              className="rounded-full px-6 text-xs font-semibold text-white"
              onClick={handlePreviewAndPublish}
            >
              {previewAndPublishActionLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
