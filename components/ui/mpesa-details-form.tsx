'use client';

import { useState } from 'react';

import IconComponent from '@/app/components/iconComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function MpesaDetailsForm() {
  const [country, setCountry] = useState('');

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-800">Add your MPesa details</h3>

      <div className="mb-4 mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-gray-700">
        <span className="font-semibold">Kindly Note:</span> Amounts exceeding Ksh 500,000.00 may not
        be sent via M-Pesa. For experiences with expected large amount of ticket sales, please use a
        bank account.
      </div>

      <Input
        type="text"
        placeholder="Enter M-Pesa number"
        className="text-sm"
        icon={
          <span className="inline-flex items-center gap-3">
            <IconComponent iconName="CallIcon" size={18} color="#374151" />
            <span className="text-xl text-gray-300">|</span>
            <span className="text-sm text-gray-800">+254</span>
          </span>
        }
      />

      <h4 className="mt-6 text-sm font-semibold text-gray-800">Billing Address</h4>

      <div className="mt-3">
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger
            className="h-[50px] text-sm shadow-none data-[placeholder]:text-sm data-[placeholder]:text-gray-400"
            prefixIcon={<IconComponent iconName="Location01Icon" size={18} color="#374151" />}
          >
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kenya">Kenya</SelectItem>
            <SelectItem value="uganda">Uganda</SelectItem>
            <SelectItem value="tanzania">Tanzania</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          type="text"
          placeholder="Postcode"
          className="text-sm"
          suffixIcon={<IconComponent iconName="Calendar01Icon" size={18} color="#374151" />}
        />

        <Input
          type="text"
          placeholder="Town/City"
          className="text-sm"
          suffixIcon={<IconComponent iconName="Location01Icon" size={18} color="#374151" />}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          variant="gradient"
          className="rounded-full px-6 text-xs font-semibold text-white"
        >
          Save Details
        </Button>
      </div>
    </div>
  );
}
