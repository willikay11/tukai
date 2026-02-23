'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import IconComponent from '@/app/components/iconComponent';
import { Button } from '@/components/ui/button';

type ExperienceType = 'experience' | 'itinerary';

export default function CreateExperienceType() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ExperienceType>('experience');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleContinue = () => {
    if (selectedType === 'experience') {
      router.push('/communities/create');
      return;
    }
  };

  return (
    <>
      <button className="mb-6 inline-flex items-center text-sm font-medium text-emerald-700">
        <IconComponent iconName="ArrowLeft02Icon" size={16} className="mr-1" />
        Back
      </button>

      <div className="bg-white">
        <h1 className="text-lg font-semibold text-gray-900">Create Experience</h1>
        <p className="mt-1 text-sm text-gray-500">
          Please select the type of experience you would like to create
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setSelectedType('experience')}
            className={`rounded-xl border p-4 text-left transition-colors ${
              selectedType === 'experience'
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-gray-900">Experience</p>
              <span
                className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                  selectedType === 'experience'
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {selectedType === 'experience' && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              One activity for a single or multiple days e.g., hiking, Camping, running
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('itinerary')}
            className={`rounded-xl border p-4 text-left transition-colors ${
              selectedType === 'itinerary'
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-gray-900">Itinerary</p>
              <span
                className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                  selectedType === 'itinerary'
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {selectedType === 'itinerary' && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Multiple activities involving different places over a period of days
            </p>
          </button>
        </div>

        <label className="mt-4 flex items-start gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-emerald-700"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          <span>
            By creating an experience, I agree to the{' '}
            <Link href="/terms" className="text-emerald-700 underline">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-emerald-700 underline">
              Privacy Policy
            </Link>
          </span>
        </label>

        <Button
          onClick={handleContinue}
          variant="gradient"
          className="mt-6 h-10 rounded-full px-6 text-xs text-white hover:bg-emerald-800"
          disabled={!acceptedTerms}
        >
          Continue
        </Button>
      </div>
    </>
  );
}
