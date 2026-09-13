'use client';

import { useState } from 'react';

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

type MpesaDetailsFormProps = {
  phone: string;
  onPhoneChange: (value: string) => void;
  onSaveDetails: () => void;
  isSaving?: boolean;
  onCancel?: () => void;
  showCancel?: boolean;
};

export function MpesaDetailsForm({
  phone,
  onPhoneChange,
  onSaveDetails,
  isSaving = false,
  onCancel,
  showCancel = false,
}: MpesaDetailsFormProps) {
  const [country, setCountry] = useState('');
  const [postcode, setPostcode] = useState('');
  const [townCity, setTownCity] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; country?: string; townCity?: string }>({});

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const isValid =
      digits.length === 9 ||
      (digits.startsWith('0') && digits.length === 10) ||
      (digits.startsWith('254') && digits.length === 12);
    return isValid;
  };

  const handleSubmit = () => {
    const nextErrors: { phone?: string; country?: string; townCity?: string } = {};

    if (!phone.trim()) {
      nextErrors.phone = 'M-Pesa phone number is required.';
    } else if (!validatePhone(phone)) {
      nextErrors.phone = 'Enter a valid Kenyan number (e.g. 0712345678).';
    }

    if (!country) {
      nextErrors.country = 'Country is required.';
    }

    if (!townCity.trim()) {
      nextErrors.townCity = 'Town/City is required.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSaveDetails();
  };

  return (
    <div className="mt-6">
      <h3 className="text-xs font-semibold text-gray-800">Add your MPesa details</h3>

      <div className="mb-4 mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-gray-800">
        <span className="font-semibold">Kindly Note:</span> Amounts exceeding Ksh 500,000.00 may not
        be sent via M-Pesa. For experiences with expected large amount of ticket sales, please use a
        bank account.
      </div>

      <Input
        type="text"
        placeholder="Enter M-Pesa number"
        className="text-sm"
        value={phone}
        onChange={(event) => {
          onPhoneChange(event.target.value);
          if (errors.phone) {
            setErrors((prev) => ({ ...prev, phone: undefined }));
          }
        }}
        icon={
          <span className="inline-flex items-center gap-3">
            <IconComponent iconName="CallIcon" size={18} color="#374151" />
            {/* A hairline rather than a `|` glyph: at text-xl the character
                carried a 28px line box and made this field taller than the
                ones around it */}
            <span className="h-4 w-px flex-shrink-0 bg-gray-200" />
            <span className="text-sm text-gray-800">+254</span>
          </span>
        }
      />
      {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}

      <h4 className="mt-6 text-sm font-semibold text-gray-800">Billing Address</h4>

      <div className="mt-3">
        <Select
          value={country}
          onValueChange={(value) => {
            setCountry(value);
            if (errors.country) {
              setErrors((prev) => ({ ...prev, country: undefined }));
            }
          }}
        >
          <SelectTrigger
            // 44px and a 14px radius, matching the Input fields around it —
            // the trigger's own defaults are 50px and rounded-lg
            className="h-11 rounded-[14px] text-sm shadow-none data-[placeholder]:text-sm data-[placeholder]:text-gray-400"
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
      {errors.country ? <p className="mt-1 text-xs text-red-600">{errors.country}</p> : null}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          type="text"
          placeholder="Postcode"
          className="text-sm"
          value={postcode}
          onChange={(event) => setPostcode(event.target.value)}
          suffixIcon={<IconComponent iconName="Calendar01Icon" size={18} color="#374151" />}
        />

        <Input
          type="text"
          placeholder="Town/City"
          className="text-sm"
          value={townCity}
          onChange={(event) => {
            setTownCity(event.target.value);
            if (errors.townCity) {
              setErrors((prev) => ({ ...prev, townCity: undefined }));
            }
          }}
          suffixIcon={<IconComponent iconName="Location01Icon" size={18} color="#374151" />}
        />
      </div>
      {errors.townCity ? <p className="mt-1 text-xs text-red-600">{errors.townCity}</p> : null}

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
          className="rounded-full px-6 text-xs font-semibold text-white"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Details'}
        </Button>
      </div>
    </div>
  );
}
