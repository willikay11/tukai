'use client';

import { useEffect, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type BankAccountFormValues = {
  country: string;
  bankName: string;
  bankBranch: string;
  branchCode: string;
  accountHolderName: string;
  accountNumber: string;
  swiftCode: string;
  address: string;
};

type BankAccountDetailsFormProps = {
  defaultValues?: {
    country?: string;
    bankName?: string;
    bankBranch?: string;
    branchCode?: string;
    accountHolderName?: string;
    accountNumber?: string;
    swiftCode?: string;
    address?: string;
  };
  onSaveDetails: (values: BankAccountFormValues) => void;
  isSaving?: boolean;
  onCancel?: () => void;
  showCancel?: boolean;
};

export function BankAccountDetailsForm({
  defaultValues,
  onSaveDetails,
  isSaving = false,
  onCancel,
  showCancel = false,
}: BankAccountDetailsFormProps) {
  const [accountCountry, setAccountCountry] = useState(defaultValues?.country ?? '');
  const [billingCountry, setBillingCountry] = useState(defaultValues?.country ?? '');
  const [bankName, setBankName] = useState(defaultValues?.bankName ?? '');
  const [bankBranch, setBankBranch] = useState(defaultValues?.bankBranch ?? '');
  const [branchCode, setBranchCode] = useState(defaultValues?.branchCode ?? '');
  const [accountHolderName, setAccountHolderName] = useState(
    defaultValues?.accountHolderName ?? '',
  );
  const [accountNumber, setAccountNumber] = useState(defaultValues?.accountNumber ?? '');
  const [swiftCode, setSwiftCode] = useState(defaultValues?.swiftCode ?? '');
  const [postcode, setPostcode] = useState('');
  const [townCity, setTownCity] = useState(defaultValues?.address ?? '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<{
    accountCountry?: string;
    bankName?: string;
    bankBranch?: string;
    branchCode?: string;
    accountHolderName?: string;
    accountNumber?: string;
    billingCountry?: string;
    townCity?: string;
  }>({});

  useEffect(() => {
    setAccountCountry(defaultValues?.country ?? '');
    setBillingCountry(defaultValues?.country ?? '');
    setBankName(defaultValues?.bankName ?? '');
    setBankBranch(defaultValues?.bankBranch ?? '');
    setBranchCode(defaultValues?.branchCode ?? '');
    setAccountHolderName(defaultValues?.accountHolderName ?? '');
    setAccountNumber(defaultValues?.accountNumber ?? '');
    setSwiftCode(defaultValues?.swiftCode ?? '');
    setTownCity(defaultValues?.address ?? '');
    setPostcode('');
    setPhoneNumber('');
    setErrors({});
  }, [defaultValues]);

  const handleSave = () => {
    const nextErrors: {
      accountCountry?: string;
      bankName?: string;
      bankBranch?: string;
      branchCode?: string;
      accountHolderName?: string;
      accountNumber?: string;
      billingCountry?: string;
      townCity?: string;
    } = {};

    if (!accountCountry) nextErrors.accountCountry = 'Country is required.';
    if (!bankName.trim()) nextErrors.bankName = 'Bank name is required.';
    if (!bankBranch.trim()) nextErrors.bankBranch = 'Branch is required.';
    if (!branchCode.trim()) nextErrors.branchCode = 'Branch code is required.';
    if (!accountHolderName.trim()) nextErrors.accountHolderName = 'Account name is required.';
    if (!accountNumber.trim()) {
      nextErrors.accountNumber = 'Account number is required.';
    } else if (!/^\d{6,20}$/.test(accountNumber.trim())) {
      nextErrors.accountNumber = 'Account number must be 6-20 digits.';
    }
    if (!billingCountry) nextErrors.billingCountry = 'Billing country is required.';
    if (!townCity.trim()) nextErrors.townCity = 'Town/City is required.';

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const address = [townCity.trim(), postcode.trim()].filter(Boolean).join(', ');
    onSaveDetails({
      country: accountCountry,
      bankName: bankName.trim(),
      bankBranch: bankBranch.trim(),
      branchCode: branchCode.trim(),
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      swiftCode: swiftCode.trim(),
      address,
    });
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-800">Add your bank account details</h3>

      <div className="mt-3">
        <Select
          value={accountCountry}
          onValueChange={(value) => {
            setAccountCountry(value);
            if (errors.accountCountry) {
              setErrors((prev) => ({ ...prev, accountCountry: undefined }));
            }
          }}
        >
          <SelectTrigger
            className="h-[50px] text-sm shadow-none data-[placeholder]:text-sm data-[placeholder]:text-gray-400"
            prefixIcon={<IconComponent iconName="Location01Icon" size={18} color="#374151" />}
          >
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Kenya">Kenya</SelectItem>
            <SelectItem value="Uganda">Uganda</SelectItem>
            <SelectItem value="Tanzania">Tanzania</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {errors.accountCountry ? (
        <p className="mt-1 text-xs text-red-600">{errors.accountCountry}</p>
      ) : null}

      <div className="mt-3">
        <Input
          type="text"
          placeholder="Bank Name"
          className="text-sm"
          value={bankName}
          onChange={(e) => {
            setBankName(e.target.value);
            if (errors.bankName) {
              setErrors((prev) => ({ ...prev, bankName: undefined }));
            }
          }}
          suffixIcon={<IconComponent iconName="Location01Icon" size={18} color="#374151" />}
        />
      </div>
      {errors.bankName ? <p className="mt-1 text-xs text-red-600">{errors.bankName}</p> : null}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          type="text"
          placeholder="Branch"
          className="text-sm"
          value={bankBranch}
          onChange={(e) => {
            setBankBranch(e.target.value);
            if (errors.bankBranch) {
              setErrors((prev) => ({ ...prev, bankBranch: undefined }));
            }
          }}
          suffixIcon={<IconComponent iconName="Location01Icon" size={18} color="#374151" />}
        />
        <Input
          type="text"
          placeholder="Branch Code"
          className="text-sm"
          value={branchCode}
          onChange={(e) => {
            setBranchCode(e.target.value);
            if (errors.branchCode) {
              setErrors((prev) => ({ ...prev, branchCode: undefined }));
            }
          }}
          suffixIcon={<IconComponent iconName="Calendar01Icon" size={18} color="#374151" />}
        />
      </div>
      {errors.bankBranch ? <p className="mt-1 text-xs text-red-600">{errors.bankBranch}</p> : null}
      {errors.branchCode ? <p className="mt-1 text-xs text-red-600">{errors.branchCode}</p> : null}

      <div className="mt-3">
        <Input
          type="text"
          placeholder="Account Name"
          className="text-sm"
          value={accountHolderName}
          onChange={(e) => {
            setAccountHolderName(e.target.value);
            if (errors.accountHolderName) {
              setErrors((prev) => ({ ...prev, accountHolderName: undefined }));
            }
          }}
          suffixIcon={<IconComponent iconName="UserIcon" size={18} color="#374151" />}
        />
      </div>
      {errors.accountHolderName ? (
        <p className="mt-1 text-xs text-red-600">{errors.accountHolderName}</p>
      ) : null}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          type="text"
          placeholder="Account Number"
          className="text-sm"
          value={accountNumber}
          onChange={(e) => {
            setAccountNumber(e.target.value);
            if (errors.accountNumber) {
              setErrors((prev) => ({ ...prev, accountNumber: undefined }));
            }
          }}
          suffixIcon={<IconComponent iconName="Money03Icon" size={18} color="#374151" />}
        />
        <Input
          type="text"
          placeholder="SWIFT Code"
          className="text-sm"
          value={swiftCode}
          onChange={(e) => setSwiftCode(e.target.value)}
          suffixIcon={<IconComponent iconName="WalletAdd02Icon" size={18} color="#374151" />}
        />
      </div>
      {errors.accountNumber ? (
        <p className="mt-1 text-xs text-red-600">{errors.accountNumber}</p>
      ) : null}

      <h4 className="mt-6 text-sm font-semibold text-gray-800">Billing Address</h4>

      <div className="mt-3">
        <Select
          value={billingCountry}
          onValueChange={(value) => {
            setBillingCountry(value);
            if (errors.billingCountry) {
              setErrors((prev) => ({ ...prev, billingCountry: undefined }));
            }
          }}
        >
          <SelectTrigger
            className="h-[50px] text-sm shadow-none data-[placeholder]:text-sm data-[placeholder]:text-gray-400"
            prefixIcon={<IconComponent iconName="Location01Icon" size={18} color="#374151" />}
          >
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Kenya">Kenya</SelectItem>
            <SelectItem value="Uganda">Uganda</SelectItem>
            <SelectItem value="Tanzania">Tanzania</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {errors.billingCountry ? (
        <p className="mt-1 text-xs text-red-600">{errors.billingCountry}</p>
      ) : null}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          type="text"
          placeholder="Postcode"
          className="text-sm"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          suffixIcon={<IconComponent iconName="Calendar01Icon" size={18} color="#374151" />}
        />

        <Input
          type="text"
          placeholder="Town/City"
          className="text-sm"
          value={townCity}
          onChange={(e) => {
            setTownCity(e.target.value);
            if (errors.townCity) {
              setErrors((prev) => ({ ...prev, townCity: undefined }));
            }
          }}
          suffixIcon={<IconComponent iconName="Location01Icon" size={18} color="#374151" />}
        />
      </div>
      {errors.townCity ? <p className="mt-1 text-xs text-red-600">{errors.townCity}</p> : null}

      <h4 className="mt-6 text-sm font-semibold text-gray-800">Phone Number</h4>

      <div className="mt-3">
        <Input
          type="text"
          placeholder="Enter Phone Number"
          className="text-sm"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          icon={
            <span className="inline-flex items-center gap-3">
              <IconComponent iconName="CallIcon" size={18} color="#374151" />
              <span className="text-xl text-gray-300">|</span>
              <span className="text-sm text-gray-800">+254</span>
            </span>
          }
        />
      </div>

      <div className={`mt-6 flex ${showCancel ? 'justify-between' : 'justify-end'}`}>
        {showCancel ? (
          <Button
            variant="destructive"
            type="button"
            onClick={onCancel}
            className="bg-white p-0 text-sm text-red-500 hover:bg-white hover:text-red-600"
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="button"
          variant="gradient"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-full px-6 text-xs font-semibold text-white"
        >
          {isSaving ? 'Saving...' : 'Save Details'}
        </Button>
      </div>
    </div>
  );
}
