'use client';

import { useState } from 'react';

import IconComponent from '@/app/components/iconComponent';
import { BankAccountDetailsForm } from '@/components/ui/bank-account-details-form';
import { Button } from '@/components/ui/button';
import { MpesaDetailsForm } from '@/components/ui/mpesa-details-form';

type PaymentMethod = 'mpesa' | 'bank_account';

export default function CreateExperienceWallet() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');

  return (
    <div className="w-full bg-white">
      <h1 className="text-base font-semibold leading-tight text-gray-900">
        Set-up your account/wallet
      </h1>

      <p className="mt-4 text-xs text-gray-800">
        Add your preferred payment/account details. The money from the ticket sales will be sent to
        this account.
      </p>

      <p className="mt-4 text-xs font-semibold text-gray-800">
        Select your preferred method of payment
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setPaymentMethod('mpesa')}
          className={`inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
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
          className={`inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
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

      {paymentMethod === 'mpesa' ? <MpesaDetailsForm /> : null}
      {paymentMethod === 'bank_account' ? <BankAccountDetailsForm /> : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button type="button" className="text-sm text-red-500 hover:text-red-600">
          Cancel
        </button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-primary px-6 text-xs font-semibold text-primary"
          >
            Save &amp; Exit
          </Button>
          <Button
            type="button"
            variant="gradient"
            className="rounded-full px-6 text-xs font-semibold text-white"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
