'use client';
import { hugeiconsLicense } from '@hugeicons/react-pro';
import * as HugeIcons from '@hugeicons/react-pro';
import React, { useEffect, useState } from 'react';
import { Button } from '@/app/ui/form';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

hugeiconsLicense(
  '890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=',
);
export default function Page() {
  const router = useRouter();
  const newUser = useSelector((state) => state.newUser);
  const [interests, setInterests] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const getInterests = async () => {
    const response = await fetch('/auth/interests/api', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await response.json();
    setInterests(res?.interests);
  };

  useEffect(() => {
    getInterests();
  }, []);

  const addOrRemoveInterest = (value: string) => {
    if (selectedInterests.includes(value)) {
      setSelectedInterests(
        selectedInterests.filter((selectedInterest) => selectedInterest !== value),
      );
    } else {
      setSelectedInterests([...selectedInterests, value]);
    }
  };

  return (
    <>
      <div className="mb-2">
        <p className="text-xl font-black text-gray-700">Select your interests</p>
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-700">What are some of your favorite experiences?</p>
      </div>

      <div className="mb-4 inline-flex flex-wrap gap-x-2 gap-y-2">
        {interests.map((interest) => {
          const active = selectedInterests.includes(interest.id);
          return (
            <div
              key={interest.id}
              onClick={() => addOrRemoveInterest(interest.id)}
              className={clsx(
                'inline-flex w-fit cursor-pointer items-center rounded-full px-4 py-2',
                {
                  'bg-primary text-white': active,
                  'bg-gray-100': !active,
                },
              )}
            >
              <div className="mr-2">
                {React.createElement(HugeIcons[`${interest.icon}`], {
                  size: 16,
                  variant: 'twotone',
                })}
              </div>
              <span className="text-xs">{interest.name}</span>
            </div>
          );
        })}
      </div>

      <div>
        <Button block onClick={() => router.push('/auth/payments')}>
          Submit
        </Button>
      </div>
    </>
  );
}
